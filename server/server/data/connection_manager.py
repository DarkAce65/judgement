from typing import Any

from server.sio_app import sio


def get_websocket_room_id(
    *,
    client_id: str | None = None,
    game_id: str | None = None,
    player_id: int | None = None,
) -> str:
    if client_id is not None:
        return client_id

    if game_id is not None:
        if player_id is not None:
            return f"game/{game_id}/{player_id}"
        return f"game/{game_id}"

    if player_id is not None:
        return f"player/{player_id}"

    raise TypeError("No client id, player id, or game id was provided")


async def get_client_session(client_id: str) -> dict[str, Any]:
    return await sio.get_session(client_id)


async def get_maybe_player_id_for_client(client_id: str) -> int | None:
    session = await get_client_session(client_id)
    return session.get("player_id")


async def get_maybe_game_id_for_client(client_id: str) -> str | None:
    session = await get_client_session(client_id)
    return session.get("game_id")


async def get_player_id_for_client(client_id: str) -> int:
    player_id = await get_maybe_player_id_for_client(client_id)
    if player_id is None:
        raise ValueError(f"Client doesn't have a player id: {client_id}")
    return player_id


async def get_game_id_for_client(client_id: str) -> str:
    game_id = await get_maybe_game_id_for_client(client_id)
    if game_id is None:
        raise ValueError("Client is not connected to a game")
    return game_id


async def connect_client(client_id: str, player_id: int) -> None:
    await sio.enter_room(client_id, get_websocket_room_id(player_id=player_id))
    async with sio.session(client_id) as session:
        session["player_id"] = player_id


async def connect_client_to_game(client_id: str, game_id: str) -> None:
    player_id = await get_player_id_for_client(client_id)
    async with sio.session(client_id) as session:
        session["game_id"] = game_id
    await sio.enter_room(client_id, get_websocket_room_id(game_id=game_id))
    await sio.enter_room(
        client_id, get_websocket_room_id(game_id=game_id, player_id=player_id)
    )


async def disconnect_client_from_game(client_id: str) -> None:
    player_id = await get_player_id_for_client(client_id)
    game_id = await get_game_id_for_client(client_id)
    async with sio.session(client_id) as session:
        del session["game_id"]
    await sio.leave_room(client_id, get_websocket_room_id(game_id=game_id))
    await sio.leave_room(
        client_id, get_websocket_room_id(game_id=game_id, player_id=player_id)
    )
