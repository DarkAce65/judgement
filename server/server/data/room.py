from enum import Enum, unique
from typing import Optional


@unique
class RoomState(str, Enum):
    LOBBY = "LOBBY"
    GAME = "GAME"


class Room:
    room_id: str
    room_state: RoomState
    player_ids: set[str]

    def __init__(
        self,
        room_id: str,
        room_state: RoomState = RoomState.LOBBY,
        player_ids: Optional[set[str]] = None,
    ) -> None:
        self.room_id = room_id
        self.room_state = room_state
        self.player_ids = player_ids or set()

    @staticmethod
    def new(room_id: str) -> "Room":
        return Room(room_id)
