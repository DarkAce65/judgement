from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Response

from server.api.dependencies import get_player
from server.data import player_manager
from server.models.api import PlayerNameModel
from server.models.player import Player

router = APIRouter(prefix="/player", tags=["player"])


@router.put("/ensure")
async def ensure_player(
    request: PlayerNameModel,
    response: Response,
    player_auth_id: Annotated[str | None, Cookie(alias="player_auth_id")] = None,
) -> PlayerNameModel:
    player_name = request.player_name

    if player_auth_id is None or not player_manager.player_exists_by_auth(player_auth_id):
        player, player_auth_id = player_manager.create_player(player_name)
        response.set_cookie(
            key="player_auth_id", value=player_auth_id, max_age=7 * 24 * 60 * 60
        )
    else:
        player = player_manager.get_player_by_auth(player_auth_id)

    return PlayerNameModel(player_name=player.name)


@router.put("/set-name", status_code=204)
async def set_name(
    request: PlayerNameModel, player: Annotated[Player, Depends(get_player)]
) -> None:
    player_manager.set_player_name(player.player_id, player_name=request.player_name)
