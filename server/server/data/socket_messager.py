from server.models.websocket import PlayersMessage
from server.sio_app import sio

from . import room_manager


async def emit_players(room_id: str) -> None:
    players_in_room = room_manager.get_players_in_room(room_id).values()

    await sio.emit(
        "players",
        PlayersMessage(players=[player.name or "" for player in players_in_room]).dict(),
        to=room_id,
    )
