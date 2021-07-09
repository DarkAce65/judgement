# pylint: disable=protected-access

import itertools
import statistics
from collections import Counter
from random import Random
from typing import Counter as CounterType
from unittest.case import TestCase

from server.game.card import Card, Suit
from server.game.decks import Decks


class TestDecks(TestCase):
    def test_create_a_standard_deck(self) -> None:
        deck = Decks()

        self.assertEqual(deck.num_decks, 1)
        self.assertEqual(len(deck.cards), 52)
        self.assertEqual(len(set(deck.cards)), 52)

    def test_create_multiple_decks(self) -> None:
        deck = Decks(num_decks=4)

        self.assertEqual(deck.num_decks, 4)
        self.assertEqual(len(deck.cards), 208)
        self.assertEqual(len(set(deck.cards)), 52)

    def test_draw_from_initialized_deck(self) -> None:
        deck = Decks()

        self.assertListEqual([str(card) for card in deck.draw()], ["DA"])
        self.assertListEqual([str(card) for card in deck.draw()], ["D2"])
        self.assertListEqual(
            [str(card) for card in deck.draw(4)], ["D3", "D4", "D5", "D6"]
        )
        self.assertListEqual(
            [str(card) for card in deck.draw(8)],
            ["D7", "D8", "D9", "D10", "DJ", "DQ", "DK", "SA"],
        )
        self.assertEqual(len(deck.cards), 38)
        self.assertEqual(len(set(deck.cards)), 38)
        self.assertCountEqual(
            deck._drawn_card_counts.elements(),
            [
                "DA",
                "D2",
                "D3",
                "D4",
                "D5",
                "D6",
                "D7",
                "D8",
                "D9",
                "D10",
                "DJ",
                "DQ",
                "DK",
                "SA",
            ],
        )

    def test_draw_from_shuffled_deck(self) -> None:
        rand = Random(9999)
        deck = Decks()
        deck.shuffle(rand=rand)

        self.assertListEqual([str(card) for card in deck.draw()], ["S10"])
        self.assertListEqual([str(card) for card in deck.draw()], ["D2"])
        self.assertListEqual(
            [str(card) for card in deck.draw(4)], ["DQ", "H4", "SJ", "C3"]
        )
        self.assertListEqual(
            [str(card) for card in deck.draw(8)],
            ["C9", "S8", "H7", "C4", "D3", "CQ", "S4", "SQ"],
        )
        self.assertEqual(len(deck.cards), 38)
        self.assertEqual(len(set(deck.cards)), 38)
        self.assertCountEqual(
            deck._drawn_card_counts.elements(),
            [
                "S10",
                "D2",
                "DQ",
                "H4",
                "SJ",
                "C3",
                "C9",
                "S8",
                "H7",
                "C4",
                "D3",
                "CQ",
                "S4",
                "SQ",
            ],
        )

    def test_draw_from_multiple_shuffled_decks(self) -> None:
        rand = Random(9999)
        deck = Decks(4)
        deck.shuffle(rand=rand)

        self.assertListEqual([str(card) for card in deck.draw()], ["H6"])
        self.assertListEqual([str(card) for card in deck.draw()], ["D3"])
        self.assertListEqual(
            [str(card) for card in deck.draw(4)], ["C4", "H4", "C9", "SA"]
        )
        self.assertListEqual(
            [str(card) for card in deck.draw(8)],
            ["S4", "CQ", "D4", "HK", "D8", "H10", "C7", "H6"],
        )
        self.assertEqual(len(deck.cards), 194)
        self.assertEqual(len(set(deck.cards)), 52)
        self.assertCountEqual(
            deck._drawn_card_counts.elements(),
            [
                "H6",
                "D3",
                "C4",
                "H4",
                "C9",
                "SA",
                "S4",
                "CQ",
                "D4",
                "HK",
                "D8",
                "H10",
                "C7",
                "H6",
            ],
        )

    def test_replacing_onto_multiple_shuffled_decks(self) -> None:
        rand = Random(9999)
        deck = Decks(4)
        deck.shuffle(rand=rand)

        drawn_cards = deck.draw(14)
        self.assertListEqual(
            [str(card) for card in drawn_cards],
            [
                "H6",
                "D3",
                "C4",
                "H4",
                "C9",
                "SA",
                "S4",
                "CQ",
                "D4",
                "HK",
                "D8",
                "H10",
                "C7",
                "H6",
            ],
        )

        self.assertEqual(len(deck.cards), 194)
        self.assertEqual(len(set(deck.cards)), 52)
        self.assertCountEqual(
            deck._drawn_card_counts.elements(),
            [
                "H6",
                "D3",
                "C4",
                "H4",
                "C9",
                "SA",
                "S4",
                "CQ",
                "D4",
                "HK",
                "D8",
                "H10",
                "C7",
                "H6",
            ],
        )

        deck.replace(drawn_cards)
        self.assertEqual(len(deck.cards), 208)
        self.assertEqual(len(set(deck.cards)), 52)
        self.assertCountEqual(deck._drawn_card_counts.elements(), [])
        self.assertListEqual(
            [str(card) for card in itertools.islice(deck.cards, 0, len(drawn_cards))],
            [str(card) for card in drawn_cards],
        )

    def test_replacing_to_bottom_of_multiple_shuffled_decks(self) -> None:
        rand = Random(9999)
        deck = Decks(4)
        deck.shuffle(rand=rand)

        drawn_cards = deck.draw(14)
        self.assertListEqual(
            [str(card) for card in drawn_cards],
            [
                "H6",
                "D3",
                "C4",
                "H4",
                "C9",
                "SA",
                "S4",
                "CQ",
                "D4",
                "HK",
                "D8",
                "H10",
                "C7",
                "H6",
            ],
        )
        self.assertEqual(len(deck.cards), 194)
        self.assertEqual(len(set(deck.cards)), 52)

        deck.replace_bottom(drawn_cards)

        self.assertEqual(len(deck.cards), 208)
        self.assertEqual(len(set(deck.cards)), 52)
        self.assertCountEqual(deck._drawn_card_counts.elements(), [])
        self.assertListEqual(
            [
                str(card)
                for card in itertools.islice(
                    deck.cards, len(deck.cards) - len(drawn_cards), len(deck.cards)
                )
            ],
            [str(card) for card in drawn_cards],
        )

    def test_replace_onto_deck(self) -> None:
        deck = Decks()

        drawn_cards = deck.draw(5)
        self.assertListEqual(
            [str(card) for card in drawn_cards], ["DA", "D2", "D3", "D4", "D5"]
        )
        self.assertEqual(len(deck.cards), 47)
        self.assertEqual(len(set(deck.cards)), 47)
        self.assertCountEqual(
            deck._drawn_card_counts.elements(), ["DA", "D2", "D3", "D4", "D5"]
        )

        deck.replace(drawn_cards)
        self.assertEqual(len(deck.cards), 52)
        self.assertEqual(len(set(deck.cards)), 52)
        self.assertCountEqual(deck._drawn_card_counts.elements(), [])
        self.assertListEqual(
            [str(card) for card in itertools.islice(deck.cards, 0, len(drawn_cards))],
            [str(card) for card in drawn_cards],
        )

    def test_replace_to_bottom_of_deck(self) -> None:
        deck = Decks()

        drawn_cards = deck.draw(5)
        self.assertListEqual(
            [str(card) for card in drawn_cards], ["DA", "D2", "D3", "D4", "D5"]
        )
        self.assertEqual(len(deck.cards), 47)
        self.assertEqual(len(set(deck.cards)), 47)
        self.assertCountEqual(
            deck._drawn_card_counts.elements(), ["DA", "D2", "D3", "D4", "D5"]
        )

        deck.replace_bottom(drawn_cards)
        self.assertEqual(len(deck.cards), 52)
        self.assertEqual(len(set(deck.cards)), 52)
        self.assertCountEqual(deck._drawn_card_counts.elements(), [])
        self.assertListEqual(
            [
                str(card)
                for card in itertools.islice(
                    deck.cards, len(deck.cards) - len(drawn_cards), len(deck.cards)
                )
            ],
            [str(card) for card in drawn_cards],
        )

    def test_shuffle(self) -> None:
        deck = Decks()
        deck.shuffle()
        self.assertEqual(len(deck.cards), 52)
        self.assertEqual(len(set(deck.cards)), 52)

    def test_shuffle_multiple_decks(self) -> None:
        deck = Decks(4)
        deck.shuffle()
        self.assertEqual(len(deck.cards), 208)
        self.assertEqual(len(set(deck.cards)), 52)

    def test_shuffle_evenness(self) -> None:
        probability: CounterType[str] = Counter()
        repetitions = 1000
        for _ in range(repetitions):
            deck = Decks()
            deck.shuffle()
            probability.update(
                [f"{str(card)}-{index}" for index, card in enumerate(deck.cards)]
            )

        avg_value = repetitions / 52
        probabilities: list[float] = []
        for suit in Suit:
            for rank in range(1, 14):
                card_str = str(Card(suit=suit, rank=rank))
                for idx in range(52):
                    probabilities.append(
                        probability.get(f"{card_str}-{idx}", 0) / avg_value
                    )

        self.assertAlmostEqual(
            statistics.pvariance(probabilities, mu=1), 0.05, delta=0.005
        )

    def test_cannot_replace_card_not_drawn_from_deck(self) -> None:
        deck = Decks()

        self.assertRaisesRegex(
            ValueError,
            "the following cards do not belong in this deck.*[SA]",
            deck.replace,
            [Card.from_str("SA")],
        )
        self.assertRaisesRegex(
            ValueError,
            "the following cards do not belong in this deck.*[SA]",
            deck.replace_bottom,
            [Card.from_str("SA")],
        )

        drawn_cards = deck.draw(3)
        deck.replace(drawn_cards)

        self.assertRaisesRegex(
            ValueError,
            "the following cards do not belong in this deck.*[DA, D2, D3]",
            deck.replace,
            drawn_cards,
        )
        self.assertRaisesRegex(
            ValueError,
            "the following cards do not belong in this deck.*[DA, D2, D3]",
            deck.replace_bottom,
            drawn_cards,
        )

    def test_cannot_replace_card_not_drawn_from_multiple_decks(self) -> None:
        deck = Decks(2)

        self.assertRaisesRegex(
            ValueError,
            "the following cards do not belong in this deck.*[SA]",
            deck.replace,
            [Card.from_str("SA")],
        )
        self.assertRaisesRegex(
            ValueError,
            "the following cards do not belong in this deck.*[SA]",
            deck.replace_bottom,
            [Card.from_str("SA")],
        )

        drawn_cards = deck.draw(3)
        deck.replace(drawn_cards)

        self.assertRaisesRegex(
            ValueError,
            "the following cards do not belong in this deck.*[DA, D2, D3]",
            deck.replace,
            drawn_cards,
        )
        self.assertRaisesRegex(
            ValueError,
            "the following cards do not belong in this deck.*[DA, D2, D3]",
            deck.replace_bottom,
            drawn_cards,
        )
