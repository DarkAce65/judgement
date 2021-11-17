from typing import Optional, cast

from server.game.core import Game, GameError
from server.models.websocket import (
    ConcreteGameState,
    GameErrorMessage,
    GameStateMessage,
    PlayersMessage,
    RoomMessage,
)
from server.sio_app import sio

from . import room_manager


async def emit_error(error: GameError, recipient: Optional[str] = None) -> None:
    await sio.emit(
        "invalid_input",
        GameErrorMessage(error_message=error.message).dict(by_alias=True),
        to=recipient,
    )


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
            game=cast(Optional[ConcreteGameState], room.get_game_state()),
        ).dict(by_alias=True),
        to=recipient,
    )


async def emit_game_state(room_id: str, game: Optional[Game] = None) -> None:
    if game is None:
        game = room_manager.get_game_for_room(room_id)
        if game is None:
            return

    await sio.emit(
        "game_state",
        GameStateMessage(state=cast(ConcreteGameState, game.build_game_state())).dict(
            by_alias=True
        ),
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
