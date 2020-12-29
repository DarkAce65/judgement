from enum import Enum


class Suit(Enum):
    DIAMONDS = "D"
    SPADES = "S"
    HEARTS = "H"
    CLUBS = "C"


class Card:
    def __init__(self, suit: Suit, number: int) -> None:
        if number < 2 or number > 14:
            raise ValueError("number is out of bounds")

        self.suit = suit
        self.number = number

    def __str__(self) -> str:
        number = str(self.number)
        if self.number == 14:
            number = "A"
        elif self.number == 13:
            number = "K"
        elif self.number == 12:
            number = "Q"
        elif self.number == 11:
            number = "J"

        return f"{self.suit.value}{number}"
