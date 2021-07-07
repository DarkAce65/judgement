import logging
from enum import Enum, unique

from server.game.core import Game, GameState
from server.models.camel_model import CamelModel

logger = logging.getLogger(__name__)


@unique
class JudgementActionType(str, Enum):
    PLAY_CARD = "PLAY_CARD"


class JudgementAction(CamelModel):
    action_type: JudgementActionType


class JudgementSettings(CamelModel):
    pass


class JudgementGame(Game[JudgementAction, JudgementSettings]):
    def __init__(self) -> None:
        super().__init__(JudgementAction, JudgementSettings())

    def process_input(self, player_id: str, game_input: JudgementAction) -> None:
        logger.info("%s, %s", player_id, game_input)


class JudgementGameState(GameState[JudgementAction, JudgementSettings]):
    settings: JudgementSettings

    @staticmethod
    def from_game(game: Game[JudgementAction, JudgementSettings]) -> "JudgementGameState":
        return JudgementGameState(game_phase=game.game_phase, settings=game.settings)
