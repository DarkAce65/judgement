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
    rank: int

    def __init__(self, suit: Suit, rank: int) -> None:
        if rank < 2 or rank > 14:
            raise ValueError("Card rank is out of bounds", rank)

        self.suit = suit
        self.rank = rank

    @staticmethod
    def from_str(card_string: str) -> Card:
        if len(card_string) < 2:
            raise ValueError("Invalid string to convert to Card", card_string)

        suit_str = card_string[0]
        rank_str = card_string[1:]

        try:
            if rank_str == "A":
                rank = 14
            elif rank_str == "K":
                rank = 13
            elif rank_str == "Q":
                rank = 12
            elif rank_str == "J":
                rank = 11
            else:
                rank = int(rank_str)
        except ValueError as ex:
            raise ValueError("Invalid rank for Card", rank_str) from ex

        return Card(Suit(suit_str), rank)

    @staticmethod
    def to_str(suit: Suit, rank: int) -> str:
        if rank < 2 or rank > 14:
            raise ValueError("Card rank is out of bounds", rank)

        if rank == 14:
            rank_str = "A"
        elif rank == 13:
            rank_str = "K"
        elif rank == 12:
            rank_str = "Q"
        elif rank == 11:
            rank_str = "J"
        else:
            rank_str = str(rank)

        return f"{suit.value}{rank_str}"

    def __str__(self) -> str:
        return Card.to_str(self.suit, self.rank)
