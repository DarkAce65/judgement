from typing import Optional

from server.data.room import RoomState
from server.game.core import GameName

from .camel_model import CamelModel
from .judgement import JudgementGameState

ConcreteGameState = JudgementGameState


class GameErrorMessage(CamelModel):
    error_message: str


class RoomMessage(CamelModel):
    state: RoomState
    players: list[str]
    game_name: Optional[GameName]
    game: Optional[ConcreteGameState]


class PlayersMessage(CamelModel):
    players: list[str]


class GameStateMessage(CamelModel):
    state: ConcreteGameState


class SetGameMessage(CamelModel):
    game_name: GameName
