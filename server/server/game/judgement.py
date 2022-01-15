import asyncio
import logging

from server.data import socket_messager
from server.models.game import GameName, GameStatus
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
    current_trick: int
    current_turn: int

    player_states: dict[str, JudgementPlayerState]

    def __init__(self, room_id: str) -> None:
        super().__init__(JudgementAction, room_id)

        self.phase = JudgementPhase.NOT_STARTED
        self.settings = JudgementSettings()

        self.decks = Decks()
        self.pile = []

        self.current_round = 0
        self.current_trick = 0
        self.current_turn = 0

        self.player_states = {
            player.player_id: JudgementPlayerState() for player in self.players
        }

    def build_game_state(self) -> JudgementGameState:
        return JudgementGameState(
            game_name=GameName.JUDGEMENT,
            status=self.status,
            settings=self.settings,
            phase=self.phase,
            pile=self.pile,
            current_round=self.current_round,
            current_trick=self.current_trick,
            current_turn=self.current_turn,
            player_states=self.player_states,
        )

    async def start_game(self) -> None:
        await super().start_game()

        self.decks = Decks(num_decks=self.settings.num_decks)

        await self.start_round()

    def add_player(self, player_id: str) -> None:
        super().add_player(player_id)
        self.player_states[player_id] = JudgementPlayerState()

    def remove_player(self, player_id: str) -> None:
        raise NotImplementedError("Cannot remove a player from this game")

    async def process_input(self, player_id: str, game_input: JudgementAction) -> None:
        logger.debug("player_id: %s, action: %s", player_id, repr(game_input))

        if isinstance(game_input, JudgementUpdateSettingsAction):
            if not self.is_host(player_id):
                raise GameError("Only the host may change settings!")

            if self.status != GameStatus.NOT_STARTED:
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

        await socket_messager.emit_game_state(self, self.room_id)

    def assert_phase(self, phase: JudgementPhase) -> None:
        if self.phase != phase:
            raise GameError("You can't do that right now!")

    def assert_turn(self, player_id: str) -> None:
        if self.players[self.current_turn].player_id != player_id:
            raise GameError("It is not your turn!")

    def get_num_tricks_for_round(self) -> int:
        return self.settings.num_rounds - self.current_round

    def deal(self) -> None:
        num_cards_to_deal = self.get_num_tricks_for_round()

        for player_id in self.player_states:
            self.player_states[player_id].hand.extend(self.decks.draw(num_cards_to_deal))

    async def handle_bid_action(
        self, player_id: str, action: JudgementBidHandsAction
    ) -> None:
        self.assert_phase(JudgementPhase.BIDDING)
        self.assert_turn(player_id)
        self.player_states[player_id].current_bid = action.num_hands

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

        if self.current_turn < len(self.players) - 1:
            self.current_turn += 1
        else:
            await self.end_trick()

    async def start_round(self) -> None:
        self.current_trick = 0
        self.current_turn = 0
        self.pile = []
        self.phase = JudgementPhase.BIDDING
        for player_id in self.player_states:
            self.player_states[player_id].current_bid = None
            self.player_states[player_id].current_hands = 0

        self.deal()

        await socket_messager.emit_game_state(self, self.room_id)

    def start_trick(self) -> None:
        self.current_turn = 0
        self.pile = []

    async def end_trick(self) -> None:
        # TODO: Figure out trick winner
        logger.info("Pile: %s", self.pile)

        tricks_left = self.get_num_tricks_for_round() - self.current_trick - 1
        if tricks_left > 0:
            self.current_trick += 1
            self.start_trick()
        else:
            await self.end_round()

        await socket_messager.emit_game_state(self, self.room_id)

    async def end_round(self) -> None:
        for player_id, player_state in self.player_states.items():
            if player_state.current_bid == player_state.current_hands:
                self.player_states[player_id].score += player_state.current_bid + 10

            self.player_states[player_id].current_bid = None
            self.player_states[player_id].current_hands = 0

        if self.current_round < self.settings.num_rounds - 1:
            self.current_round += 1
            await self.start_round()
        else:
            # TODO: Handle end game
            logger.info("Game complete")
            self.status = GameStatus.COMPLETE

        await socket_messager.emit_game_state(self, self.room_id)
