from typing import Optional

from server.data import room_manager
from server.sio_app import sio

from . import player_manager, socket_messager
from .db import db_connection


def insert_client_mapping(client_id: str, player_id: str, room_id: str = None) -> None:
    cur = db_connection.cursor()
    cur.execute(
        "INSERT INTO client_player_room VALUES (%s, %s, %s)",
        (client_id, player_id, room_id),
    )


def set_client_room(client_id: str, room_id: Optional[str]) -> None:
    cur = db_connection.cursor()
    cur.execute(
        "UPDATE client_player_room SET room_id=%s WHERE client_id = %s",
        (room_id, client_id),
    )


def get_player_id_for_client(client_id: str) -> str:
    cur = db_connection.cursor()
    cur.execute(
        "SELECT player_id FROM client_player_room WHERE client_id = %s", (client_id,)
    )

    result: Optional[tuple[str]] = cur.fetchone()
    if result is None:
        raise ValueError(f"Invalid client id: {client_id}")

    (player_id,) = result
    return player_id


def get_client_ids_for_player(player_id: str) -> set[str]:
    if not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id: {player_id}")

    cur = db_connection.cursor()
    cur.execute(
        "SELECT client_id FROM client_player_room WHERE player_id = %s", (player_id,)
    )
    results: list[tuple[str]] = cur.fetchall()
    return {client_id for (client_id,) in results}


def get_client_ids_for_players(player_ids: set[str]) -> set[str]:
    cur = db_connection.cursor()
    cur.execute(
        "SELECT client_id FROM client_player_room WHERE player_id = ANY(%s)",
        (list(player_ids),),
    )
    results: list[tuple[str]] = cur.fetchall()
    return {client_id for (client_id,) in results}


def connect_player_client(player_id: str, client_id: str) -> None:
    insert_client_mapping(client_id, player_id)
    sio.enter_room(client_id, player_id)


async def propagate_name_change(player_id: str) -> None:
    cur = db_connection.cursor()
    cur.execute(
        "SELECT DISTINCT room_id FROM client_player_room "
        "WHERE player_id = %s AND room_id IS NOT NULL",
        (player_id,),
    )
    results: list[tuple[str]] = cur.fetchall()
    room_ids = {room_id for (room_id,) in results}

    for room_id in room_ids:
        await socket_messager.emit_players(room_id)


def add_player_client_to_room(client_id: str, room_id: str) -> None:
    player_id = get_player_id_for_client(client_id)

    cur = db_connection.cursor()
    cur.execute(
        "SELECT room_id FROM client_player_room "
        "WHERE client_id = %s AND room_id IS NOT NULL",
        (client_id,),
    )
    result: Optional[tuple[str]] = cur.fetchone()
    if result is not None:
        (old_room_id,) = result
        sio.leave_room(client_id, old_room_id)
        sio.leave_room(client_id, f"{old_room_id}/{player_id}")

    set_client_room(client_id, room_id)

    room_manager.add_player_to_room(player_id, room_id)
    sio.enter_room(client_id, room_id)
    sio.enter_room(client_id, f"{room_id}/{player_id}")


def remove_player_client_from_room(client_id: str, room_id: str) -> None:
    player_id = get_player_id_for_client(client_id)

    cur = db_connection.cursor()
    cur.execute(
        "SELECT client_id FROM client_player_room WHERE room_id = %s AND player_id = %s",
        (room_id, player_id),
    )
    results: list[tuple[str]] = cur.fetchall()
    for (c_id,) in results:
        sio.leave_room(c_id, room_id)
        sio.leave_room(c_id, f"{room_id}/{player_id}")

    cur.execute(
        "UPDATE client_player_room SET room_id=NULL "
        "WHERE room_id = %s AND player_id = %s",
        (room_id, player_id),
    )

    room_manager.drop_player_from_room(player_id, room_id)


def disconnect_player_client(client_id: str) -> None:
    cur = db_connection.cursor()
    cur.execute("DELETE FROM client_player_room WHERE client_id = %s", (client_id,))
