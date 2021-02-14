import functools
import inspect
import os
from http.cookies import SimpleCookie
from typing import Any, Callable, Optional, TypeVar, cast

from fastapi import Cookie, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp, AsyncServer
from starlette.status import HTTP_204_NO_CONTENT

from server.lobby.lobby_manager import create_room, ensure_player_with_name, get_player
from server.lobby.player import Player
from server.models.requests import CreateGameEnsurePlayerRequest, EnsurePlayerRequest
from server.models.responses import GameResponse
from server.redis_client import redis_client

app = FastAPI()

if "CORS_ALLOWED_ORIGIN" in os.environ:
    origin = os.environ.get("CORS_ALLOWED_ORIGIN")
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


def get_cookie_from_environ(environ: dict[str, Any]) -> SimpleCookie:
    if "asgi.scope" not in environ or "headers" not in environ["asgi.scope"]:
        return SimpleCookie()

    return SimpleCookie(
        next(
            (
                header[1]
                for header in environ["asgi.scope"]["headers"]
                if header[0] == b"cookie"
            ),
            b"",
        ).decode("utf-8")
    )


F = TypeVar("F", bound=Callable[..., Any])


def require_player(socket_handler: F) -> F:
    @functools.wraps(socket_handler)
    async def wrapper(sid: str, *args, **kwargs):  # type: ignore
        cookies = get_cookie_from_environ(sio.get_environ(sid))
        player_id = cookies.get("player_id")

        try:
            player = get_player(player_id.value) if player_id is not None else None
        except ValueError:
            player = None

        if player is None:
            await sio.emit("unknown_player_id", to=sid)
            await sio.disconnect(sid)
            return

        if "player" in inspect.getfullargspec(socket_handler).kwonlyargs:
            kwargs["player"] = player

        return await socket_handler(sid, *args, **kwargs)

    return cast(F, wrapper)


@app.get("/hello")
def hello_world() -> Any:
    test = redis_client.get("test")
    if test is None:
        return "0"

    return test


@app.post("/inc")
def inc() -> Response:
    redis_client.incr("test")

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post("/ensure-player", status_code=HTTP_204_NO_CONTENT)
async def ensure_player(
    request: EnsurePlayerRequest,
    response: Response,
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> None:
    player = ensure_player_with_name(request.player_name, player_id)

    if player_id is None or player_id != player.player_id:
        response.set_cookie(
            key="player_id", value=player.player_id, max_age=7 * 24 * 60 * 60
        )


@app.post("/create-game", response_model=GameResponse)
async def create_game(
    request: CreateGameEnsurePlayerRequest,
    response: Response,
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> dict[str, str]:
    player = ensure_player_with_name(request.player_name, player_id)
    room = create_room(player.player_id)

    if player_id is None or player_id != player.player_id:
        response.set_cookie(
            key="player_id", value=player.player_id, max_age=7 * 24 * 60 * 60
        )

    return {"room_id": room.room_id}


@sio.on("connect")
async def connect(sid: str, _environ: dict) -> None:
    await sio.emit("client_connect", {"data": "Client connected: " + sid})


@sio.on("message")
@require_player
async def handle_message(sid: str, message: str, *, player: Player) -> None:
    await sio.send(message, to=sid)
    await sio.send("broadcast from " + player.name, skip_sid=sid)


@sio.on("disconnect")
async def disconnect(sid: str) -> None:
    await sio.emit("client_disconnect", {"data": "Client disconnected: " + sid})
