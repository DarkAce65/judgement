from server.data import room_manager
from server.sio_app import sio
from server.utils.bimultidict import bimultidict

from . import player_manager, socket_messager

player_client_mapping: bimultidict[str, str] = bimultidict()
room_client_mapping: bimultidict[str, str] = bimultidict()


def get_client_ids_for_player(player_id: str) -> set[str]:
    if not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id: {player_id}")

    return player_client_mapping.get(player_id, set())


def get_client_ids_for_players(player_ids: set[str]) -> set[str]:
    client_ids = [get_client_ids_for_player(player_id) for player_id in player_ids]

    return {
        client_id
        for client_ids_for_player in client_ids
        for client_id in client_ids_for_player
    }


def connect_player_client(player_id: str, client_id: str) -> None:
    player_client_mapping.put(player_id, client_id)
    sio.enter_room(client_id, player_id)


async def propagate_name_change(player_id: str) -> None:
    room_ids = room_manager.get_joined_room_ids_for_player(player_id)
    for room_id in room_ids:
        await socket_messager.emit_players(room_id)


def add_player_client_to_room(client_id: str, room_id: str) -> None:
    player_id = player_client_mapping.get_key(client_id)

    if room_client_mapping.contains_value(client_id):
        old_room_id = room_client_mapping.get_key(client_id)
        sio.leave_room(client_id, old_room_id)
        sio.leave_room(client_id, f"{old_room_id}/{player_id}")

    room_client_mapping.put(room_id, client_id)

    room_manager.add_player_to_room(player_id, room_id)
    sio.enter_room(client_id, room_id)
    sio.enter_room(client_id, f"{room_id}/{player_id}")


def remove_player_client_from_room(client_id: str, room_id: str) -> None:
    player_id = player_client_mapping.get_key(client_id)
    client_ids_for_player = get_client_ids_for_player(player_id)

    for c_id in client_ids_for_player:
        if room_client_mapping.contains_value(c_id):
            room_client_mapping.remove_value(c_id)
            old_room_id = room_client_mapping.get_key(c_id)
            sio.leave_room(c_id, old_room_id)
            sio.leave_room(c_id, f"{old_room_id}/{player_id}")

    room_manager.drop_player_from_room(player_id, room_id)


def disconnect_player_client(client_id: str) -> None:
    if player_client_mapping.contains_value(client_id):
        player_client_mapping.remove_value(client_id)
    if room_client_mapping.contains_value(client_id):
        room_client_mapping.remove_value(client_id)
