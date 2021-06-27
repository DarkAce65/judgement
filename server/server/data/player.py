from typing import Optional


class Player:
    player_id: str
    name: Optional[str]

    def __init__(self, player_id: str, name: Optional[str]) -> None:
        self.player_id = player_id
        self.name = name
