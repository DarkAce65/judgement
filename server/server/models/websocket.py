from typing import Optional

from server.data.room import RoomState
from server.game.core import GameName, GameState

from .camel_model import CamelModel


class RoomMessage(CamelModel):
    state: RoomState
    players: list[str]
    game_name: Optional[GameName]
    game: Optional[GameState]


class PlayersMessage(CamelModel):
    players: list[str]


class SetGameMessage(CamelModel):
    game_name: GameName
