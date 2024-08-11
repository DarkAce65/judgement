import uuid
from typing import Collection, cast

from server.models.player import Player

from . import db


def player_exists_by_auth(player_auth_id: str) -> bool:
    cur = db.get_cursor()
    cur.execute("SELECT 1 FROM players WHERE auth_id = %s", (player_auth_id,))

    return cur.fetchone() is not None


def player_exists(player_id: int) -> bool:
    cur = db.get_cursor()
    cur.execute("SELECT 1 FROM players WHERE id = %s", (player_id,))

    return cur.fetchone() is not None


def get_player_by_auth(player_auth_id: str) -> Player:
    cur = db.get_cursor()
    cur.execute("SELECT id, name FROM players WHERE auth_id = %s", (player_auth_id,))
    result = cast(tuple[int, str] | None, cur.fetchone())

    if result is None:
        raise ValueError(f"Invalid player auth id: {player_auth_id}")

    (player_id, player_name) = result
    return Player(player_id, player_name)


def get_player(player_id: int) -> Player:
    cur = db.get_cursor()
    cur.execute("SELECT id, name FROM players WHERE id = %s", (player_id,))
    result = cast(tuple[int, str] | None, cur.fetchone())

    if result is None:
        raise ValueError(f"Invalid player id: {player_id}")

    (player_id, player_name) = result
    return Player(player_id, player_name)


def get_players(player_ids: Collection[int]) -> dict[int, Player]:
    cur = db.get_cursor()
    cur.execute("SELECT id, name FROM players WHERE id = ANY(%s)", (list(player_ids),))

    results = cast(list[tuple[int, str]], cur.fetchall())
    players: dict[int, Player] = {}
    for player_id, player_name in results:
        players[player_id] = Player(player_id, player_name)

    return players


def create_player(player_name: str) -> tuple[Player, str]:
    player_auth_id = str(uuid.uuid4())
    cur = db.get_cursor()
    cur.execute(
        "INSERT INTO players(auth_id, name) VALUES(%s, %s) RETURNING id",
        (player_auth_id, player_name),
    )
    result = cast(tuple[int], cur.fetchone())

    player = Player(result[0], player_name)
    return (player, player_auth_id)


def set_player_name(player_id: int, player_name: str) -> None:
    cur = db.get_cursor()
    cur.execute("UPDATE players SET name = %s WHERE id = %s", (player_name, player_id))
