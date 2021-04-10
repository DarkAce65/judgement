import uuid
from typing import Optional


class Player:
    player_id: str
    name: Optional[str]

    joined_room_ids: set[str]

    def __init__(self, name: Optional[str]) -> None:
        self.player_id = str(uuid.uuid4())
        self.name = name

        self.joined_room_ids = set()
