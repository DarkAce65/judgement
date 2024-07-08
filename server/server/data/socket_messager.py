from typing import Iterable, Optional, Union, cast

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
    game_states = room.get_game_states(set(room.ordered_player_ids))

    for player_id in room.ordered_player_ids:
        await sio.emit(
            "room",
            RoomMessage(
                room_id=room.room_id,
                status=room.room_status,
                ordered_player_ids=room.ordered_player_ids,
                game_name=room.game_name,
                game=(
                    None
                    if game_states is None
                    else cast(ConcreteGameState, game_states[player_id])
                ),
            ).dict(by_alias=True),
            to=f"{room.room_id}/{player_id}",
        )


async def emit_room_to_player(room: Room, player_id: int) -> None:
    game_states = room.get_game_states(set([player_id]))
    game_state = None if game_states is None else game_states[player_id]
    await sio.emit(
        "room",
        RoomMessage(
            room_id=room.room_id,
            status=room.room_status,
            ordered_player_ids=room.ordered_player_ids,
            game_name=room.game_name,
            game=cast(Optional[ConcreteGameState], game_state),
        ).dict(by_alias=True),
        to=f"{room.room_id}/{player_id}",
    )


async def emit_game_state(game: Game) -> None:
    game_states = game.build_game_states(set(game.players.keys()))
    for player_id in game.players.keys():
        await sio.emit(
            "game_state",
            GameStateMessage(state=cast(ConcreteGameState, game_states[player_id])).dict(
                by_alias=True
            ),
            to=f"{game.room_id}/{player_id}",
        )


async def emit_players(
    players: Iterable[Player], recipient: Union[list[str], str]
) -> None:
    player_names: dict[int, str] = {}
    for player in players:
        if player.name is not None:
            player_names[player.player_id] = player.name

    await sio.emit(
        "players",
        PlayersMessage(player_names=player_names).dict(by_alias=True),
        to=recipient,
    )
