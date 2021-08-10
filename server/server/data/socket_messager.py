from typing import Optional

from server.models.websocket import PlayersMessage, RoomMessage
from server.sio_app import sio

from . import room_manager


async def emit_room(room_id: str, recipient: Optional[str] = None) -> None:
    if recipient is None:
        recipient = room_id

    room = room_manager.get_room(room_id)

    await sio.emit(
        "room",
        RoomMessage(
            state=room.room_state,
            players=[player.name or "" for player in room.players],
            game_name=room.game_name,
            game=room.get_game_state(),
        ).dict(by_alias=True),
        to=recipient,
    )


async def emit_players(room_id: str) -> None:
    players_in_room = room_manager.get_players_in_room(room_id).values()

    await sio.emit(
        "players",
        PlayersMessage(players=[player.name or "" for player in players_in_room]).dict(
            by_alias=True
        ),
        to=room_id,
    )
