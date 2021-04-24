import functools
import inspect
from typing import Any, Callable, TypeVar, cast

from socketio.exceptions import ConnectionRefusedError

from server.data import connection_manager, player_manager, socket_messager
from server.data.player import Player
from server.models.websocket import StringMessage
from server.sio_app import sio

F = TypeVar("F", bound=Callable[..., Any])


def require_player(socket_handler: F) -> F:
    @functools.wraps(socket_handler)
    async def wrapper(client_id: str, *args: Any, **kwargs: Any) -> Any:
        session = await sio.get_session(client_id)
        player_id = session["player_id"]

        try:
            player = None if player_id is None else player_manager.get_player(player_id)
        except ValueError:
            player = None

        if player is None:
            await sio.disconnect(client_id)
            return

        for argname, annotation in inspect.getfullargspec(
            socket_handler
        ).annotations.items():
            if annotation == Player:
                kwargs[argname] = player
                break

        return await socket_handler(client_id, *args, **kwargs)

    return cast(F, wrapper)


@sio.on("connect")
async def connect(client_id: str, _environ: dict, auth: dict) -> None:
    player_id = None if auth is None else auth["player_id"]

    if player_id is None or not player_manager.player_exists(player_id):
        raise ConnectionRefusedError("unknown_player_id")

    connection_manager.connect_player_client(player_id, client_id)

    await sio.save_session(client_id, {"player_id": player_id})
    await sio.emit(
        "client_connect", StringMessage(data="Client connected: " + client_id).dict()
    )


@sio.on("join_room")
@require_player
async def handle_join_room(client_id: str, room_id: str) -> None:
    connection_manager.add_player_client_to_room(client_id, room_id)
    await socket_messager.emit_players(room_id)


@sio.on("message")
@require_player
async def handle_message(_client_id: str, message: str, player: Player) -> None:
    await sio.send(message, to=player.player_id)

    sender = player.player_id if player.name is None else player.name
    await sio.send(
        "broadcast from " + sender,
        skip_sid=list(connection_manager.get_client_ids_for_player(player.player_id)),
    )


@sio.on("disconnect")
async def disconnect(client_id: str) -> None:
    connection_manager.disconnect_player_client(client_id)
    await sio.emit(
        "client_disconnect",
        StringMessage(data="Client disconnected: " + client_id).dict(),
    )
