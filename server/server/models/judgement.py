from abc import ABC
from enum import Enum, unique
from typing import Any, Literal, Optional

from server.game.card import Card, Suit
from server.game.core import GameError

from .camel_model import CamelModel
from .game import GameState

SUIT_ORDER = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS]


@unique
class JudgementPhase(str, Enum):
    BIDDING = "BIDDING"
    PLAYING = "PLAYING"


@unique
class JudgementActionType(str, Enum):
    UPDATE_SETTINGS = "UPDATE_SETTINGS"
    BID_HANDS = "BID_HANDS"
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


class JudgementUpdateSettingsAction(
    JudgementAction, action_type=JudgementActionType.UPDATE_SETTINGS
):
    action_type: Literal[JudgementActionType.UPDATE_SETTINGS]
    num_decks: Optional[int]
    rounds: Optional[int]


class JudgementBidHandsAction(JudgementAction, action_type=JudgementActionType.BID_HANDS):
    action_type: Literal[JudgementActionType.BID_HANDS]
    num_hands: int


class JudgementPlayCardAction(JudgementAction, action_type=JudgementActionType.PLAY_CARD):
    action_type: Literal[JudgementActionType.PLAY_CARD]
    card: str

    def get_card(self) -> Card:
        try:
            return Card.from_str(self.card)
        except ValueError as error:
            raise GameError(f"Invalid card: {self.card}") from error


class JudgementPlayerState(CamelModel):
    score: int = 0
    current_hands: int = 0
    current_bid: int = 0

    hand: list[Card] = []


class JudgementSettings(CamelModel):
    num_decks: int = 1
    rounds: int = 5


class JudgementGameState(GameState):
    settings: JudgementSettings

    phase: JudgementPhase

    pile: list[Card]

    current_round: int
    current_turn: int
    player_states: dict[str, JudgementPlayerState]
