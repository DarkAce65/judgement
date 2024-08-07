from __future__ import annotations

from abc import ABC
from enum import Enum, unique
from typing import Any, Callable, ClassVar, Generator, Literal, Optional

from server.game.card import Card, Suit
from server.game.core import GameError

from .camel_model import CamelModel
from .game import GameName, GamePlayerType, GameState

SUIT_ORDER = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS]


@unique
class JudgementPhase(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    BIDDING = "BIDDING"
    PLAYING = "PLAYING"


@unique
class JudgementActionType(str, Enum):
    UPDATE_SETTINGS = "UPDATE_SETTINGS"
    ORDER_CARDS = "ORDER_CARDS"
    BID_HANDS = "BID_HANDS"
    PLAY_CARD = "PLAY_CARD"


class JudgementAction(CamelModel, ABC):
    _types: ClassVar[dict[JudgementActionType, type]] = {}

    action_type: JudgementActionType

    def __init_subclass__(cls, action_type: JudgementActionType):
        cls._types[action_type] = cls

    @classmethod
    def __get_validators__(cls) -> Generator[Callable[..., Any], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, value: dict[str, Any]) -> JudgementAction:
        try:
            action_type = value["actionType"]
            return cls._types[action_type](**value)
        except KeyError as error:
            raise ValueError from error


class JudgementUpdateSettingsAction(
    JudgementAction, action_type=JudgementActionType.UPDATE_SETTINGS
):
    action_type: Literal[JudgementActionType.UPDATE_SETTINGS]
    num_decks: Optional[int]
    num_rounds: Optional[int]


class JudgementOrderCardsAction(
    JudgementAction, action_type=JudgementActionType.ORDER_CARDS
):
    action_type: Literal[JudgementActionType.ORDER_CARDS]
    from_index: int
    to_index: int


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
    score: int
    current_won_tricks: int
    current_bid: Optional[int] = None

    hand: list[Card]


class JudgementSettings(CamelModel):
    num_decks: int
    num_rounds: int


class JudgementGameState(GameState):
    player_type: Literal[GamePlayerType.PLAYER]

    game_name: Literal[GameName.JUDGEMENT]

    ordered_player_ids: list[int]

    settings: JudgementSettings
    phase: JudgementPhase

    pile: list[Card]

    current_round: int
    current_trick: int
    start_player_index: int
    current_turn_index: int
    player_state: JudgementPlayerState


class JudgementSpectatorGameState(GameState):
    player_type: Literal[GamePlayerType.SPECTATOR]

    game_name: Literal[GameName.JUDGEMENT]

    ordered_player_ids: list[int]

    settings: JudgementSettings
    phase: JudgementPhase

    pile: list[Card]

    current_round: int
    current_trick: int
    start_player_index: int
    current_turn_index: int
