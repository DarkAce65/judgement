import os
from typing import Any

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis
from socketio import ASGIApp, AsyncServer
from starlette.responses import Response

redis_client = Redis(host="redis")

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


@sio.on("connect")
async def connect(sid: str, _environ: dict) -> None:
    await sio.emit("client_connect", {"data": "Client connected: " + sid})


@sio.on("message")
async def handle_message(sid: str, message: str) -> None:
    await sio.send(message, to=sid)
    await sio.send("broadcast from " + sid)


@sio.on("disconnect")
async def disconnect(sid: str) -> None:
    await sio.emit("client_disconnect", {"data": "Client disconnected: " + sid})
