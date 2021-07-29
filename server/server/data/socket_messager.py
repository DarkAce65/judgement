from server.models.websocket import PlayersMessage, RoomMessage
from server.sio_app import sio

from . import room_manager


async def emit_room(room_id: str) -> None:
    room = room_manager.get_room(room_id)
    game_state = None if room.game is None else room.game.build_game_state()

    await sio.emit(
        "room",
        RoomMessage(
            state=room.room_state,
            players=[player.name or "" for player in room.players],
            game=game_state,
        ).dict(by_alias=True),
        to=room_id,
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
