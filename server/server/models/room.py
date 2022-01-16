from enum import Enum, unique
from typing import Optional

from server.game.core import Game

from .game import GameName, GameState
from .player import Player


@unique
class RoomState(str, Enum):
    LOBBY = "LOBBY"
    GAME = "GAME"


class Room:
    room_id: str
    room_state: RoomState
    players: list[Player]

    game_name: Optional[GameName]
    game: Optional[Game]

    def __init__(
        self,
        room_id: str,
        room_state: RoomState = RoomState.LOBBY,
        players: Optional[list[Player]] = None,
    ) -> None:
        self.room_id = room_id
        self.room_state = room_state
        self.players = players or []

        self.game_name = None
        self.game = None

    @staticmethod
    def new(room_id: str) -> "Room":
        return Room(room_id)

    @staticmethod
    def from_db(
        room_id: str,
        room_state: str,
        players: list[Player],
        game_name: Optional[str],
        game: Optional[Game],
    ) -> "Room":
        room = Room(room_id, RoomState(room_state), players)
        if game_name is not None:
            room.game_name = GameName(game_name)
        if game is not None:
            room.game = game

        return room

    def get_game_state(self, player_id: str) -> Optional[GameState]:
        return None if self.game is None else self.game.build_game_state(player_id)
