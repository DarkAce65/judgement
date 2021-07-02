import random
import string

from . import ROOM_ID_LENGTH, player_manager
from .db import db_connection
from .player import Player
from .room import Room


def generate_id() -> str:
    return "".join(random.choices(string.ascii_uppercase, k=ROOM_ID_LENGTH))


def get_all_rooms() -> list[Room]:
    rooms: dict[str, Room] = {}

    cur = db_connection.cursor()
    cur.execute("SELECT id FROM rooms")
    for (room_id,) in cur.fetchall():
        rooms[room_id] = Room(room_id)

    cur.execute("SELECT room_id, player_id FROM room_players")
    for (room_id, player_id) in cur.fetchall():
        rooms[room_id].player_ids.add(player_id)

    return list(rooms.values())


def room_exists(room_id: str) -> bool:
    cur = db_connection.cursor()
    cur.execute("SELECT 1 FROM rooms WHERE id = %s", (room_id,))

    return cur.fetchone() is not None


def get_room(room_id: str) -> Room:
    if not room_exists(room_id):
        raise ValueError(f"Invalid room id: {room_id}")

    cur = db_connection.cursor()
    cur.execute("SELECT player_id FROM room_players WHERE room_id = %s", (room_id,))

    return Room(room_id, {player_id for (player_id,) in cur.fetchall()})


def create_room() -> Room:
    cur = db_connection.cursor()

    room_id = generate_id()
    cur.execute("SELECT 1 FROM rooms WHERE id = %s", (room_id,))
    while cur.fetchone() is not None:
        room_id = generate_id()
        cur.execute("SELECT 1 FROM rooms WHERE id = %s", (room_id,))

    room = Room(room_id)
    cur.execute("INSERT INTO rooms VALUES (%s)", (room.room_id,))

    return room


def get_players_in_room(room_id: str) -> dict[str, Player]:
    cur = db_connection.cursor()
    cur.execute("SELECT player_id FROM room_players WHERE room_id = %s", (room_id,))

    player_ids = {player_id for (player_id,) in cur.fetchall()}
    return player_manager.get_players(player_ids)


def add_player_to_room(player_id: str, room_id: str) -> Room:
    if not room_exists(room_id) or not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id ({player_id}) or room id ({room_id})")

    cur = db_connection.cursor()
    cur.execute(
        "INSERT INTO room_players VALUES (%s, %s) ON CONFLICT DO NOTHING",
        (room_id, player_id),
    )

    return get_room(room_id)


def drop_player_from_room(player_id: str, room_id: str) -> bool:
    if not room_exists(room_id) or not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id ({player_id}) or room id ({room_id})")

    cur = db_connection.cursor()
    cur.execute(
        "DELETE FROM room_players WHERE room_id = %s AND player_id = %s",
        (room_id, player_id),
    )

    cur.execute("SELECT 1 FROM room_players WHERE room_id = %s LIMIT 1", (room_id,))
    if cur.fetchone() is None:
        cur.execute("DELETE FROM rooms WHERE id = %s", (room_id,))

    return True
