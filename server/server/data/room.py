from enum import Enum, unique
from typing import Optional

from server.game.core import Game, GameName

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
        game_name: Optional[GameName] = None,
        game: Optional[Game] = None,
    ) -> None:
        self.room_id = room_id
        self.room_state = room_state
        self.players = players or list()

        self.game_name = game_name
        self.game = game

    @staticmethod
    def new(room_id: str) -> "Room":
        return Room(room_id)
