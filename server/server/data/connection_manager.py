from server.data import room_manager
from server.sio_app import sio

from . import player_manager, socket_messager
from .db import db_connection, insert_client_mapping, set_client_room


def get_player_id_for_client(client_id: str) -> str:
    cur = db_connection.cursor()
    cur.execute(
        "SELECT player_id FROM client_player_room WHERE client_id = ?", (client_id,)
    )

    (player_id,) = cur.fetchone()
    if player_id is None:
        raise ValueError(f"Invalid client id: {client_id}")

    return player_id


def get_client_ids_for_player(player_id: str) -> set[str]:
    if not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id: {player_id}")

    cur = db_connection.cursor()
    cur.execute(
        "SELECT client_id FROM client_player_room WHERE player_id = ?", (player_id,)
    )
    return {client_id for (client_id,) in cur.fetchall()}


def get_client_ids_for_players(player_ids: set[str]) -> set[str]:
    cur = db_connection.cursor()
    cur.execute(
        "SELECT client_id FROM client_player_room WHERE player_id IN ?", (player_ids,)
    )
    return {client_id for (client_id,) in cur.fetchall()}


def connect_player_client(player_id: str, client_id: str) -> None:
    insert_client_mapping(client_id, player_id)
    sio.enter_room(client_id, player_id)


async def propagate_name_change(player_id: str) -> None:
    cur = db_connection.cursor()
    cur.execute(
        "SELECT DISTINCT room_id FROM client_player_room "
        "WHERE player_id = ? AND room_id IS NOT NULL",
        (player_id,),
    )
    room_ids = {room_id for (room_id,) in cur.fetchall()}

    for room_id in room_ids:
        await socket_messager.emit_players(room_id)


def add_player_client_to_room(client_id: str, room_id: str) -> None:
    player_id = get_player_id_for_client(client_id)

    cur = db_connection.cursor()
    cur.execute(
        "SELECT room_id FROM client_player_room "
        "WHERE client_id = ? AND room_id IS NOT NULL",
        (client_id,),
    )
    old_room_id = cur.fetchone()
    if old_room_id is not None:
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
        "SELECT client_id FROM client_player_room WHERE room_id = ? AND player_id = ?",
        (room_id, player_id),
    )
    for (c_id,) in cur.fetchall():
        sio.leave_room(c_id, room_id)
        sio.leave_room(c_id, f"{room_id}/{player_id}")

    cur.execute(
        "UPDATE client_player_room SET room_id=NULL "
        "WHERE room_id = ? AND player_id = ?",
        (room_id, player_id),
    )

    room_manager.drop_player_from_room(player_id, room_id)


def disconnect_player_client(client_id: str) -> None:
    cur = db_connection.cursor()
    cur.execute("DELETE FROM client_player_room WHERE client_id = ?", (client_id,))
