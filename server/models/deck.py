from models.card import Card, Suit


class Deck:
    def __init__(self) -> None:
        self.cards = []

        for suit in Suit:
            for number in range(2, 15):
                self.cards.append(Card(suit, number))

    def __str__(self) -> str:
        return f"[{', '.join(map(str, self.cards))}]"
