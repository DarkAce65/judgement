import logging
import math
from typing import Mapping

from server.data import socket_messager
from server.models.game import GameName, GamePlayerType, GameState, GameStatus
from server.models.judgement import (
    JudgementAction,
    JudgementBidHandsAction,
    JudgementGameState,
    JudgementPhase,
    JudgementPlayCardAction,
    JudgementPlayerState,
    JudgementSettings,
    JudgementSpectatorGameState,
    JudgementUpdateSettingsAction,
)
from server.utils.debug_encoder import dump_class

from .card import Card, Suit
from .core import Game, GameError
from .decks import Decks

logger = logging.getLogger(__name__)


TRUMP_ORDER = [Suit.SPADES, Suit.DIAMONDS, Suit.CLUBS, Suit.HEARTS]


def compute_winning_card(
    pile: list[Card], trump_suit: Suit, last_duplicate_wins: bool = False
) -> int:
    if len(pile) == 0:
        raise ValueError("Can't find the winner of an empty pile!")

    winning_index = 0
    trick_suit = pile[0].suit
    for index, card in enumerate(pile[1:]):
        if card == pile[winning_index] and last_duplicate_wins:
            winning_index = index + 1
        elif (
            card.suit == trick_suit
            and pile[winning_index].suit != trump_suit
            and card.compare_rank(pile[winning_index]) > 0
        ):
            winning_index = index + 1
        elif card.suit == trump_suit:
            if (
                pile[winning_index].suit != trump_suit
                or card.compare_rank(pile[winning_index]) > 0
            ):
                winning_index = index + 1

    return winning_index


class JudgementGame(Game[JudgementAction]):
    phase: JudgementPhase
    settings: JudgementSettings

    decks: Decks
    pile: list[Card]
    discard_pile: list[Card]

    current_round: int
    current_trick: int
    current_turn: int

    player_states: dict[int, JudgementPlayerState]

    def __init__(self, room_id: str) -> None:
        super().__init__(JudgementAction, room_id)

        self.phase = JudgementPhase.NOT_STARTED
        self.settings = JudgementSettings(num_decks=1, num_rounds=13)

        self.decks = Decks()
        self.pile = []
        self.discard_pile = []

        self.current_round = 0
        self.current_trick = 0
        self.current_turn = 0

        self.player_states = {}

    def build_game_states(self, player_ids: set[int]) -> Mapping[int, GameState]:
        game_states: dict[int, GameState] = {}

        for player_id in player_ids:
            if self.players[player_id].player_type == GamePlayerType.PLAYER:
                game_states[player_id] = JudgementGameState(
                    player_type=GamePlayerType.PLAYER,
                    game_name=GameName.JUDGEMENT,
                    status=self.status,
                    settings=self.settings,
                    phase=self.phase,
                    pile=self.pile,
                    current_round=self.current_round,
                    current_trick=self.current_trick,
                    current_turn=self.current_turn,
                    player_state=self.player_states[player_id],
                    full_state_do_not_use=dump_class(self),
                )
            elif self.players[player_id].player_type == GamePlayerType.SPECTATOR:
                game_states[player_id] = JudgementSpectatorGameState(
                    player_type=GamePlayerType.SPECTATOR,
                    game_name=GameName.JUDGEMENT,
                    status=self.status,
                    settings=self.settings,
                    phase=self.phase,
                    pile=self.pile,
                    current_round=self.current_round,
                    current_trick=self.current_trick,
                    current_turn=self.current_turn,
                    full_state_do_not_use=dump_class(self),
                )

        return game_states

    async def start_game(self) -> None:
        await super().start_game()

        self.decks = Decks(num_decks=self.settings.num_decks)

        await self.start_round()

    def add_player(
        self, player_id: int, player_type: GamePlayerType = GamePlayerType.PLAYER
    ) -> None:
        if self.phase != JudgementPhase.NOT_STARTED:
            player_type = GamePlayerType.SPECTATOR

        super().add_player(player_id, player_type)

        if player_type == GamePlayerType.PLAYER:
            self.player_states[player_id] = JudgementPlayerState(
                score=0, current_hands=0, hand=[]
            )

            max_rounds = math.ceil(self.settings.num_decks * 52 / len(self.player_order))
            self.settings.num_rounds = min(self.settings.num_rounds, max_rounds)

    def remove_player(self, player_id: int) -> None:
        if self.status != GameStatus.NOT_STARTED:
            raise NotImplementedError("Cannot remove a player from this game")

        del self.player_states[player_id]
        super().remove_player(player_id)

    async def process_input(self, player_id: int, game_input: JudgementAction) -> None:
        logger.debug("player_id: %s, action: %s", player_id, repr(game_input))

        if isinstance(game_input, JudgementUpdateSettingsAction):
            self.handle_update_settings_action(player_id, game_input)
        elif isinstance(game_input, JudgementBidHandsAction):
            await self.handle_bid_action(player_id, game_input)
        elif isinstance(game_input, JudgementPlayCardAction):
            await self.handle_play_card_action(player_id, game_input)

        await socket_messager.emit_game_state(self)

    def handle_update_settings_action(
        self, player_id: int, action: JudgementUpdateSettingsAction
    ) -> None:
        if not self.is_host(player_id):
            raise GameError("Only the host may change settings!")

        if self.status != GameStatus.NOT_STARTED:
            raise GameError("Cannot change settings after the game has already started!")

        if action.num_decks is not None:
            self.settings.num_decks = action.num_decks
        if action.num_rounds is not None:
            self.settings.num_rounds = action.num_rounds

    async def handle_bid_action(
        self, player_id: int, action: JudgementBidHandsAction
    ) -> None:
        self.assert_phase(JudgementPhase.BIDDING)
        self.assert_turn(player_id)
        self.player_states[player_id].current_bid = action.num_hands

        if self.current_turn < len(self.player_order) - 1:
            self.current_turn += 1
        else:
            self.phase = JudgementPhase.PLAYING
            self.start_trick()

    async def handle_play_card_action(
        self, player_id: int, action: JudgementPlayCardAction
    ) -> None:
        self.assert_phase(JudgementPhase.PLAYING)
        self.assert_turn(player_id)

        card = action.get_card()
        if card not in self.player_states[player_id].hand:
            raise GameError(f"Missing card from hand: {str(card)}")

        self.player_states[player_id].hand.remove(card)
        self.pile.append(card)

        if len(self.pile) < len(self.player_order):
            self.current_turn = (self.current_turn + 1) % len(self.player_order)
        else:
            await self.end_trick()

    def assert_phase(self, phase: JudgementPhase) -> None:
        if self.phase != phase:
            raise GameError("You can't do that right now!")

    def assert_turn(self, player_id: int) -> None:
        if self.player_order[self.current_turn] != player_id:
            raise GameError("It is not your turn!")

    def get_num_tricks_for_round(self) -> int:
        return self.settings.num_rounds - self.current_round

    def get_trump(self) -> Suit:
        return TRUMP_ORDER[self.current_round % 4]

    def deal(self) -> None:
        num_cards_to_deal = self.get_num_tricks_for_round()

        for player_state in self.player_states.values():
            player_state.hand.extend(self.decks.draw(num_cards_to_deal))

    async def start_round(self) -> None:
        self.current_trick = 0
        self.current_turn = self.current_round % len(self.player_order)
        self.decks.replace(self.discard_pile)
        self.pile = []
        self.discard_pile = []
        self.phase = JudgementPhase.BIDDING
        for player_state in self.player_states.values():
            player_state.current_bid = None
            player_state.current_hands = 0

        self.decks.shuffle()
        self.deal()

        await socket_messager.emit_game_state(self)

    def start_trick(self, start_player_index: int = 0) -> None:
        self.current_turn = start_player_index
        self.discard_pile.extend(self.pile)
        self.pile = []

    async def end_trick(self) -> None:
        winning_player_index = compute_winning_card(self.pile, self.get_trump())
        winning_player_id = self.player_order[winning_player_index]
        self.player_states[winning_player_id].current_hands += 1

        tricks_left = self.get_num_tricks_for_round() - self.current_trick - 1
        if tricks_left > 0:
            self.current_trick += 1
            self.start_trick(winning_player_index)
        else:
            await self.end_round()

        await socket_messager.emit_game_state(self)

    async def end_round(self) -> None:
        for player_state in self.player_states.values():
            if player_state.current_bid == player_state.current_hands:
                player_state.score += player_state.current_bid + 10

            player_state.current_bid = None
            player_state.current_hands = 0

        if self.current_round < self.settings.num_rounds - 1:
            self.current_round += 1
            await self.start_round()
        else:
            self.status = GameStatus.COMPLETE

        await socket_messager.emit_game_state(self)
