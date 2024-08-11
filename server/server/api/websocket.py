import functools
import inspect
from typing import Any, Awaitable, Callable, TypeVar, cast

from socketio.exceptions import (  # pylint: disable=redefined-builtin
    ConnectionRefusedError,
)

from server.data import (
    connection_manager,
    game_manager,
    player_manager,
    socket_messager,
)
from server.game.core import GameError
from server.models.player import Player
from server.sio_app import sio

Fn = TypeVar("Fn", bound=Callable[..., Awaitable[None]])


def require_player(socket_handler: Fn) -> Fn:
    @functools.wraps(socket_handler)
    async def wrapper(client_id: str, *args: Any, **kwargs: Any) -> None:
        player_id = await connection_manager.get_maybe_player_id_for_client(client_id)

        if player_id is None or not player_manager.player_exists(player_id):
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


@sio.on("connect")
async def connect(client_id: str, _environ: dict, auth: dict) -> None:
    player_auth_id = None if auth is None else str(auth["player_auth_id"])
    if player_auth_id is None:
        raise ConnectionRefusedError("Unknown player")

    try:
        player = player_manager.get_player_by_auth(player_auth_id)
    except ValueError as err:
        raise ConnectionRefusedError("Unknown player") from err

    await connection_manager.connect_client(client_id, player.player_id)


@sio.on("join_game")
@require_player
async def handle_join_game(client_id: str, game_id: str) -> None:
    await connection_manager.connect_client_to_game(client_id, game_id)

    player_id = await connection_manager.get_player_id_for_client(client_id)
    game = game_manager.get_game(game_id)
    game.add_player(player_id)

    # await socket_messager.emit_room(room)
    # await socket_messager.emit_players(
    #     player_manager.get_players(room.ordered_player_ids).values(), game_id
    # )


@sio.on("leave_game")
@require_player
async def handle_leave_game(client_id: str, game_id: str) -> None:
    game = game_manager.get_game(game_id)
    player_id = await connection_manager.get_player_id_for_client(client_id)
    game.remove_player(player_id)

    # await socket_messager.emit_room(room_manager.get_room(game_id))


@sio.on("start_game")
@require_player
async def handle_start_game(client_id: str) -> None:
    game_id = await connection_manager.get_game_id_for_client(client_id)
    await game_manager.start_game(game_id)
    # await socket_messager.emit_room(room_manager.get_room(game_id))


@sio.on("game_input")
@require_player
async def handle_game_input(
    client_id: str, action: dict[str, Any], player: Player
) -> None:
    game_id = await connection_manager.get_game_id_for_client(client_id)
    game = game_manager.get_game(game_id)

    try:
        await game.process_raw_input(player.player_id, action)
    except GameError as error:
        await socket_messager.emit_error(error, client_id)
        return


@sio.on("disconnect")
async def disconnect(_client_id: str) -> None:
    # connection_manager.disconnect_player_client(client_id)
    pass
