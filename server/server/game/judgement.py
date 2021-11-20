import logging
from typing import Optional

from server.data import socket_messager
from server.models.game import GameName
from server.models.judgement import (
    JudgementAction,
    JudgementBidHandsAction,
    JudgementGameState,
    JudgementPhase,
    JudgementPlayCardAction,
    JudgementPlayerState,
    JudgementSettings,
    JudgementUpdateSettingsAction,
)

from .card import Card
from .core import Game, GameError
from .decks import Decks

logger = logging.getLogger(__name__)


class JudgementGame(Game[JudgementAction]):
    phase: JudgementPhase
    settings: JudgementSettings

    decks: Decks
    pile: list[Card]

    turn: Optional[str]
    hands: dict[str, list[Card]]
    player_states: dict[str, JudgementPlayerState]

    def __init__(self, room_id: str) -> None:
        super().__init__(JudgementAction, room_id)

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
        return JudgementGameState(
            game_name=GameName.JUDGEMENT,
            game_status=self.game_status,
            settings=self.settings,
            phase=self.phase,
            pile=self.pile,
            turn=self.turn,
            player_states=self.player_states,
        )

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
                raise GameError(f"Missing card from hand: {str(card)}")

            self.player_states[player_id].hand.remove(card)
            self.pile.append(card)
