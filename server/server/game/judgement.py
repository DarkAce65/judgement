import logging
from enum import Enum, unique
from typing import Any, Optional

from pydantic import root_validator

from server.models.camel_model import CamelModel

from .card import Card
from .core import Game, GameError, GameName, GameState
from .decks import Decks

logger = logging.getLogger(__name__)


@unique
class JudgementPhase(str, Enum):
    BIDDING = "BIDDING"
    PLAYING = "PLAYING"


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


class JudgementPlayerState(CamelModel):
    score: int = 0
    current_hands: int = 0
    current_bid: int = 0

    hand: list[Card] = []


class JudgementSettings(CamelModel):
    pass


class JudgementGameState(GameState[JudgementAction, JudgementSettings]):
    settings: JudgementSettings

    phase: JudgementPhase

    pile: list[Card]

    turn: Optional[str]
    player_states: dict[str, JudgementPlayerState]

    @staticmethod
    def from_game(game: Game[JudgementAction, JudgementSettings]) -> "JudgementGameState":
        if not isinstance(game, JudgementGame):
            raise ValueError

        return JudgementGameState(
            game_name=GameName.JUDGEMENT,
            game_status=game.game_status,
            settings=game.settings,
            phase=game.phase,
            pile=game.pile,
            turn=game.turn,
            player_states=game.player_states,
        )


class JudgementGame(Game[JudgementAction, JudgementSettings]):
    phase: JudgementPhase

    decks: Decks
    pile: list[Card]

    turn: Optional[str]
    hands: dict[str, list[Card]]
    player_states: dict[str, JudgementPlayerState]

    def __init__(self) -> None:
        super().__init__(JudgementAction, JudgementSettings())

        self.phase = JudgementPhase.BIDDING

        self.decks = Decks()
        self.pile = []

        self.turn = None
        self.player_states = {}

    def start_game(self) -> None:
        super().start_game()

        self.turn = self.players[0].player_id
        self.player_states = {
            player.player_id: JudgementPlayerState() for player in self.players
        }

    def build_game_state(self) -> JudgementGameState:
        return JudgementGameState.from_game(self)

    def process_input(self, player_id: str, game_input: JudgementAction) -> None:
        logger.info("%s, %s", player_id, game_input)
        if game_input.action_type == JudgementActionType.PLAY_CARD:
            assert game_input.card is not None
            try:
                card = Card.from_str(game_input.card)
            except ValueError as error:
                raise GameError("Invalid card", game_input.card) from error
            self.pile.append(card)
