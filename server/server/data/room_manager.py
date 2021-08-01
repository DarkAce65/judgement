import random
import string
from typing import Optional, cast

from server.game.core import Game, GameName
from server.game.judgement import JudgementGame

from . import ROOM_ID_LENGTH, db, player_manager
from .player import Player
from .room import Room, RoomState

games: dict[str, Game] = {}


def generate_id() -> str:
    return "".join(random.choices(string.ascii_uppercase, k=ROOM_ID_LENGTH))


def room_exists(room_id: str) -> bool:
    cur = db.get_cursor()
    cur.execute("SELECT 1 FROM rooms WHERE id = %s", (room_id,))

    return cur.fetchone() is not None


def get_room(room_id: str) -> Room:
    cur = db.get_cursor()
    cur.execute("SELECT id, room_state, game_name FROM rooms WHERE id = %s", (room_id,))
    result = cast(Optional[tuple[str, str, str]], cur.fetchone())

    if result is None:
        raise ValueError(f"Invalid room id: {room_id}")

    room_id, room_state, game_name = result
    players = player_manager.get_players_for_room(room_id)

    return Room(
        room_id,
        RoomState(room_state),
        players,
        GameName(game_name),
        games.get(room_id, None),
    )


def create_room() -> str:
    cur = db.get_cursor()

    room_id = generate_id()
    while room_exists(room_id):
        room_id = generate_id()

    room = Room.new(room_id)

    cur.execute(
        "INSERT INTO rooms(id, room_state) VALUES(%s, %s)",
        (room.room_id, room.room_state),
    )

    return room.room_id


def delete_room(room_id: str) -> None:
    cur = db.get_cursor()
    cur.execute("DELETE FROM rooms WHERE id = %s", (room_id,))

    if room_id in games:
        del games[room_id]


def get_player_ids_in_room(room_id: str) -> set[str]:
    cur = db.get_cursor()
    cur.execute("SELECT player_id FROM room_players WHERE room_id = %s", (room_id,))
    results = cast(list[tuple[str]], cur.fetchall())
    return {player_id for (player_id,) in results}


def get_players_in_room(room_id: str) -> dict[str, Player]:
    player_ids = get_player_ids_in_room(room_id)
    return player_manager.get_players(player_ids)


def add_player_to_room(player_id: str, room_id: str) -> None:
    if not room_exists(room_id) or not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id ({player_id}) or room id ({room_id})")

    cur = db.get_cursor()
    cur.execute(
        "SELECT order_index FROM room_players "
        "WHERE room_id = %s "
        "ORDER BY order_index DESC "
        "LIMIT 1",
        (room_id,),
    )
    result = cast(Optional[tuple[int]], cur.fetchone())
    order_index = 0 if result is None else result[0] + 1
    cur.execute(
        "INSERT INTO room_players(room_id, player_id, order_index) "
        "VALUES(%s, %s, %s) "
        "ON CONFLICT DO NOTHING",
        (room_id, player_id, order_index),
    )


def drop_player_from_room(player_id: str, room_id: str) -> None:
    if not room_exists(room_id) or not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id ({player_id}) or room id ({room_id})")

    cur = db.get_cursor()
    cur.execute(
        "DELETE FROM room_players WHERE room_id = %s AND player_id = %s",
        (room_id, player_id),
    )

    cur.execute("SELECT 1 FROM room_players WHERE room_id = %s LIMIT 1", (room_id,))
    if cur.fetchone() is None:
        delete_room(room_id)


def set_game(room_id: str, game_name: GameName) -> None:
    cur = db.get_cursor()
    cur.execute(
        "UPDATE rooms SET game_name=%s WHERE id = %s",
        (game_name, room_id),
    )

    cur.execute("SELECT room_state FROM rooms WHERE id = %s", (room_id,))
    result = cast(Optional[tuple[str]], cur.fetchone())
    if result is None:
        raise ValueError(f"Invalid room id ({room_id})")
    if RoomState(result[0]) != RoomState.LOBBY:
        raise ValueError("Cannot change the game for a room which has already started")

    cur.execute(
        "UPDATE rooms SET game_name=%s WHERE id = %s",
        (game_name, room_id),
    )


def start_game(room_id: str) -> None:
    if not room_exists(room_id):
        raise ValueError(f"Invalid room id ({room_id})")

    cur = db.get_cursor()

    cur.execute("SELECT room_state, game_name FROM rooms WHERE id = %s", (room_id,))
    result = cast(tuple[str, str], cur.fetchone())
    game_name = GameName(result[1])

    if game_name == GameName.JUDGEMENT:
        games[room_id] = JudgementGame()
    else:
        raise ValueError(f"Unknown game name ({game_name})")

    cur.execute(
        "UPDATE rooms SET room_state=%s WHERE id = %s",
        (RoomState.GAME, room_id),
    )
