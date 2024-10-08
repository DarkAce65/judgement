import logging
import math
from typing import Mapping

from server.data import socket_messager
from server.models.game import GameName, GamePlayer, GamePlayerType, GameState, GameStatus
from server.models.judgement import (
    JudgementAction,
    JudgementBidHandsAction,
    JudgementGameState,
    JudgementOrderCardsAction,
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
    for i, card in enumerate(pile[1:]):
        index = i + 1
        if card == pile[winning_index]:
            if last_duplicate_wins:
                winning_index = index
        elif card.suit == trump_suit:
            if (
                pile[winning_index].suit != trump_suit
                or card.compare_rank(pile[winning_index]) > 0
            ):
                winning_index = index
        elif card.suit == trick_suit:
            if (
                pile[winning_index].suit != trump_suit
                and card.compare_rank(pile[winning_index]) > 0
            ):
                winning_index = index

    logger.info("%s %s", winning_index, pile)
    return winning_index


class JudgementGame(Game[JudgementAction]):
    phase: JudgementPhase
    settings: JudgementSettings

    ordered_player_ids: list[int]

    decks: Decks
    pile: list[Card]
    discard_pile: list[Card]

    current_round: int
    current_trick: int
    start_player_index: int
    current_turn_index: int

    player_states: dict[int, JudgementPlayerState]

    def __init__(self, game_id: str) -> None:
        super().__init__(JudgementAction, game_id)

        self.phase = JudgementPhase.NOT_STARTED
        self.settings = JudgementSettings(num_decks=1, num_rounds=13)

        self.ordered_player_ids = []

        self.decks = Decks()
        self.pile = []
        self.discard_pile = []

        self.current_round = 0
        self.current_trick = 0
        self.start_player_index = 0
        self.current_turn_index = 0

        self.player_states = {}

    def build_game_states(self, player_ids: set[int]) -> Mapping[int, GameState]:
        game_states: dict[int, GameState] = {}

        for player_id in player_ids:
            if self.players[player_id].player_type == GamePlayerType.PLAYER:
                game_states[player_id] = JudgementGameState(
                    player_type=GamePlayerType.PLAYER,
                    game_name=GameName.JUDGEMENT,
                    status=self.status,
                    players=self.players,
                    ordered_player_ids=self.ordered_player_ids,
                    settings=self.settings,
                    phase=self.phase,
                    pile=self.pile,
                    current_round=self.current_round,
                    current_trick=self.current_trick,
                    start_player_index=self.start_player_index,
                    current_turn_index=self.current_turn_index,
                    player_state=self.player_states[player_id],
                    full_state_do_not_use=dump_class(self),
                )
            elif self.players[player_id].player_type == GamePlayerType.SPECTATOR:
                game_states[player_id] = JudgementSpectatorGameState(
                    player_type=GamePlayerType.SPECTATOR,
                    game_name=GameName.JUDGEMENT,
                    status=self.status,
                    players=self.players,
                    ordered_player_ids=self.ordered_player_ids,
                    settings=self.settings,
                    phase=self.phase,
                    pile=self.pile,
                    current_round=self.current_round,
                    current_trick=self.current_trick,
                    start_player_index=self.start_player_index,
                    current_turn_index=self.current_turn_index,
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
            self.ordered_player_ids.append(player_id)
            self.player_states[player_id] = JudgementPlayerState(
                score=0, current_won_tricks=0, hand=[]
            )

            max_rounds = math.floor(
                self.settings.num_decks * 52 / len(self.ordered_player_ids)
            )
            self.settings.num_rounds = min(self.settings.num_rounds, max_rounds)

    def remove_player(self, player_id: int) -> GamePlayer:
        if self.status != GameStatus.NOT_STARTED:
            raise NotImplementedError("Cannot remove a player from this game")

        player = super().remove_player(player_id)

        if player.player_type == GamePlayerType.PLAYER:
            self.ordered_player_ids.remove(player_id)
            del self.player_states[player_id]

        return player

    def is_host(self, player_id: int) -> bool:
        return (
            len(self.ordered_player_ids) > 0 and self.ordered_player_ids[0] == player_id
        )

    async def process_input(self, player_id: int, game_input: JudgementAction) -> None:
        logger.debug("player_id: %s, action: %s", player_id, repr(game_input))

        if isinstance(game_input, JudgementUpdateSettingsAction):
            self.handle_update_settings_action(player_id, game_input)
        elif isinstance(game_input, JudgementOrderCardsAction):
            await self.handle_order_cards_action(player_id, game_input)
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

    async def handle_order_cards_action(
        self, player_id: int, action: JudgementOrderCardsAction
    ) -> None:
        player_hand = self.player_states[player_id].hand
        moved_card = player_hand.pop(action.from_index)
        if action.to_index == len(player_hand) - 1:
            player_hand.append(moved_card)
        else:
            player_hand.insert(action.to_index, moved_card)

        await socket_messager.emit_game_state(self)

    async def handle_bid_action(
        self, player_id: int, action: JudgementBidHandsAction
    ) -> None:
        self.assert_phase(JudgementPhase.BIDDING)
        self.assert_turn(player_id)
        self.player_states[player_id].current_bid = action.num_hands

        if self.current_turn_index < len(self.ordered_player_ids) - 1:
            self.current_turn_index += 1
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

        if (
            len(self.pile) > 0
            and card.suit != self.pile[0].suit
            and any(
                card.suit == self.pile[0].suit
                for card in self.player_states[player_id].hand
            )
        ):
            raise GameError(f"Cannot play non-matching suit: {str(card)}")

        self.player_states[player_id].hand.remove(card)
        self.pile.append(card)

        if len(self.pile) < len(self.ordered_player_ids):
            self.current_turn_index = (self.current_turn_index + 1) % len(
                self.ordered_player_ids
            )
        else:
            await self.end_trick()

        await socket_messager.emit_game_state(self)

    def assert_phase(self, phase: JudgementPhase) -> None:
        if self.phase != phase:
            raise GameError("You can't do that right now!")

    def assert_turn(self, player_id: int) -> None:
        if self.ordered_player_ids[self.current_turn_index] != player_id:
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
        self.start_player_index = self.current_round % len(self.ordered_player_ids)
        self.current_turn_index = self.start_player_index
        self.decks.replace(self.discard_pile)
        self.pile = []
        self.discard_pile = []
        self.phase = JudgementPhase.BIDDING
        for player_state in self.player_states.values():
            player_state.current_bid = None
            player_state.current_won_tricks = 0

        self.decks.shuffle()
        self.deal()

        await socket_messager.emit_game_state(self)

    def start_trick(self, start_player_index: int = 0) -> None:
        self.start_player_index = start_player_index
        self.current_turn_index = self.start_player_index
        self.discard_pile.extend(self.pile)
        self.pile = []

    async def end_trick(self) -> None:
        winning_player_index = (
            self.start_player_index + compute_winning_card(self.pile, self.get_trump())
        ) % len(self.ordered_player_ids)
        winning_player_id = self.ordered_player_ids[winning_player_index]
        self.player_states[winning_player_id].current_won_tricks += 1

        tricks_left = self.get_num_tricks_for_round() - self.current_trick - 1
        if tricks_left > 0:
            self.current_trick += 1
            self.start_trick(winning_player_index)
        else:
            await self.end_round()

        await socket_messager.emit_game_state(self)

    async def end_round(self) -> None:
        for player_state in self.player_states.values():
            if player_state.current_bid == player_state.current_won_tricks:
                player_state.score += player_state.current_bid + 10

            player_state.current_bid = None
            player_state.current_won_tricks = 0

        if self.current_round < self.settings.num_rounds - 1:
            self.current_round += 1
            await self.start_round()
        else:
            self.status = GameStatus.COMPLETE

        await socket_messager.emit_game_state(self)
