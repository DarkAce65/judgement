from typing import Optional, Union

from .camel_model import CamelModel
from .game import GameName
from .judgement import JudgementGameState, JudgementSpectatorGameState
from .room import RoomStatus

ConcreteGameState = Union[JudgementGameState, JudgementSpectatorGameState]


class GameErrorMessage(CamelModel):
    error_message: str


class RoomMessage(CamelModel):
    room_id: str
    status: RoomStatus
    ordered_player_ids: list[int]
    game_name: Optional[GameName]
    game: Optional[ConcreteGameState]


class PlayersMessage(CamelModel):
    player_names: dict[int, str]


class GameStateMessage(CamelModel):
    state: ConcreteGameState


class SetGameMessage(CamelModel):
    game_name: GameName
