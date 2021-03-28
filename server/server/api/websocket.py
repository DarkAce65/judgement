import functools
import inspect
from typing import Any, Callable, TypeVar, cast

from socketio import AsyncServer
from socketio.exceptions import ConnectionRefusedError

from server.room import connection_manager, room_manager
from server.room.player import Player

sio = AsyncServer(async_mode="asgi", cors_allowed_origins=[])


F = TypeVar("F", bound=Callable[..., Any])


def require_player(socket_handler: F) -> F:
    @functools.wraps(socket_handler)
    async def wrapper(sid: str, *args: Any, **kwargs: Any) -> Any:
        session = await sio.get_session(sid)
        player_id = session["player_id"]

        try:
            player = None if player_id is None else room_manager.get_player(player_id)
        except ValueError:
            player = None

        if player is None:
            await sio.disconnect(sid)
            return

        for argname, annotation in inspect.getfullargspec(
            socket_handler
        ).annotations.items():
            if annotation == Player:
                kwargs[argname] = player
                break

        return await socket_handler(sid, *args, **kwargs)

    return cast(F, wrapper)


@sio.on("connect")
async def connect(sid: str, _environ: dict, auth: dict) -> None:
    player_id = None if auth is None else auth["player_id"]

    if player_id is None or not room_manager.player_exists(player_id):
        raise ConnectionRefusedError("unknown_player_id")

    connection_manager.connect_player_client(sio, player_id, sid)

    await sio.save_session(sid, {"player_id": player_id})
    await sio.emit("client_connect", {"data": "Client connected: " + sid})


@sio.on("message")
@require_player
async def handle_message(_sid: str, message: str, player: Player) -> None:
    await sio.send(message, to=player.player_id)

    sender = player.player_id if player.name is None else player.name
    await sio.send(
        "broadcast from " + sender,
        skip_sid=list(connection_manager.get_client_ids_for_player(player.player_id)),
    )


@sio.on("disconnect")
async def disconnect(sid: str) -> None:
    session = await sio.get_session(sid)
    player_id = session["player_id"]

    connection_manager.disconnect_player_client(sio, player_id, sid)

    await sio.emit("client_disconnect", {"data": "Client disconnected: " + sid})
