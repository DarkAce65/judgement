from typing import Annotated

from pydantic import Field

from .camel_model import CamelModel
from .judgement import JudgementGameState, JudgementSpectatorGameState

ConcreteGameState = JudgementGameState | JudgementSpectatorGameState


class GameErrorMessage(CamelModel):
    error_message: str


class PlayersMessage(CamelModel):
    player_names: dict[int, str]


class GameStateMessage(CamelModel):
    state: Annotated[ConcreteGameState, Field(title="Concrete game state")]
