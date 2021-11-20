from typing import Iterable, Optional, cast

from server.data.player import Player
from server.data.room import Room
from server.game.core import Game, GameError
from server.models.websocket import (
    ConcreteGameState,
    GameErrorMessage,
    GameStateMessage,
    PlayersMessage,
    RoomMessage,
)
from server.sio_app import sio


async def emit_error(error: GameError, recipient: Optional[str] = None) -> None:
    await sio.emit(
        "invalid_input",
        GameErrorMessage(error_message=error.message).dict(by_alias=True),
        to=recipient,
    )


async def emit_room(room: Room, recipient: Optional[str] = None) -> None:
    if recipient is None:
        recipient = room.room_id

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


async def emit_game_state(room_id: str, game: Game) -> None:
    await sio.emit(
        "game_state",
        GameStateMessage(state=cast(ConcreteGameState, game.build_game_state())).dict(
            by_alias=True
        ),
        to=room_id,
    )


async def emit_players(room_id: str, players_in_room: Iterable[Player]) -> None:
    await sio.emit(
        "players",
        PlayersMessage(players=[player.name or "" for player in players_in_room]).dict(
            by_alias=True
        ),
        to=room_id,
    )
