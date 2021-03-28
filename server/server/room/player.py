import uuid
from typing import Optional


class Player:
    player_id: str
    name: Optional[str]
    num_joined_rooms: int

    def __init__(self, name: Optional[str]) -> None:
        self.player_id = str(uuid.uuid4())
        self.name = name

        self.num_joined_rooms = 0
