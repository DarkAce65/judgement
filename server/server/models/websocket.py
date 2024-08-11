from .camel_model import CamelModel
from .judgement import JudgementGameState, JudgementSpectatorGameState

ConcreteGameState = JudgementGameState | JudgementSpectatorGameState


class GameErrorMessage(CamelModel):
    error_message: str


class PlayersMessage(CamelModel):
    player_names: dict[int, str]


class GameStateMessage(CamelModel):
    state: ConcreteGameState
