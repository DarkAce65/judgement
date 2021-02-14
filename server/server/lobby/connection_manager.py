from typing import Optional

player_id_to_client_ids: dict[str, set[str]] = {}
client_id_to_player_id: dict[str, str] = {}


def get_client_ids_for_player(player_id: str) -> set[str]:
    return player_id_to_client_ids.get(player_id, set())


def get_client_ids_for_players(player_ids: set[str]) -> set[str]:
    client_ids = [get_client_ids_for_player(player_id) for player_id in player_ids]

    return {
        client_id
        for client_ids_for_player in client_ids
        for client_id in client_ids_for_player
    }


def get_player_id_for_client(client_id: str) -> Optional[str]:
    return client_id_to_player_id.get(client_id, None)


def connect_player_client(player_id: str, client_id: str) -> None:
    if player_id not in player_id_to_client_ids:
        player_id_to_client_ids[player_id] = set()

    player_id_to_client_ids[player_id].add(client_id)

    if client_id in client_id_to_player_id:
        player_id_to_client_ids[client_id_to_player_id[client_id]].remove(client_id)

    client_id_to_player_id[client_id] = player_id


def disconnect_player_client(player_id: str, client_id: str) -> None:
    if player_id not in player_id_to_client_ids:
        raise ValueError(f"Invalid player id: {player_id}")

    if client_id in player_id_to_client_ids[player_id]:
        player_id_to_client_ids[player_id].remove(client_id)

    if client_id in client_id_to_player_id:
        del client_id_to_player_id[client_id]
