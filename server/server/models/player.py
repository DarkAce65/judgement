from typing import Optional


class Player:
    player_id: int
    name: Optional[str]

    def __init__(self, player_id: int, name: Optional[str]) -> None:
        self.player_id = player_id
        self.name = name


class PlayerWithAuth(Player):
    player_auth_id: str

    def __init__(self, player_id: int, name: Optional[str], player_auth_id: str) -> None:
        super().__init__(player_id, name)
        self.player_auth_id = player_auth_id
