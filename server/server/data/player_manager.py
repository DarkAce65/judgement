from collections.abc import Iterable
from typing import Optional, Tuple

from .player import Player

players: dict[str, Player] = {}


def player_exists(player_id: str) -> bool:
    return player_id in players


def get_player(player_id: str) -> Player:
    if not player_exists(player_id):
        raise ValueError(f"Invalid player id: {player_id}")

    return players[player_id]


def get_players(player_ids: Iterable[str]) -> dict[str, Player]:
    return {player_id: get_player(player_id) for player_id in player_ids}


def ensure_player_with_name(
    player_id: Optional[str] = None, player_name: Optional[str] = None
) -> Tuple[Player, bool]:
    should_propagate_name_change = False
    if player_id is None or not player_exists(player_id):
        player = Player(player_name)
        players[player.player_id] = player
    else:
        player = get_player(player_id)
        if player.name != player_name:
            should_propagate_name_change = True

        player.name = player_name

    return (player, should_propagate_name_change)
