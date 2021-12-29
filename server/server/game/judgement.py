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
    current_round_within_trick: int
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
        self.current_round_within_trick = 0
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
            current_round_within_trick=self.current_round_within_trick,
            current_turn=self.current_turn,
            player_states=self.player_states,
        )

    async def process_input(self, player_id: str, game_input: JudgementAction) -> None:
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
            await self.handle_bid_action(player_id, game_input)
        elif isinstance(game_input, JudgementPlayCardAction):
            await self.handle_play_card_action(player_id, game_input)

    def assert_phase(self, phase: JudgementPhase) -> None:
        if self.phase != phase:
            raise GameError("You can't do that right now!")

    def assert_turn(self, player_id: str) -> None:
        if self.players[self.current_turn].player_id != player_id:
            raise GameError("It is not your turn!")

    async def deal(self) -> None:
        num_cards_to_deal = self.settings.num_rounds - self.current_round

        for player_id in self.player_states:
            self.player_states[player_id].hand.extend(self.decks.draw(num_cards_to_deal))

        await socket_messager.emit_game_state(self, self.room_id)

    async def handle_bid_action(
        self, player_id: str, action: JudgementBidHandsAction
    ) -> None:
        self.assert_phase(JudgementPhase.BIDDING)
        self.assert_turn(player_id)
        self.player_states[player_id].current_bid = action.num_hands

        await socket_messager.emit_game_state(self, self.room_id)

        if self.current_turn < len(self.players) - 1:
            self.current_turn += 1
        else:
            self.phase = JudgementPhase.PLAYING
            self.start_trick()

    async def handle_play_card_action(
        self, player_id: str, action: JudgementPlayCardAction
    ) -> None:
        self.assert_phase(JudgementPhase.PLAYING)
        self.assert_turn(player_id)

        card = action.get_card()
        if card not in self.player_states[player_id].hand:
            raise GameError(f"Missing card from hand: {str(card)}")

        self.player_states[player_id].hand.remove(card)
        self.pile.append(card)

        await socket_messager.emit_game_state(self, self.room_id)

        if self.current_turn < len(self.players) - 1:
            self.current_turn += 1
        else:
            await self.end_trick()

    async def start_round(self) -> None:
        self.current_round_within_trick = 0
        self.current_turn = 0
        self.pile = []
        self.phase = JudgementPhase.BIDDING
        for player_id in self.player_states:
            self.player_states[player_id].current_bid = None
            self.player_states[player_id].current_hands = 0

        await self.deal()

    def start_trick(self) -> None:
        self.current_turn = 0
        self.pile = []

    async def end_trick(self) -> None:
        # TODO: Figure out trick winner
        logger.info("Pile: %s", self.pile)

        tricks_left = (
            self.settings.num_rounds
            - self.current_round
            - self.current_round_within_trick
            > 0
        )
        if tricks_left > 0:
            self.current_round_within_trick += 1
            self.start_trick()
        else:
            await self.end_round()

    async def end_round(self) -> None:
        for player_id, player_state in self.player_states.items():
            if player_state.current_bid == player_state.current_hands:
                self.player_states[player_id].score += player_state.current_bid + 10

            self.player_states[player_id].current_bid = None
            self.player_states[player_id].current_hands = 0

        if self.current_round < self.settings.num_rounds:
            self.current_round += 1
            await self.start_round()
        else:
            # TODO: Handle end game
            logger.info("Game complete")
