from typing import Optional, cast

from server.models.player import Player
from server.sio_app import sio

from . import db, player_manager, room_manager, socket_messager


def get_room_id_for_client(client_id: str) -> Optional[str]:
    cur = db.get_cursor()
    cur.execute(
        "SELECT room_id FROM client_player_room WHERE client_id = %s", (client_id,)
    )

    result = cast(Optional[tuple[Optional[str]]], cur.fetchone())
    if result is None:
        raise ValueError(f"Invalid client id: {client_id}")

    (room_id,) = result
    return room_id


def set_client_room(client_id: str, room_id: Optional[str]) -> None:
    cur = db.get_cursor()
    cur.execute(
        "UPDATE client_player_room SET room_id=%s WHERE client_id = %s",
        (room_id, client_id),
    )


def get_player_id_for_client(client_id: str) -> int:
    cur = db.get_cursor()
    cur.execute(
        "SELECT player_id FROM client_player_room WHERE client_id = %s", (client_id,)
    )

    result = cast(Optional[tuple[int]], cur.fetchone())
    if result is None:
        raise ValueError(f"Invalid client id: {client_id}")

    (player_id,) = result
    return player_id


def get_client_ids_for_player(player_id: int) -> set[str]:
    if not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id: {player_id}")

    cur = db.get_cursor()
    cur.execute(
        "SELECT client_id FROM client_player_room WHERE player_id = %s", (player_id,)
    )
    results = cast(list[tuple[str]], cur.fetchall())
    return {client_id for (client_id,) in results}


def get_client_ids_for_players(player_ids: set[int]) -> set[str]:
    cur = db.get_cursor()
    cur.execute(
        "SELECT client_id FROM client_player_room WHERE player_id = ANY(%s)",
        (list(player_ids),),
    )
    results = cast(list[tuple[str]], cur.fetchall())
    return {client_id for (client_id,) in results}


async def connect_player_client(player_id: int, client_id: str) -> None:
    cur = db.get_cursor()
    cur.execute(
        "INSERT INTO client_player_room(client_id, player_id) VALUES(%s, %s)",
        (client_id, player_id),
    )
    await sio.enter_room(client_id, str(player_id))


async def propagate_name_change(player: Player) -> None:
    cur = db.get_cursor()
    cur.execute(
        "SELECT DISTINCT room_id FROM client_player_room "
        "WHERE player_id = %s AND room_id IS NOT NULL",
        (player.player_id,),
    )
    results = cast(list[tuple[str]], cur.fetchall())
    room_ids = [room_id for (room_id,) in results]

    await socket_messager.emit_players([player], room_ids)


async def add_player_client_to_room(client_id: str, room_id: str) -> None:
    player_id = get_player_id_for_client(client_id)

    cur = db.get_cursor()
    cur.execute(
        "SELECT room_id FROM client_player_room "
        "WHERE client_id = %s AND room_id IS NOT NULL",
        (client_id,),
    )
    result = cast(Optional[tuple[str]], cur.fetchone())
    if result is not None:
        (old_room_id,) = result
        await sio.leave_room(client_id, old_room_id)
        await sio.leave_room(client_id, f"{old_room_id}/{player_id}")

    set_client_room(client_id, room_id)

    room_manager.add_player_to_room(player_id, room_id)
    await sio.enter_room(client_id, room_id)
    await sio.enter_room(client_id, f"{room_id}/{player_id}")


async def remove_player_client_from_room(client_id: str, room_id: str) -> None:
    player_id = get_player_id_for_client(client_id)

    cur = db.get_cursor()
    cur.execute(
        "SELECT client_id FROM client_player_room WHERE room_id = %s AND player_id = %s",
        (room_id, player_id),
    )
    results = cast(list[tuple[str]], cur.fetchall())
    for (c_id,) in results:
        await sio.leave_room(c_id, room_id)
        await sio.leave_room(c_id, f"{room_id}/{player_id}")

    cur.execute(
        "UPDATE client_player_room SET room_id=NULL "
        "WHERE room_id = %s AND player_id = %s",
        (room_id, player_id),
    )

    room_manager.drop_player_from_room(player_id, room_id)


def disconnect_player_client(client_id: str) -> None:
    cur = db.get_cursor()
    cur.execute("DELETE FROM client_player_room WHERE client_id = %s", (client_id,))
