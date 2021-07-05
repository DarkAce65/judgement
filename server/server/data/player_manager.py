import uuid
from typing import Collection, Optional, Tuple

from .db import db_connection
from .player import Player


def player_exists(player_id: str) -> bool:
    cur = db_connection.cursor()
    cur.execute("SELECT 1 FROM players WHERE id = %s", (player_id,))

    return cur.fetchone() is not None


def get_player(player_id: str) -> Player:
    cur = db_connection.cursor()
    cur.execute("SELECT name FROM players WHERE id = %s", (player_id,))
    result: Optional[tuple[str]] = cur.fetchone()

    if result is None:
        raise ValueError(f"Invalid player id: {player_id}")

    (player_name,) = result

    return Player(player_id, player_name)


def get_players(player_ids: Collection[str]) -> dict[str, Player]:
    cur = db_connection.cursor()
    cur.execute("SELECT id, name FROM players WHERE id = ANY(%s)", (list(player_ids),))

    players: dict[str, Player] = {}
    for (player_id, player_name) in cur.fetchall():
        players[player_id] = Player(player_id, player_name)

    return players


def create_player(player_name: Optional[str]) -> Player:
    player = Player(str(uuid.uuid4()), player_name)

    cur = db_connection.cursor()
    cur.execute(
        "INSERT INTO players (id, name) VALUES (%s, %s)", (player.player_id, player.name)
    )

    return player


def set_player_name(player_id: str, player_name: Optional[str]) -> None:
    cur = db_connection.cursor()
    cur.execute("UPDATE players SET name=%s WHERE id = %s", (player_name, player_id))


def ensure_player_with_name(
    player_id: Optional[str] = None, player_name: Optional[str] = None
) -> Tuple[Player, bool]:
    should_propagate_name_change = False
    if player_id is None or not player_exists(player_id):
        player = create_player(player_name)
    else:
        player = get_player(player_id)
        if player.name != player_name:
            set_player_name(player_id, player_name)
            player = get_player(player_id)
            should_propagate_name_change = True

    return (player, should_propagate_name_change)
