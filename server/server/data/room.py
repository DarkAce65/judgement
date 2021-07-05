from enum import IntEnum, unique


@unique
class RoomState(IntEnum):
    LOBBY = 1
    GAME = 2


class Room:
    room_id: str
    room_state: RoomState
    player_ids: set[str]

    def __init__(
        self,
        room_id: str,
        room_state: RoomState = RoomState.LOBBY,
        player_ids: set[str] = None,
    ) -> None:
        self.room_id = room_id
        self.room_state = room_state
        self.player_ids = player_ids or set()

    @staticmethod
    def new(room_id: str) -> "Room":
        return Room(room_id)
