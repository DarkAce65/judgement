from server.sio_app import sio

from . import player_manager

player_id_to_client_ids: dict[str, set[str]] = {}
client_id_to_room_id: dict[str, str] = {}


def get_client_ids_for_player(player_id: str) -> set[str]:
    if not player_manager.player_exists(player_id):
        raise ValueError(f"Invalid player id: {player_id}")

    return player_id_to_client_ids.get(player_id, set())


def get_client_ids_for_players(player_ids: set[str]) -> set[str]:
    client_ids = [get_client_ids_for_player(player_id) for player_id in player_ids]

    return {
        client_id
        for client_ids_for_player in client_ids
        for client_id in client_ids_for_player
    }


def connect_player_client(player_id: str, client_id: str) -> None:
    if player_id not in player_id_to_client_ids:
        player_id_to_client_ids[player_id] = set()

    player_id_to_client_ids[player_id].add(client_id)
    sio.enter_room(client_id, player_id)


def add_player_client_to_room(client_id: str, room_id: str) -> None:
    if client_id in client_id_to_room_id:
        sio.leave_room(client_id, client_id_to_room_id[client_id])

    sio.enter_room(client_id, room_id)
    client_id_to_room_id[client_id] = room_id


def disconnect_player_client(player_id: str, client_id: str) -> None:
    if (
        player_id in player_id_to_client_ids
        and client_id in player_id_to_client_ids[player_id]
    ):
        player_id_to_client_ids[player_id].remove(client_id)

    if client_id in client_id_to_room_id:
        del client_id_to_room_id[client_id]
