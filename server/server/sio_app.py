import logging

from socketio import AsyncServer

logger = logging.getLogger(__name__)
sio = AsyncServer(logger=logger, async_mode="asgi", cors_allowed_origins=[])
