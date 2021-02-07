import uuid


class Player:
    player_id: str
    name: str
    num_joined_rooms: int

    def __init__(self, name: str) -> None:
        self.player_id = str(uuid.uuid4())
        self.name = name

        self.num_joined_rooms = 0
