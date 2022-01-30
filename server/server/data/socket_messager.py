from typing import Iterable, Optional, cast

from server.game.core import Game, GameError
from server.models.player import Player
from server.models.room import Room
from server.models.websocket import (
    ConcreteGameState,
    GameErrorMessage,
    GameStateMessage,
    PlayersMessage,
    RoomMessage,
)
from server.sio_app import sio


async def emit_error(error: GameError, recipient: str) -> None:
    await sio.emit(
        "invalid_input",
        GameErrorMessage(error_message=error.message).dict(by_alias=True),
        to=recipient,
    )


async def emit_room(room: Room) -> None:
    player_names = [player.name or "" for player in room.players]
    game_states = room.get_game_states({player.player_id for player in room.players})

    for player in room.players:
        await sio.emit(
            "room",
            RoomMessage(
                status=room.room_status,
                players=player_names,
                game_name=room.game_name,
                game=None
                if game_states is None
                else cast(ConcreteGameState, game_states[player.player_id]),
            ).dict(by_alias=True),
            to=str(player.player_id),
        )


async def emit_room_to_player(room: Room, player_id: int) -> None:
    game_states = room.get_game_states(set([player_id]))
    game_state = None if game_states is None else game_states[player_id]
    await sio.emit(
        "room",
        RoomMessage(
            status=room.room_status,
            players=[player.name or "" for player in room.players],
            game_name=room.game_name,
            game=cast(Optional[ConcreteGameState], game_state),
        ).dict(by_alias=True),
        to=str(player_id),
    )


async def emit_game_state(game: Game) -> None:
    game_states = game.build_game_states(set(game.players.keys()))
    for player_id in game.players.keys():
        await sio.emit(
            "game_state",
            GameStateMessage(state=cast(ConcreteGameState, game_states[player_id])).dict(
                by_alias=True
            ),
            to=str(player_id),
        )


async def emit_players(players_in_room: Iterable[Player], recipient: str) -> None:
    await sio.emit(
        "players",
        PlayersMessage(players=[player.name or "" for player in players_in_room]).dict(
            by_alias=True
        ),
        to=recipient,
    )
