import random
import string
import time

from . import ROOM_ID_LENGTH


class Room:
    room_id: str

    player_ids: set[str]

    created_at: int
    updated_at: int

    def __init__(self, room_id: str, host_id: str) -> None:
        self.room_id = room_id

        self.player_ids = set([host_id])

        self.__update()
        self.created_at = self.updated_at

    @staticmethod
    def generate_id() -> str:
        return "".join(random.choices(string.ascii_uppercase, k=ROOM_ID_LENGTH))

    @staticmethod
    def is_valid_id(room_id: str) -> bool:
        return len(room_id) == ROOM_ID_LENGTH and room_id.isupper()

    def __update(self) -> None:
        self.updated_at = int(time.time_ns() / 1e6)

    def add_player(self, new_player_id: str) -> bool:
        if new_player_id in self.player_ids:
            return False

        self.player_ids.add(new_player_id)
        self.__update()
        return True

    def remove_player(self, player_id: str) -> bool:
        if player_id not in self.player_ids:
            return False

        self.player_ids.remove(player_id)
        self.__update()
        return True
