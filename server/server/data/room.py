class Room:
    room_id: str
    player_ids: set[str]

    def __init__(self, room_id: str, player_ids: set[str] = None) -> None:
        self.room_id = room_id
        self.player_ids = player_ids or set()
