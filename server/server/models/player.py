class Player:
    player_id: int
    name: str

    def __init__(self, player_id: int, name: str) -> None:
        self.player_id = player_id
        self.name = name
