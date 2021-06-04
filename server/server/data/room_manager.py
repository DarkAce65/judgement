from . import player_manager
from .player import Player
from .room import Room

rooms: dict[str, Room] = {}


def get_all_rooms() -> list[Room]:
    return list(rooms.values())


def room_exists(room_id: str) -> bool:
    return room_id in rooms


def get_room(room_id: str) -> Room:
    if not room_exists(room_id):
        raise ValueError(f"Invalid room id: {room_id}")

    return rooms[room_id]


def create_room() -> Room:
    room_id = Room.generate_id()
    while room_id in rooms:
        room_id = Room.generate_id()

    room = Room(room_id)
    rooms[room_id] = room

    return room


def get_players_in_room(room_id: str) -> dict[str, Player]:
    return player_manager.get_players(get_room(room_id).player_ids)


def add_player_to_room(player_id: str, room_id: str) -> Room:
    player = player_manager.get_player(player_id)
    room = get_room(room_id)

    if room.add_player(player_id):
        player.joined_room_ids.add(room_id)

    return room


def drop_player_from_room(player_id: str, room_id: str) -> bool:
    player = player_manager.get_player(player_id)
    room = get_room(room_id)

    if not room.remove_player(player_id):
        return False

    player.joined_room_ids.remove(room_id)

    if len(room.player_ids) == 0:
        del rooms[room.room_id]

    return True
