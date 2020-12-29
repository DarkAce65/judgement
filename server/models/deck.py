from __future__ import annotations

import random
from collections import deque
from collections.abc import Sequence

from .card import Card, Suit

NUM_CARDS_IN_DECK = 52


class Decks:
    cards: deque[str]
    num_decks: int

    def __init__(self, num_decks: int = 1) -> None:
        self.cards = deque(maxlen=num_decks * NUM_CARDS_IN_DECK)
        self.num_decks = num_decks

        for _ in range(num_decks):
            for suit in Suit:
                for number in range(1, 14):
                    self.cards.append(Card.to_str(suit, number))

    def shuffle(self) -> None:
        shuffle_index = len(self.cards) - 1

        while shuffle_index > 0:
            rand_index = random.randint(0, shuffle_index)
            shuffle_index -= 1
            temp = self.cards[shuffle_index]
            self.cards[shuffle_index] = self.cards[rand_index]
            self.cards[rand_index] = temp

    def draw(self, count: int = 1) -> deque[Card]:
        drawn_cards: deque[Card] = deque(maxlen=count)
        for _ in range(count):
            drawn_cards.append(Card.from_str(self.cards.popleft()))

        return drawn_cards

    def replace_bottom(self, cards: Sequence[Card]) -> None:
        self.cards.extend(map(str, cards))

    def replace(self, cards: Sequence[Card]) -> None:
        self.cards.extendleft(map(str, reversed(cards)))

    def __str__(self) -> str:
        return f"[{', '.join(map(str, self.cards))}]"
