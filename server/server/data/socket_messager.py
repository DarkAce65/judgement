from typing import Iterable, Union, cast

from server.data import connection_manager
from server.game.core import Game, GameError
from server.models.player import Player
from server.models.websocket import (
    ConcreteGameState,
    GameErrorMessage,
    GameStateMessage,
    PlayersMessage,
)
from server.sio_app import sio


async def emit_error(error: GameError, recipient: str) -> None:
    await sio.emit(
        "invalid_input",
        GameErrorMessage(error_message=error.message).model_dump_json(by_alias=True),
        to=recipient,
    )


async def emit_game_state(game: Game) -> None:
    game_states = game.build_game_states(set(game.players.keys()))
    for player_id in game.players.keys():
        await sio.emit(
            "game_state",
            GameStateMessage(
                state=cast(ConcreteGameState, game_states[player_id])
            ).model_dump_json(by_alias=True),
            to=connection_manager.get_websocket_room_id(
                game_id=game.game_id, player_id=player_id
            ),
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
        PlayersMessage(player_names=player_names).model_dump_json(by_alias=True),
        to=recipient,
    )
