import statistics
from collections import Counter
from random import Random
from typing import Counter as CounterType
from unittest.case import TestCase

from server.game.card import Card, Suit
from server.game.decks import Decks


class TestDecks(TestCase):
    def test_creating_a_standard_deck(self) -> None:
        deck = Decks()

        self.assertEqual(deck.num_decks, 1)
        self.assertEqual(len(deck.cards), 52)
        self.assertEqual(len(set(deck.cards)), 52)

    def test_creating_multiple_decks(self) -> None:
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

    def test_shuffle(self) -> None:
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
