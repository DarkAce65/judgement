from unittest import TestCase

from pydantic import ValidationError

from server.game.card import Card, Suit


class TestCards(TestCase):
    def test_creating_a_card(self) -> None:
        ace_of_spades = Card(suit=Suit.SPADES, rank=1)
        self.assertEqual(ace_of_spades.suit, Suit.SPADES)
        self.assertEqual(ace_of_spades.rank, 1)

        eight_of_hearts = Card(suit=Suit.HEARTS, rank=8)
        self.assertEqual(eight_of_hearts.suit, Suit.HEARTS)
        self.assertEqual(eight_of_hearts.rank, 8)

    def test_creating_a_card_from_string(self) -> None:
        ace_of_spades = Card.from_str("SA")
        self.assertEqual(ace_of_spades.suit, Suit.SPADES)
        self.assertEqual(ace_of_spades.rank, 1)

        eight_of_hearts = Card.from_str("H8")
        self.assertEqual(eight_of_hearts.suit, Suit.HEARTS)
        self.assertEqual(eight_of_hearts.rank, 8)

    def test_converting_card_to_string(self) -> None:
        ace_of_spades = Card(suit=Suit.SPADES, rank=1)
        self.assertEqual(str(ace_of_spades), "SA")

        eight_of_hearts = Card(suit=Suit.HEARTS, rank=8)
        self.assertEqual(str(eight_of_hearts), "H8")

    def test_fails_to_create_invalid_card(self) -> None:
        self.assertRaisesRegex(ValueError, "Invalid string", Card.from_str, "S")
        self.assertRaisesRegex(ValueError, "not a valid Suit", Card.from_str, "Z5")
        self.assertRaisesRegex(
            ValidationError,
            "ensure this value is greater than or equal to 1",
            Card.from_str,
            "S0",
        )
        self.assertRaisesRegex(
            ValidationError,
            "ensure this value is less than or equal to 13",
            Card.from_str,
            "S14",
        )
        self.assertRaisesRegex(
            ValidationError,
            "ensure this value is greater than or equal to 1",
            Card,
            suit=Suit.SPADES,
            rank=0,
        )
        self.assertRaisesRegex(
            ValidationError,
            "ensure this value is less than or equal to 13",
            Card,
            suit=Suit.SPADES,
            rank=14,
        )
