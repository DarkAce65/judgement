from unittest.case import TestCase

from server.game.card import Card, Suit


class TestCards(TestCase):
    def test_creating_a_card(self) -> None:
        ace_of_spades = Card(Suit.SPADES, 1)
        self.assertEqual(ace_of_spades.suit, Suit.SPADES)
        self.assertEqual(ace_of_spades.rank, 1)

        eight_of_hearts = Card(Suit.HEARTS, 8)
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
        ace_of_spades = Card(Suit.SPADES, 1)
        self.assertEqual(str(ace_of_spades), "SA")

        eight_of_hearts = Card(Suit.HEARTS, 8)
        self.assertEqual(str(eight_of_hearts), "H8")
