import random
import string
from typing import Optional

from server.game.core import Game
from server.game.judgement import JudgementGame

from . import ROOM_ID_LENGTH, player_manager
from .db import db_connection
from .player import Player
from .room import Room, RoomState

games: dict[str, Game] = {}


def generate_id() -> str:
    return "".join(random.choices(string.ascii_uppercase, k=ROOM_ID_LENGTH))


def room_exists(room_id: str) -> bool:
    cur = db_connection.cursor()
    cur.execute("SELECT 1 FROM rooms WHERE id = %s", (room_id,))

    return cur.fetchone() is not None


def get_room(room_id: str) -> Room:
    cur = db_connection.cursor()
    cur.execute("SELECT id, room_state FROM rooms WHERE id = %s", (room_id,))
    result: Optional[tuple[str, int]] = cur.fetchone()

    if result is None:
        raise ValueError(f"Invalid room id: {room_id}")

    room_id, room_state = result
    cur.execute("SELECT player_id FROM room_players WHERE room_id = %s", (room_id,))
    results: list[tuple[str]] = cur.fetchall()
    player_ids = {player_id for (player_id,) in results}

    return Room(room_id, RoomState(room_state), player_ids)


def create_room() -> str:
    cur = db_connection.cursor()

    room_id = generate_id()
    while room_exists(room_id):
        room_id = generate_id()

    room = Room.new(room_id)

    cur.execute(
        "INSERT INTO rooms (id, room_state) VALUES (%s, %s)",
        (room.room_id, room.room_state),
    )

    return room.room_id


def delete_room(room_id: str) -> None:
    cur = db_connection.cursor()
    cur.execute("DELETE FROM rooms WHERE id = %s", (room_id,))

    del games[room_id]


def get_player_ids_in_room(room_id: str) -> set[str]:
    cur = db_connection.cursor()
    cur.execute("SELECT player_id FROM room_players WHERE room_id = %s", (room_id,))
    results: list[tuple[str]] = cur.fetchall()
    return {player_id for (player_id,) in results}


def get_players_in_room(room_id: str) -> dict[str, Player]:
    player_ids = get_player_ids_in_room(room_id)
    return player_manager.get_players(player_ids)


def add_player_to_room(player_id: str, room_id: str) -> None:
    if not room_exists(room_id) or not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id ({player_id}) or room id ({room_id})")

    cur = db_connection.cursor()
    cur.execute(
        "INSERT INTO room_players VALUES (%s, %s) ON CONFLICT DO NOTHING",
        (room_id, player_id),
    )


def drop_player_from_room(player_id: str, room_id: str) -> None:
    if not room_exists(room_id) or not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id ({player_id}) or room id ({room_id})")

    cur = db_connection.cursor()
    cur.execute(
        "DELETE FROM room_players WHERE room_id = %s AND player_id = %s",
        (room_id, player_id),
    )

    cur.execute("SELECT 1 FROM room_players WHERE room_id = %s LIMIT 1", (room_id,))
    if cur.fetchone() is None:
        delete_room(room_id)


def set_game(room_id: str, game_name: str) -> None:
    if game_name == "judgement":
        games[room_id] = JudgementGame()
