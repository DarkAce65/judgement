import random
from typing import List

from .card import Card, Suit


class Decks:
    cards: List[str]
    num_decks: int

    def __init__(self, num_decks: int = 1) -> None:
        self.cards = []
        self.num_decks = num_decks

        for _ in range(num_decks):
            for suit in Suit:
                for number in range(1, 14):
                    self.cards.append(Card.to_str(suit, number))

    def shuffle(self) -> None:
        shuffle_index = len(self.cards)

        while shuffle_index > 0:
            rand_index = random.randint(0, shuffle_index)
            shuffle_index -= 1
            temp = self.cards[shuffle_index]
            self.cards[shuffle_index] = self.cards[rand_index]
            self.cards[rand_index] = temp

    def draw(self, count: int = 1) -> List[Card]:
        drawn_cards = []
        for _ in range(count):
            drawn_cards.append(Card.from_str(self.cards.pop()))

        return drawn_cards

    def __str__(self) -> str:
        return f"[{', '.join(map(str, self.cards))}]"
