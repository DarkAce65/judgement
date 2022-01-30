from typing import Optional

from .camel_model import CamelModel
from .game import GameName
from .judgement import JudgementGameState
from .room import RoomStatus

ConcreteGameState = JudgementGameState


class GameErrorMessage(CamelModel):
    error_message: str


class RoomMessage(CamelModel):
    status: RoomStatus
    players: list[str]
    game_name: Optional[GameName]
    game: Optional[ConcreteGameState]


class PlayersMessage(CamelModel):
    players: list[str]


class GameStateMessage(CamelModel):
    state: ConcreteGameState


class SetGameMessage(CamelModel):
    game_name: GameName
