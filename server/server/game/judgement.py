import logging
from abc import ABC
from enum import Enum, unique
from typing import Any, Literal, Optional

from server.models.camel_model import CamelModel

from .card import Card, Suit
from .core import Game, GameError, GameName, GameState
from .decks import Decks

SUIT_ORDER = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS]


logger = logging.getLogger(__name__)


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
            raise GameError("Invalid card", self.card) from error


class JudgementPlayerState(CamelModel):
    score: int = 0
    current_hands: int = 0
    current_bid: int = 0

    hand: list[Card] = []


class JudgementSettings(CamelModel):
    num_decks: int = 0
    rounds: int = 0


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

        if isinstance(game_input, JudgementUpdateSettingsAction):
            if game_input.num_decks:
                self.settings.num_decks = game_input.num_decks
            if game_input.rounds:
                self.settings.rounds = game_input.rounds
        elif isinstance(game_input, JudgementBidHandsAction):
            self.player_states[player_id].current_bid = game_input.num_hands
        elif isinstance(game_input, JudgementPlayCardAction):
            card = game_input.get_card()
            if card not in self.player_states[player_id].hand:
                raise GameError("Missing card from hand", str(card))

            self.pile.append(card)
