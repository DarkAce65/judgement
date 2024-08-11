from typing import Annotated

from fastapi import APIRouter, Path

from server.data import game_manager
from server.models.requests import CreateGameRequest
from server.models.responses import GameIdResponse, GameResponse

router = APIRouter(prefix="/games", tags=["games"])


@router.post("/create", response_model=GameIdResponse)
async def create_game(request: CreateGameRequest) -> GameIdResponse:
    game_id = game_manager.create_game(request.game_name)
    return GameIdResponse(game_id=game_id)


@router.get("/{game_id}/exists")
async def does_game_exist(game_id: Annotated[str, Path(alias="game_id")]) -> bool:
    return game_manager.game_exists(game_id)


@router.get("/{game_id}", response_model=GameResponse)
async def get_game(game_id: Annotated[str, Path(alias="game_id")]) -> GameResponse:
    game = game_manager.get_game(game_id)
    return GameResponse.from_game(game)
