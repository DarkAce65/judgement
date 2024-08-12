from typing import Annotated

from fastapi import APIRouter, Depends, Path

from server.api.dependencies import get_or_create_player
from server.data import game_manager
from server.models.api import CreateGameRequest, GameIdResponse, GameResponse
from server.models.player import Player

router = APIRouter(prefix="/games", tags=["games"])


@router.get("/{game_id}/exists")
async def does_game_exist(game_id: Annotated[str, Path(alias="game_id")]) -> bool:
    return game_manager.game_exists(game_id)


@router.get("/{game_id}")
async def get_game(game_id: Annotated[str, Path(alias="game_id")]) -> GameResponse:
    game = game_manager.get_game(game_id)
    return GameResponse.from_game(game)


@router.post("/create")
async def create_game(
    request: CreateGameRequest, player: Annotated[Player, Depends(get_or_create_player)]
) -> GameIdResponse:
    game = game_manager.create_game(request.game_name)
    game.add_player(player.player_id)
    return GameIdResponse(game_id=game.game_id)
