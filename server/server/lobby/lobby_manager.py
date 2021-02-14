from typing import Optional

from .player import Player
from .room import Room

active_players: dict[str, Player] = {}
rooms: dict[str, Room] = {}


def player_exists(player_id: str) -> bool:
    return player_id in active_players


def get_player(player_id: str) -> Player:
    if not player_exists(player_id):
        raise ValueError(f"Invalid player id: {player_id}")

    return active_players[player_id]


def get_room(room_id: str) -> Room:
    if room_id not in rooms:
        raise ValueError(f"Invalid room id: {room_id}")

    return rooms[room_id]


def ensure_player_with_name(player_name: str, player_id: Optional[str] = None) -> Player:
    if player_id is not None and player_exists(player_id):
        player = get_player(player_id)
        player.name = player_name
        return player

    player = Player(player_name)
    active_players[player.player_id] = player

    return player


def create_room(host_id: str) -> Room:
    player = get_player(host_id)

    room_id = Room.generate_id()
    while room_id in rooms:
        room_id = Room.generate_id()

    room = Room(room_id, host_id)
    rooms[room_id] = room

    player.num_joined_rooms += 1

    return room


def get_players_in_room(room_id: str) -> dict[str, Player]:
    return {
        player_id: get_player(player_id) for player_id in get_room(room_id).player_ids
    }


def add_player_to_room(room_id: str, player_id: str) -> Room:
    player = get_player(player_id)
    room = get_room(room_id)

    if room.add_player(player_id):
        player.num_joined_rooms += 1

    return room


def drop_player_from_room(room_id: str, player_id: str) -> bool:
    player = get_player(player_id)
    room = get_room(room_id)

    if not room.remove_player(player_id):
        return False

    player.num_joined_rooms -= 1

    if len(room.player_ids) == 0:
        del rooms[room.room_id]

    return True
