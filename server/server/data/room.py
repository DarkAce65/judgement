from enum import Enum, unique
from typing import Optional

from server.game.core import Game, GameName, GameState

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
        self.players = players or []

        self.game_name = game_name
        self.game = game

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
        return Room(
            room_id,
            RoomState(room_state),
            players,
            None if game_name is None else GameName(game_name),
            game,
        )

    def get_game_state(self) -> Optional[GameState]:
        return None if self.game is None else self.game.build_game_state()
