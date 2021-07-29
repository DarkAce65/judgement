import functools
import inspect
from typing import Any, Awaitable, Callable, TypeVar, cast

from socketio.exceptions import (  # pylint: disable=redefined-builtin
    ConnectionRefusedError,
)

from server.data import (
    connection_manager,
    player_manager,
    room_manager,
    socket_messager,
)
from server.data.player import Player
from server.models.websocket import SetGameMessage
from server.sio_app import sio

Fn = TypeVar("Fn", bound=Callable[..., Awaitable[None]])


def require_player(socket_handler: Fn) -> Fn:
    @functools.wraps(socket_handler)
    async def wrapper(client_id: str, *args: Any, **kwargs: Any) -> None:
        session = await sio.get_session(client_id)
        player_id = session["player_id"]

        try:
            player_exists = (
                False if player_id is None else player_manager.player_exists(player_id)
            )
        except ValueError:
            player_exists = False

        if not player_exists:
            await sio.disconnect(client_id)
            return

        for argname, annotation in inspect.getfullargspec(
            socket_handler
        ).annotations.items():
            if annotation == Player:
                kwargs[argname] = player_manager.get_player(player_id)
                break

        await socket_handler(client_id, *args, **kwargs)

    return cast(Fn, wrapper)


def supply_room_id(socket_handler: Fn) -> Fn:
    @functools.wraps(socket_handler)
    async def wrapper(client_id: str, *args: Any, **kwargs: Any) -> None:
        room_id = connection_manager.get_room_id_for_client(client_id)

        for argname, annotation in inspect.getfullargspec(
            socket_handler
        ).annotations.items():
            if annotation == str and argname == "room_id":
                kwargs[argname] = room_id
                break

        await socket_handler(client_id, *args, **kwargs)

    return cast(Fn, wrapper)


@sio.on("connect")
async def connect(client_id: str, _environ: dict, auth: dict) -> None:
    player_id = None if auth is None else auth["player_id"]

    if player_id is None or not player_manager.player_exists(player_id):
        raise ConnectionRefusedError("unknown_player_id")

    connection_manager.connect_player_client(player_id, client_id)
    await sio.save_session(client_id, {"player_id": player_id})


@sio.on("join_room")
@require_player
async def handle_join_room(client_id: str, room_id: str) -> None:
    connection_manager.add_player_client_to_room(client_id, room_id)
    await socket_messager.emit_players(room_id)


@sio.on("leave_room")
@require_player
async def handle_leave_room(client_id: str, room_id: str) -> None:
    connection_manager.remove_player_client_from_room(client_id, room_id)
    await socket_messager.emit_players(room_id)


@sio.on("set_game")
@require_player
@supply_room_id
async def handle_set_game(
    _client_id: str, raw_message: dict[str, Any], room_id: str
) -> None:
    message = SetGameMessage(**raw_message)
    game = room_manager.set_game(room_id, message.game_name)

    await sio.emit("game_state", game.build_game_state().dict(by_alias=True), to=room_id)


@sio.on("disconnect")
async def disconnect(client_id: str) -> None:
    connection_manager.disconnect_player_client(client_id)
