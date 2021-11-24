import asyncio
import logging

from server.data import socket_messager
from server.models.game import GameName, GamePhase
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

    current_round: int
    current_turn: int
    hands: dict[str, list[Card]]
    player_states: dict[str, JudgementPlayerState]

    def __init__(self, room_id: str) -> None:
        super().__init__(JudgementAction, room_id)

        self.phase = JudgementPhase.BIDDING
        self.settings = JudgementSettings()

    def start_game(self) -> None:
        super().start_game()

        self.decks = Decks(num_decks=self.settings.num_decks)
        self.pile = []

        self.current_round = 0
        self.current_turn = 0
        self.player_states = {
            player.player_id: JudgementPlayerState() for player in self.players
        }

        self.decks.shuffle()
        asyncio.create_task(self.deal())

    def build_game_state(self) -> JudgementGameState:
        return JudgementGameState(
            game_name=GameName.JUDGEMENT,
            game_phase=self.game_phase,
            settings=self.settings,
            phase=self.phase,
            pile=self.pile,
            current_round=self.current_round,
            current_turn=self.current_turn,
            player_states=self.player_states,
        )

    def process_input(self, player_id: str, game_input: JudgementAction) -> None:
        logger.debug("player_id: %s, action: %s", player_id, repr(game_input))

        if isinstance(game_input, JudgementUpdateSettingsAction):
            if not self.is_host(player_id):
                raise GameError("Only the host may change settings!")

            if self.game_phase != GamePhase.NOT_STARTED:
                raise GameError(
                    "Cannot change settings after the game has already started!"
                )

            if game_input.num_decks:
                self.settings.num_decks = game_input.num_decks
            if game_input.num_rounds:
                self.settings.num_rounds = game_input.num_rounds
        elif isinstance(game_input, JudgementBidHandsAction):
            self.assert_turn(player_id)
            self.player_states[player_id].current_bid = game_input.num_hands
        elif isinstance(game_input, JudgementPlayCardAction):
            self.assert_turn(player_id)
            card = game_input.get_card()
            if card not in self.player_states[player_id].hand:
                raise GameError(f"Missing card from hand: {str(card)}")

            self.player_states[player_id].hand.remove(card)
            self.pile.append(card)

    def assert_turn(self, player_id: str) -> None:
        if self.players[self.current_turn].player_id != player_id:
            raise GameError("It is not your turn!")

    async def deal(self) -> None:
        for player_id in self.player_states:
            self.player_states[player_id].hand.extend(self.decks.draw(4))

        await socket_messager.emit_game_state(self.room_id, self)
