from __future__ import annotations

from enum import Enum, unique
from typing import Mapping, Optional

from server.game.core import Game

from .game import GameName, GameState


@unique
class RoomStatus(str, Enum):
    LOBBY = "LOBBY"
    GAME = "GAME"


class Room:
    room_id: str
    room_status: RoomStatus
    ordered_player_ids: list[int]

    game_name: Optional[GameName]
    game: Optional[Game]

    def __init__(
        self,
        room_id: str,
        room_status: RoomStatus,
        ordered_player_ids: list[int],
    ) -> None:
        self.room_id = room_id
        self.room_status = room_status
        self.ordered_player_ids = ordered_player_ids

        self.game_name = None
        self.game = None

    @staticmethod
    def new(room_id: str) -> Room:
        return Room(room_id, RoomStatus.LOBBY, [])

    @staticmethod
    def from_db(
        room_id: str,
        room_status: str,
        ordered_player_ids: list[int],
        game_name: Optional[str],
        game: Optional[Game],
    ) -> Room:
        room = Room(room_id, RoomStatus(room_status), ordered_player_ids)
        if game_name is not None:
            room.game_name = GameName(game_name)
        if game is not None:
            room.game = game

        return room

    def get_game_states(self, player_ids: set[int]) -> Optional[Mapping[int, GameState]]:
        return None if self.game is None else self.game.build_game_states(player_ids)
