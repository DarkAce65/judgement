import functools
import inspect
import os
from typing import Any, Callable, Optional, TypeVar, cast

from fastapi import Cookie, FastAPI, Path, Response
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp, AsyncServer
from socketio.exceptions import ConnectionRefusedError
from starlette.middleware.errors import ServerErrorMiddleware
from starlette.status import HTTP_204_NO_CONTENT

from server.models.requests import EnsurePlayerRequest
from server.models.responses import RoomResponse
from server.room import connection_manager, room_manager
from server.room.player import Player

app = FastAPI()

if "CORS_ALLOWED_ORIGIN" in os.environ:
    origin = os.environ.get("CORS_ALLOWED_ORIGIN")

    app.add_middleware(ServerErrorMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

sio = AsyncServer(async_mode="asgi", cors_allowed_origins=[])
socket_asgi = ASGIApp(sio)
app.mount("/ws", socket_asgi)


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


def ensure_player_and_set_cookie(
    response: Response,
    player_id: Optional[str],
    player_name: Optional[str],
) -> Player:
    player = room_manager.ensure_player_with_name(player_id, player_name)

    if player_id is None or player_id != player.player_id:
        response.set_cookie(
            key="player_id", value=player.player_id, max_age=7 * 24 * 60 * 60
        )

    return player


@app.post("/ensure-player", status_code=HTTP_204_NO_CONTENT, tags=["player"])
async def ensure_player(
    request: EnsurePlayerRequest,
    response: Response,
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> None:
    ensure_player_and_set_cookie(response, player_id, request.player_name)


@app.post("/create-room", response_model=RoomResponse, tags=["room"])
async def create_room(
    request: EnsurePlayerRequest,
    response: Response,
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> dict[str, str]:
    player = ensure_player_and_set_cookie(response, player_id, request.player_name)
    room = room_manager.create_room(player.player_id)

    return {"room_id": room.room_id}


@app.post("/join-room/{room_id}", status_code=HTTP_204_NO_CONTENT, tags=["room"])
async def join_room(
    request: EnsurePlayerRequest,
    response: Response,
    room_id: str = Path(..., alias="room_id"),
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> None:
    player = ensure_player_and_set_cookie(response, player_id, request.player_name)
    room_manager.add_player_to_room(player.player_id, room_id)


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
