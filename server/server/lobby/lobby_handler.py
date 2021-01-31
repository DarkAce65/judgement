import random
import string
import time
import uuid
from typing import NamedTuple

Player = NamedTuple("Player", [("player_id", str), ("name", str)])


class Room:
    room_id: str

    player_ids: set[str] = set()

    created_at: int
    updated_at: int

    def __init__(self, room_id: str, host_id: str) -> None:
        self.room_id = room_id

        self.player_ids.add(host_id)

        self.created_at = int(time.time_ns() / 1e6)
        self.updated_at = self.created_at

    @staticmethod
    def generate_id() -> str:
        return "".join(random.sample(string.ascii_lowercase, 4))

    def __update(self) -> None:
        self.updated_at = int(time.time_ns() / 1e6)

    def add_player(self, new_player_id: str) -> bool:
        self.__update()

        if new_player_id in self.player_ids:
            return False

        self.player_ids.add(new_player_id)
        return True

    def remove_player(self, player_id: str) -> bool:
        self.__update()

        if player_id not in self.player_ids:
            return False

        self.player_ids.remove(player_id)
        return True


class LobbyHandler:
    active_players: dict[str, Player] = {}
    rooms: dict[str, Room] = {}

    def get_player(self, player_id: str) -> Player:
        return self.active_players.setdefault(player_id, Player(player_id, ""))

    def get_room(self, room_id: str) -> Room:
        if room_id not in self.rooms:
            raise ValueError(f"Invalid room id: {room_id}")

        return self.rooms[room_id]

    def create_player(self, player_name: str) -> Player:
        player = Player(str(uuid.uuid4()), player_name)

        self.active_players[player.player_id] = player
        return player

    def create_room(self, host_id: str) -> Room:
        room_id = Room.generate_id()
        while room_id in self.rooms:
            room_id = Room.generate_id()

        room = Room(room_id, host_id)
        self.rooms[room_id] = room

        return room

    def get_players_in_room(self, room_id: str) -> dict[str, Player]:
        return {
            player_id: self.get_player(player_id)
            for player_id in self.get_room(room_id).player_ids
        }

    def add_player_to_room(self, room_id: str, player_id: str) -> bool:
        return self.get_room(room_id).add_player(player_id)

    def drop_player_from_room(self, room_id: str, player_id: str) -> bool:
        room = self.get_room(room_id)

        if not room.remove_player(player_id):
            return False

        if len(room.player_ids) == 0:
            del self.rooms[room.room_id]

        return True
