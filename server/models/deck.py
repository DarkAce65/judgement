import random

from . import Card, Suit


class Deck:
    def __init__(self) -> None:
        self.cards = []

        for suit in Suit:
            for number in range(2, 15):
                self.cards.append(Card(suit, number))

    def shuffle(self) -> None:
        shuffle_index = len(self.cards)

        while shuffle_index > 0:
            rand_index = random.randint(0, shuffle_index)
            shuffle_index -= 1
            temp = self.cards[shuffle_index]
            self.cards[shuffle_index] = self.cards[rand_index]
            self.cards[rand_index] = temp

    def __str__(self) -> str:
        return f"[{', '.join(map(str, self.cards))}]"
