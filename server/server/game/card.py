from __future__ import annotations

from enum import Enum, unique

from pydantic import BaseModel, Field


@unique
class Suit(str, Enum):
    DIAMONDS = "D"
    SPADES = "S"
    HEARTS = "H"
    CLUBS = "C"


class Card(BaseModel):
    suit: Suit
    rank: int = Field(..., ge=1, le=13)

    class Config:
        frozen = True

    @staticmethod
    def from_str(card_string: str) -> Card:
        if len(card_string) < 2 or 3 < len(card_string):
            raise ValueError("Invalid string to convert to Card", card_string)

        suit_str = card_string[0]
        rank_str = card_string[1:]

        if rank_str == "A":
            rank = 1
        elif rank_str == "K":
            rank = 13
        elif rank_str == "Q":
            rank = 12
        elif rank_str == "J":
            rank = 11
        else:
            try:
                rank = int(rank_str)
            except ValueError as ex:
                raise ValueError("Invalid rank for Card", rank_str) from ex

        return Card(suit=Suit(suit_str), rank=rank)

    @staticmethod
    def to_str(suit: Suit, rank: int) -> str:
        if rank < 1 or rank > 13:
            raise ValueError("Card rank is out of bounds", rank)

        if rank == 1:
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
