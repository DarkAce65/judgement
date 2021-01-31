import random
import string
import time
import uuid

ROOM_ID_LENGTH = 4


class Player:
    player_id: str
    name: str
    num_joined_rooms: int

    def __init__(self, name: str) -> None:
        self.player_id = str(uuid.uuid4())
        self.name = name

        self.num_joined_rooms = 0


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
        return "".join(random.choices(string.ascii_lowercase, k=ROOM_ID_LENGTH))

    @staticmethod
    def is_valid_id(room_id: str) -> bool:
        return len(room_id) == ROOM_ID_LENGTH and room_id.islower()

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
        if player_id not in self.active_players:
            raise ValueError(f"Invalid player id: {player_id}")

        return self.active_players[player_id]

    def get_room(self, room_id: str) -> Room:
        if room_id not in self.rooms:
            raise ValueError(f"Invalid room id: {room_id}")

        return self.rooms[room_id]

    def create_player(self, player_name: str) -> Player:
        player = Player(player_name)

        self.active_players[player.player_id] = player
        return player

    def create_room(self, host_id: str) -> Room:
        player = self.get_player(host_id)

        room_id = Room.generate_id()
        while room_id in self.rooms:
            room_id = Room.generate_id()

        room = Room(room_id, host_id)
        self.rooms[room_id] = room

        player.num_joined_rooms += 1

        return room

    def get_players_in_room(self, room_id: str) -> dict[str, Player]:
        return {
            player_id: self.get_player(player_id)
            for player_id in self.get_room(room_id).player_ids
        }

    def add_player_to_room(self, room_id: str, player_id: str) -> Room:
        player = self.get_player(player_id)
        room = self.get_room(room_id)

        if room.add_player(player_id):
            player.num_joined_rooms += 1

        return room

    def drop_player_from_room(self, room_id: str, player_id: str) -> bool:
        player = self.get_player(player_id)
        room = self.get_room(room_id)

        if not room.remove_player(player_id):
            return False

        if player.num_joined_rooms <= 1:
            del self.active_players[player_id]
        else:
            player.num_joined_rooms -= 1

        if len(room.player_ids) == 0:
            del self.rooms[room.room_id]

        return True
