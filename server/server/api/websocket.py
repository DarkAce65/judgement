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
from server.game.core import GameError
from server.models.player import Player
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

    wrapper.__signature__ = inspect.signature(socket_handler)  # type: ignore
    return cast(Fn, wrapper)


def supply_room_id(socket_handler: Fn) -> Fn:
    @functools.wraps(socket_handler)
    async def wrapper(client_id: str, *args: Any, **kwargs: Any) -> None:
        room_id = connection_manager.get_room_id_for_client(client_id)

        if room_id is None:
            raise ValueError(f"Client {client_id} not connected to a room")

        for argname, annotation in inspect.getfullargspec(
            socket_handler
        ).annotations.items():
            if annotation == str and argname == "room_id":
                kwargs[argname] = room_id
                break

        await socket_handler(client_id, *args, **kwargs)

    wrapper.__signature__ = inspect.signature(socket_handler)  # type: ignore
    return cast(Fn, wrapper)


@sio.on("connect")
async def connect(client_id: str, _environ: dict, auth: dict) -> None:
    player_id = None if auth is None else auth["player_id"]

    if player_id is None or not player_manager.player_exists(player_id):
        raise ConnectionRefusedError("unknown_player_id")

    connection_manager.connect_player_client(player_id, client_id)
    await sio.save_session(client_id, {"player_id": player_id})


@sio.on("get_room")
@require_player
@supply_room_id
async def handle_get_room(_client_id: str, room_id: str, player: Player) -> None:
    await socket_messager.emit_room_to_player(
        room_manager.get_room(room_id), player.player_id
    )


@sio.on("join_room")
@require_player
async def handle_join_room(client_id: str, room_id: str) -> None:
    connection_manager.add_player_client_to_room(client_id, room_id)
    await socket_messager.emit_room(room_manager.get_room(room_id))


@sio.on("leave_room")
@require_player
async def handle_leave_room(client_id: str, room_id: str) -> None:
    connection_manager.remove_player_client_from_room(client_id, room_id)
    await socket_messager.emit_players(
        room_manager.get_players_in_room(room_id).values(), room_id
    )


@sio.on("set_game")
@require_player
@supply_room_id
async def handle_set_game(
    _client_id: str, raw_message: dict[str, Any], room_id: str
) -> None:
    message = SetGameMessage(**raw_message)
    room_manager.set_game(room_id, message.game_name)

    await socket_messager.emit_room(room_manager.get_room(room_id))


@sio.on("confirm_game")
@require_player
@supply_room_id
async def handle_confirm_game(_client_id: str, room_id: str) -> None:
    room_manager.initialize_game(room_id)
    await socket_messager.emit_room(room_manager.get_room(room_id))


@sio.on("start_game")
@require_player
@supply_room_id
async def handle_start_game(_client_id: str, room_id: str) -> None:
    await room_manager.start_game(room_id)
    await socket_messager.emit_room(room_manager.get_room(room_id))


@sio.on("game_input")
@require_player
@supply_room_id
async def handle_game_input(
    client_id: str, action: dict[str, Any], player: Player, room_id: str
) -> None:
    game = room_manager.get_game_for_room(room_id)

    if game is None:
        raise ValueError(f"No game for room id {room_id}")

    try:
        await game.process_raw_input(player.player_id, action)
    except GameError as error:
        await socket_messager.emit_error(error, client_id)
        return


@sio.on("disconnect")
async def disconnect(client_id: str) -> None:
    connection_manager.disconnect_player_client(client_id)
