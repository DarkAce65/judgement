from unittest import TestCase

from server.game.card import Card, Suit
from server.game.judgement import compute_winning_card


class TestJudgement(TestCase):
    def test_cannot_compute_winner_of_empty_pile(self) -> None:
        pile: list[Card] = []
        self.assertRaisesRegex(
            ValueError,
            "Can't find the winner of an empty pile",
            compute_winning_card,
            pile,
            Suit.SPADES,
        )

    def test_computing_winning_card_from_single_card(self) -> None:
        self.assertEqual(
            compute_winning_card([Card(suit=Suit.SPADES, rank=1)], Suit.SPADES), 0
        )
        self.assertEqual(
            compute_winning_card([Card(suit=Suit.HEARTS, rank=1)], Suit.SPADES), 0
        )

    def test_computing_winning_card_from_high_card(self) -> None:
        pile = [
            Card(suit=Suit.SPADES, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.SPADES, rank=5),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 1)

        pile = [
            Card(suit=Suit.SPADES, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.SPADES, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 2)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.HEARTS, rank=6),
            Card(suit=Suit.HEARTS, rank=5),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 1)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.HEARTS, rank=6),
            Card(suit=Suit.HEARTS, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 2)

    def test_computing_winning_card_from_high_card_ignoring_non_trick_suits(self) -> None:
        pile = [
            Card(suit=Suit.SPADES, rank=4),
            Card(suit=Suit.HEARTS, rank=6),
            Card(suit=Suit.SPADES, rank=5),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 2)

        pile = [
            Card(suit=Suit.SPADES, rank=4),
            Card(suit=Suit.HEARTS, rank=6),
            Card(suit=Suit.SPADES, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 2)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.CLUBS, rank=6),
            Card(suit=Suit.HEARTS, rank=5),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 2)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.CLUBS, rank=6),
            Card(suit=Suit.HEARTS, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 2)

    def test_computing_winning_card_from_trump(self) -> None:
        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.HEARTS, rank=5),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 1)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.HEARTS, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 1)

    def test_computing_winning_card_from_trump_ignoring_non_trick_suits(self) -> None:
        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.CLUBS, rank=6),
            Card(suit=Suit.HEARTS, rank=5),
            Card(suit=Suit.SPADES, rank=2),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 3)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.CLUBS, rank=6),
            Card(suit=Suit.HEARTS, rank=1),
            Card(suit=Suit.SPADES, rank=2),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES), 3)

    def test_computing_winning_card_with_first_duplicate_wins(self) -> None:
        pile = [
            Card(suit=Suit.SPADES, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.SPADES, rank=5),
            Card(suit=Suit.SPADES, rank=6),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, False), 1)

        pile = [
            Card(suit=Suit.SPADES, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.SPADES, rank=1),
            Card(suit=Suit.SPADES, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, False), 2)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.HEARTS, rank=6),
            Card(suit=Suit.HEARTS, rank=5),
            Card(suit=Suit.HEARTS, rank=6),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, False), 1)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.HEARTS, rank=6),
            Card(suit=Suit.HEARTS, rank=1),
            Card(suit=Suit.HEARTS, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, False), 2)

    def test_computing_winning_card_with_last_duplicate_wins(self) -> None:
        pile = [
            Card(suit=Suit.SPADES, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.SPADES, rank=5),
            Card(suit=Suit.SPADES, rank=6),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, True), 3)

        pile = [
            Card(suit=Suit.SPADES, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.SPADES, rank=1),
            Card(suit=Suit.SPADES, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, True), 3)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.HEARTS, rank=6),
            Card(suit=Suit.HEARTS, rank=5),
            Card(suit=Suit.HEARTS, rank=6),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, True), 3)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.HEARTS, rank=6),
            Card(suit=Suit.HEARTS, rank=1),
            Card(suit=Suit.HEARTS, rank=1),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, True), 3)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.HEARTS, rank=5),
            Card(suit=Suit.SPADES, rank=6),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, True), 3)

        pile = [
            Card(suit=Suit.HEARTS, rank=4),
            Card(suit=Suit.SPADES, rank=6),
            Card(suit=Suit.HEARTS, rank=1),
            Card(suit=Suit.SPADES, rank=6),
        ]
        self.assertEqual(compute_winning_card(pile, Suit.SPADES, True), 3)
