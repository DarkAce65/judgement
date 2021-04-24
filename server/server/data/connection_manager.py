from collections import defaultdict

from server.data import room_manager
from server.sio_app import sio

from . import player_manager, socket_messager


class PlayerClientIdMapping:
    player_id_to_client_ids: defaultdict[str, set[str]]
    client_id_to_player_id: dict[str, str]

    def __init__(self) -> None:
        self.player_id_to_client_ids = defaultdict(set)
        self.client_id_to_player_id = {}

    def get_client_ids_for_player(self, player_id: str) -> set[str]:
        return self.player_id_to_client_ids.get(player_id, set())

    def get_player_id_for_client(self, client_id: str) -> str:
        return self.client_id_to_player_id[client_id]

    def add_pair(self, player_id: str, client_id: str) -> None:
        self.player_id_to_client_ids[player_id].add(client_id)
        self.client_id_to_player_id[client_id] = player_id

    def remove_pair(self, player_id: str, client_id: str) -> None:
        self.player_id_to_client_ids[player_id].remove(client_id)
        del self.client_id_to_player_id[client_id]

    def remove_player_id(self, player_id: str) -> None:
        for client_id in self.get_client_ids_for_player(player_id):
            del self.client_id_to_player_id[client_id]

        del self.player_id_to_client_ids[player_id]

    def remove_client_id(self, client_id: str) -> None:
        if client_id in self.client_id_to_player_id:
            player_id = self.client_id_to_player_id[client_id]
            self.player_id_to_client_ids[player_id].remove(client_id)

        del self.client_id_to_player_id[client_id]


player_client_mapping = PlayerClientIdMapping()
client_id_to_room_id: dict[str, str] = {}


def get_client_ids_for_player(player_id: str) -> set[str]:
    if not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id: {player_id}")

    return player_client_mapping.get_client_ids_for_player(player_id)


def get_client_ids_for_players(player_ids: set[str]) -> set[str]:
    client_ids = [get_client_ids_for_player(player_id) for player_id in player_ids]

    return {
        client_id
        for client_ids_for_player in client_ids
        for client_id in client_ids_for_player
    }


def connect_player_client(player_id: str, client_id: str) -> None:
    player_client_mapping.add_pair(player_id, client_id)
    sio.enter_room(client_id, player_id)


async def propagate_name_change(player_id: str) -> None:
    room_ids = {
        client_id_to_room_id[client_id]
        for client_id in get_client_ids_for_player(player_id)
    }
    for room_id in room_ids:
        await socket_messager.emit_players(room_id)


def add_player_client_to_room(client_id: str, room_id: str) -> None:
    player_id = player_client_mapping.get_player_id_for_client(client_id)

    room_manager.add_player_to_room(player_id, room_id)

    if client_id in client_id_to_room_id:
        sio.leave_room(client_id, client_id_to_room_id[client_id])

    sio.enter_room(client_id, room_id)
    client_id_to_room_id[client_id] = room_id


def remove_player_client_from_room(client_id: str, room_id: str) -> None:
    player_id = player_client_mapping.get_player_id_for_client(client_id)

    if room_manager.get_room(room_id).has_player(player_id):
        room_manager.add_player_to_room(player_id, room_id)

        if client_id in client_id_to_room_id:
            sio.leave_room(client_id, client_id_to_room_id[client_id])
            room_manager.drop_player_from_room(player_id, room_id)

            del client_id_to_room_id[client_id]


def disconnect_player_client(client_id: str) -> None:
    player_client_mapping.remove_client_id(client_id)

    if client_id in client_id_to_room_id:
        del client_id_to_room_id[client_id]
