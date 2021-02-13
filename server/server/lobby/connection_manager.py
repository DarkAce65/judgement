player_clients: dict[str, set[str]] = {}


def get_player_clients(player_id: str) -> set[str]:
    if player_id not in player_clients:
        return set()

    return player_clients[player_id]


def connect_player_client(player_id: str, client_id: str) -> None:
    if player_id not in player_clients:
        player_clients[player_id] = set()

    player_clients[player_id].add(client_id)


def disconnect_player_client(player_id: str, client_id: str) -> None:
    if player_id not in player_clients:
        raise ValueError(f"Invalid player id: {player_id}")

    if client_id in player_clients[player_id]:
        player_clients[player_id].remove(client_id)
