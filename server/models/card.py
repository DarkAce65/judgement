from __future__ import annotations

from enum import Enum, unique


@unique
class Suit(Enum):
    DIAMONDS = "D"
    SPADES = "S"
    HEARTS = "H"
    CLUBS = "C"


class Card:
    suit: Suit
    number: int

    def __init__(self, suit: Suit, number: int) -> None:
        if number < 2 or number > 14:
            raise ValueError("Card number is out of bounds", number)

        self.suit = suit
        self.number = number

    @staticmethod
    def from_str(card_string: str) -> Card:
        if len(card_string) < 2:
            raise ValueError("Invalid string to convert to Card", card_string)

        suit_str = card_string[0]
        number_str = card_string[1:]

        try:
            if number_str == "A":
                number = 14
            elif number_str == "K":
                number = 13
            elif number_str == "Q":
                number = 12
            elif number_str == "J":
                number = 11
            else:
                number = int(number_str)
        except ValueError as ex:
            raise ValueError("Invalid number for Card", number_str) from ex

        return Card(Suit(suit_str), number)

    @staticmethod
    def to_str(suit: Suit, number: int) -> str:
        if number == 14:
            number_str = "A"
        elif number == 13:
            number_str = "K"
        elif number == 12:
            number_str = "Q"
        elif number == 11:
            number_str = "J"
        else:
            number_str = str(number)

        return f"{suit.value}{number_str}"

    def __str__(self) -> str:
        return Card.to_str(self.suit, self.number)
