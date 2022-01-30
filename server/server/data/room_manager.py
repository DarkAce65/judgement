import random
import string
from typing import Optional, cast

from server.game.core import Game
from server.game.judgement import JudgementGame
from server.models.game import GameName
from server.models.player import Player
from server.models.room import Room, RoomStatus

from . import ROOM_ID_LENGTH, db, player_manager

games: dict[str, Game] = {}


def generate_id() -> str:
    return "".join(random.choices(string.ascii_uppercase, k=ROOM_ID_LENGTH))


def room_exists(room_id: str) -> bool:
    cur = db.get_cursor()
    cur.execute("SELECT 1 FROM rooms WHERE id = %s", (room_id,))

    return cur.fetchone() is not None


def get_game_for_room(room_id: str) -> Optional[Game]:
    return games.get(room_id, None)


def get_room(room_id: str) -> Room:
    cur = db.get_cursor()
    cur.execute("SELECT id, room_status, game_name FROM rooms WHERE id = %s", (room_id,))
    result = cast(Optional[tuple[str, str, Optional[str]]], cur.fetchone())

    if result is None:
        raise ValueError(f"Invalid room id: {room_id}")

    room_id, room_status, game_name = result
    player_ids = player_manager.get_player_ids_for_room(room_id)
    game = get_game_for_room(room_id)

    return Room.from_db(room_id, room_status, player_ids, game_name, game)


def create_room() -> str:
    cur = db.get_cursor()

    room_id = generate_id()
    while room_exists(room_id):
        room_id = generate_id()

    room = Room.new(room_id)

    cur.execute(
        "INSERT INTO rooms(id, room_status) VALUES(%s, %s)",
        (room.room_id, room.room_status),
    )

    return room.room_id


def delete_room(room_id: str) -> None:
    cur = db.get_cursor()
    cur.execute("DELETE FROM rooms WHERE id = %s", (room_id,))

    if room_id in games:
        del games[room_id]


def get_player_ids_in_room(room_id: str) -> list[int]:
    cur = db.get_cursor()
    cur.execute(
        "SELECT player_id FROM room_players "
        "WHERE room_id = %s "
        "ORDER BY order_index DESC",
        (room_id,),
    )
    results = cast(list[tuple[int]], cur.fetchall())
    return [player_id for (player_id,) in results]


def get_players_in_room(room_id: str) -> dict[int, Player]:
    player_ids = get_player_ids_in_room(room_id)
    return player_manager.get_players(player_ids)


def add_player_to_room(player_id: int, room_id: str) -> None:
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

    if room_id in games and not games[room_id].is_in_game(player_id):
        games[room_id].add_player(player_id)


def drop_player_from_room(player_id: int, room_id: str) -> None:
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
    elif room_id in games and games[room_id].is_in_game(player_id):
        games[room_id].remove_player(player_id)


def set_game(room_id: str, game_name: GameName) -> None:
    cur = db.get_cursor()

    cur.execute("SELECT room_status FROM rooms WHERE id = %s", (room_id,))
    result = cast(Optional[tuple[str]], cur.fetchone())
    if result is None:
        raise ValueError(f"Invalid room id ({room_id})")
    if RoomStatus(result[0]) != RoomStatus.LOBBY:
        raise ValueError("Cannot change the game for a room which has already started")

    cur.execute(
        "UPDATE rooms SET game_name=%s WHERE id = %s",
        (game_name, room_id),
    )


def initialize_game(room_id: str) -> None:
    if room_id in games:
        raise ValueError("Room already has a game configured")

    room = get_room(room_id)

    if room.game_name is None:
        raise ValueError("Cannot start game - no game selected")

    if room.game_name == GameName.JUDGEMENT:
        game = JudgementGame(room_id)
    else:
        raise ValueError(f"Unrecognized game name ({room.game_name})")

    for player_id in room.ordered_player_ids:
        game.add_player(player_id)

    games[room_id] = game
    cur = db.get_cursor()
    cur.execute(
        "UPDATE rooms SET room_status=%s WHERE id = %s", (RoomStatus.GAME, room_id)
    )


async def start_game(room_id: str) -> None:
    if not room_exists(room_id):
        raise ValueError(f"Invalid room id ({room_id})")

    if room_id not in games:
        raise ValueError("No game selected")

    await games[room_id].start_game()
