import logging
from enum import Enum, unique
from typing import Any, Optional

from pydantic import root_validator

from server.models.camel_model import CamelModel

from .card import Card
from .core import Game, GameName, GameState
from .decks import Decks

logger = logging.getLogger(__name__)


@unique
class JudgementActionType(str, Enum):
    PLAY_CARD = "PLAY_CARD"


class JudgementAction(CamelModel):
    action_type: JudgementActionType
    card: Optional[str]

    @root_validator(pre=False)
    @classmethod
    def validate_data(cls, values: dict[str, Any]) -> dict[str, Any]:
        if values["action_type"] == JudgementActionType.PLAY_CARD:
            if not values["card"]:
                raise ValueError("No card provided")

        return values


class JudgementScore(CamelModel):
    score: int = 0
    current_hands: int = 0
    current_bid: int = 0


class JudgementSettings(CamelModel):
    pass


class JudgementGameState(GameState[JudgementAction, JudgementSettings]):
    settings: JudgementSettings

    pile: list[Card]

    turn: Optional[str]
    hands: dict[str, list[Card]]
    scoring: dict[str, JudgementScore]

    @staticmethod
    def from_game(game: Game[JudgementAction, JudgementSettings]) -> "JudgementGameState":
        if not isinstance(game, JudgementGame):
            raise ValueError

        return JudgementGameState(
            game_name=GameName.JUDGEMENT,
            game_phase=game.game_phase,
            settings=game.settings,
            pile=game.pile,
            turn=game.turn,
            hands=game.hands,
            scoring=game.scoring,
        )


class JudgementGame(Game[JudgementAction, JudgementSettings]):
    decks: Decks
    pile: list[Card]

    turn: Optional[str]
    hands: dict[str, list[Card]]
    scoring: dict[str, JudgementScore]

    def __init__(self) -> None:
        super().__init__(JudgementAction, JudgementSettings())

        self.decks = Decks()
        self.pile = []

        self.turn = None
        self.hands = {}
        self.scoring = {}

    def start_game(self) -> None:
        super().start_game()

        self.turn = self.players[0].player_id
        self.hands = {player.player_id: [] for player in self.players}
        self.scoring = {player.player_id: JudgementScore() for player in self.players}

    def build_game_state(self) -> JudgementGameState:
        return JudgementGameState.from_game(self)

    def process_input(self, player_id: str, game_input: JudgementAction) -> None:
        logger.info("%s, %s", player_id, game_input)
        if game_input.action_type == JudgementActionType.PLAY_CARD:
            assert game_input.card is not None
            self.pile.append(Card.from_str(game_input.card))
