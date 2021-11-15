import logging
from abc import ABC
from enum import Enum, unique
from typing import Any, Literal, Optional

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


class JudgementAction(CamelModel, ABC):
    _types: dict[JudgementActionType, type] = {}

    action_type: JudgementActionType

    def __init_subclass__(cls, action_type: JudgementActionType):
        cls._types[action_type] = cls

    @classmethod
    def __get_validators__(cls):  # type: ignore
        yield cls.validate

    @classmethod
    def validate(cls, values: dict[str, Any]) -> "JudgementAction":
        try:
            action_type = values["actionType"]
            return cls._types[action_type](**values)
        except KeyError as error:
            raise ValueError from error


class JudgementPlayCardAction(JudgementAction, action_type=JudgementActionType.PLAY_CARD):
    action_type: Literal[JudgementActionType.PLAY_CARD]
    card: str


class JudgementPlayerState(CamelModel):
    score: int = 0
    current_hands: int = 0
    current_bid: int = 0

    hand: list[Card] = []


class JudgementSettings(CamelModel):
    pass


class JudgementGameState(GameState[JudgementAction]):
    settings: JudgementSettings

    phase: JudgementPhase

    pile: list[Card]

    turn: Optional[str]
    player_states: dict[str, JudgementPlayerState]

    @staticmethod
    def from_game(game: Game[JudgementAction]) -> "JudgementGameState":
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


class JudgementGame(Game[JudgementAction]):
    phase: JudgementPhase
    settings: JudgementSettings

    decks: Decks
    pile: list[Card]

    turn: Optional[str]
    hands: dict[str, list[Card]]
    player_states: dict[str, JudgementPlayerState]

    def __init__(self) -> None:
        super().__init__(JudgementAction)

        self.phase = JudgementPhase.BIDDING
        self.settings = JudgementSettings()

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
        logger.debug("player_id: %s, action: %s", player_id, repr(game_input))
        if isinstance(game_input, JudgementPlayCardAction):
            try:
                card = Card.from_str(game_input.card)
            except ValueError as error:
                raise GameError("Invalid card", game_input.card) from error
            self.pile.append(card)
