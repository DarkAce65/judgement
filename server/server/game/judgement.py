import logging
from enum import Enum, unique

from server.models.camel_model import CamelModel

from .card import Card
from .core import Game, GameState
from .decks import Decks

logger = logging.getLogger(__name__)


@unique
class JudgementActionType(str, Enum):
    PLAY_CARD = "PLAY_CARD"


class JudgementAction(CamelModel):
    action_type: JudgementActionType


class JudgementSettings(CamelModel):
    pass


class JudgementGameState(GameState[JudgementAction, JudgementSettings]):
    settings: JudgementSettings

    # TODO: Convert to deque[Card] when https://github.com/samuelcolvin/pydantic/pull/2811 is merged  # pylint: disable=fixme
    deck: list[Card]

    @staticmethod
    def from_game(game: Game[JudgementAction, JudgementSettings]) -> "JudgementGameState":
        if not isinstance(game, JudgementGame):
            raise ValueError

        return JudgementGameState(
            game_phase=game.game_phase,
            settings=game.settings,
            deck=list(game.decks.cards),
        )


class JudgementGame(Game[JudgementAction, JudgementSettings]):
    decks: Decks

    def __init__(self) -> None:
        super().__init__(JudgementAction, JudgementSettings())

        self.decks = Decks()

    def get_player_message(self) -> JudgementGameState:
        return JudgementGameState.from_game(self)

    def process_input(self, player_id: str, game_input: JudgementAction) -> None:
        logger.info("%s, %s", player_id, game_input)
