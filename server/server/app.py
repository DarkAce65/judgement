import os
from typing import Any, Optional

from fastapi import Cookie, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp, AsyncServer

from server.lobby.lobby_handler import LobbyHandler
from server.models.requests import CreateGameRequest
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


lobby_handler = LobbyHandler()


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


@app.post("/create-game", response_model=GameResponse)
async def create_game(
    request: CreateGameRequest,
    response: Response,
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> dict[str, str]:
    player = lobby_handler.ensure_player_with_name(request.player_name, player_id)
    room = lobby_handler.create_room(player.player_id)

    response.set_cookie(key="player_id", value=player.player_id, max_age=7 * 24 * 60 * 60)

    return {"room_id": room.room_id}


@sio.on("connect")
async def connect(sid: str, _environ: dict) -> None:
    await sio.emit("client_connect", {"data": "Client connected: " + sid})


@sio.on("message")
async def handle_message(sid: str, message: str) -> None:
    await sio.send(message, to=sid)
    await sio.send("broadcast from " + sid, skip_sid=sid)


@sio.on("disconnect")
async def disconnect(sid: str) -> None:
    await sio.emit("client_disconnect", {"data": "Client disconnected: " + sid})
