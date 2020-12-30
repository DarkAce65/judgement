from __future__ import annotations

import random
from collections import Counter, deque
from collections.abc import Iterable, Sequence

from .card import Card, Suit

NUM_CARDS_IN_DECK = 52


class Decks:
    cards: deque[str]
    num_decks: int

    __drawn_card_counts: Counter[str]

    def __init__(self, num_decks: int = 1) -> None:
        self.cards = deque(maxlen=num_decks * NUM_CARDS_IN_DECK)
        self.num_decks = num_decks

        for _ in range(num_decks):
            for suit in Suit:
                for number in range(1, 14):
                    self.cards.append(Card.to_str(suit, number))

        self.__drawn_card_counts = Counter([])

    def shuffle(self) -> None:
        shuffle_index = len(self.cards) - 1

        while shuffle_index > 0:
            rand_index = random.randint(0, shuffle_index)
            shuffle_index -= 1
            temp = self.cards[shuffle_index]
            self.cards[shuffle_index] = self.cards[rand_index]
            self.cards[rand_index] = temp

    def sort(self) -> None:
        self.cards = deque(sorted(self.cards))

    def draw(self, count: int = 1) -> deque[Card]:
        if len(self.cards) < count:
            raise ValueError(
                f"Not enough cards left in the deck to draw - cards in deck: {len(self.cards)}"
            )

        drawn_cards: list[str] = []
        for _ in range(count):
            drawn_cards.append(self.cards.popleft())

        self.__drawn_card_counts.update(drawn_cards)

        return deque(map(Card.from_str, drawn_cards))

    def replace_bottom(self, cards: Sequence[Card]) -> None:
        self.__compute_card_counts(cards)

        self.cards.extend(map(str, cards))

    def replace(self, cards: Sequence[Card]) -> None:
        self.__compute_card_counts(cards)

        self.cards.extendleft(map(str, reversed(cards)))

    def __compute_card_counts(
        self, new_cards: Iterable[Card], validate: bool = True
    ) -> None:
        updated_counter = Counter(map(str, new_cards))
        updated_counter.subtract(self.__drawn_card_counts)

        if validate:
            invalid_cards = list(updated_counter.elements())
            if len(invalid_cards) != 0:
                raise ValueError(
                    "Invalid card insertion - the following cards do not belong in this deck: "
                    f"[{', '.join(map(str, invalid_cards))}]"
                )

        self.__drawn_card_counts = -updated_counter

    def __str__(self) -> str:
        return f"[{', '.join(map(str, self.cards))}]"
