import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp
from starlette.middleware.errors import ServerErrorMiddleware

from server.api import player, room

from .sio_app import sio

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


app.include_router(player.router)
app.include_router(room.router)
app.mount("/ws", ASGIApp(sio))
