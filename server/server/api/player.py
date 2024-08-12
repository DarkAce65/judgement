from typing import Annotated

from fastapi import APIRouter, Depends

from server.api.dependencies import get_or_create_player, get_player
from server.data import player_manager
from server.models.api import PlayerNameModel
from server.models.player import Player

router = APIRouter(prefix="/player", tags=["player"])


@router.put("/ensure", status_code=204, dependencies=[Depends(get_or_create_player)])
async def ensure_player() -> None:
    pass


@router.put("/set-name", status_code=204)
async def set_name(
    request: PlayerNameModel, player: Annotated[Player, Depends(get_player)]
) -> None:
    player_manager.set_player_name(player.player_id, player_name=request.player_name)
