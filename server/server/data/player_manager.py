import uuid
from typing import Collection, Optional, Tuple, cast

from server.models.player import Player, PlayerWithAuth

from . import db


def player_exists_for_auth(player_auth_id: str) -> bool:
    cur = db.get_cursor()
    cur.execute("SELECT 1 FROM players WHERE auth_id = %s", (player_auth_id,))

    return cur.fetchone() is not None


def get_player_with_auth(player_auth_id: str) -> PlayerWithAuth:
    cur = db.get_cursor()
    cur.execute("SELECT id, name FROM players WHERE auth_id = %s", (player_auth_id,))
    result = cast(Optional[tuple[int, str]], cur.fetchone())

    if result is None:
        raise ValueError(f"Invalid player_auth_id: {player_auth_id}")

    (player_id, player_name) = result
    return PlayerWithAuth(player_id, player_name, player_auth_id)


def player_exists(player_id: int) -> bool:
    cur = db.get_cursor()
    cur.execute("SELECT 1 FROM players WHERE id = %s", (player_id,))

    return cur.fetchone() is not None


def get_player(player_id: int) -> Player:
    cur = db.get_cursor()
    cur.execute("SELECT name FROM players WHERE id = %s", (player_id,))
    result = cast(Optional[tuple[str]], cur.fetchone())

    if result is None:
        raise ValueError(f"Invalid player id: {player_id}")

    (player_name,) = result

    return Player(player_id, player_name)


def get_players(player_ids: Collection[int]) -> dict[int, Player]:
    cur = db.get_cursor()
    cur.execute("SELECT id, name FROM players WHERE id = ANY(%s)", (list(player_ids),))

    results = cast(list[tuple[int, str]], cur.fetchall())
    players: dict[int, Player] = {}
    for player_id, player_name in results:
        players[player_id] = Player(player_id, player_name)

    return players


def get_player_ids_for_room(room_id: str) -> list[int]:
    cur = db.get_cursor()
    cur.execute(
        "SELECT players.id FROM players "
        "INNER JOIN room_players "
        "ON players.id = room_players.player_id "
        "WHERE room_id = %s "
        "ORDER BY room_players.order_index ASC",
        (room_id,),
    )

    results = cast(list[tuple[int]], cur.fetchall())
    player_ids: list[int] = []
    for (player_id,) in results:
        player_ids.append(player_id)

    return player_ids


def get_players_for_room(room_id: str) -> list[Player]:
    cur = db.get_cursor()
    cur.execute(
        "SELECT players.id, players.name FROM players "
        "INNER JOIN room_players "
        "ON players.id = room_players.player_id "
        "WHERE room_id = %s "
        "ORDER BY room_players.order_index ASC",
        (room_id,),
    )

    results = cast(list[tuple[int, str]], cur.fetchall())
    players: list[Player] = []
    for player_id, player_name in results:
        players.append(Player(player_id, player_name))

    return players


def create_player(player_name: str) -> PlayerWithAuth:
    player_auth_id = str(uuid.uuid4())
    cur = db.get_cursor()
    cur.execute(
        "INSERT INTO players(auth_id, name) VALUES(%s, %s) RETURNING id",
        (player_auth_id, player_name),
    )
    result = cast(tuple[int], cur.fetchone())
    player = PlayerWithAuth(result[0], player_name, player_auth_id)

    return player


def set_player_name(player_id: int, player_name: str) -> None:
    cur = db.get_cursor()
    cur.execute("UPDATE players SET name = %s WHERE id = %s", (player_name, player_id))


def ensure_player_with_name(
    player_name: str, player_auth_id: Optional[str] = None
) -> Tuple[PlayerWithAuth, bool]:
    should_propagate_name_change = False
    if player_auth_id is None or not player_exists_for_auth(player_auth_id):
        player = create_player(player_name)
    else:
        player = get_player_with_auth(player_auth_id)
        if player.name != player_name:
            set_player_name(player.player_id, player_name)
            player.name = player_name
            should_propagate_name_change = True

    return (player, should_propagate_name_change)
