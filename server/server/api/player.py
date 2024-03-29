from typing import Optional

from fastapi import APIRouter, Cookie, Response

from server.data import connection_manager, player_manager
from server.models.player import PlayerWithAuth
from server.models.requests import EnsurePlayerRequest

router = APIRouter(prefix="/player", tags=["player"])


async def ensure_player_and_set_cookie(
    response: Response, player_name: str, player_auth_id: Optional[str]
) -> PlayerWithAuth:
    player, should_propagate_name_change = player_manager.ensure_player_with_name(
        player_name, player_auth_id
    )

    if should_propagate_name_change:
        await connection_manager.propagate_name_change(player)

    if player_auth_id is None or player_auth_id != player.player_auth_id:
        response.set_cookie(
            key="player_auth_id", value=player.player_auth_id, max_age=7 * 24 * 60 * 60
        )

    return player


@router.put("", status_code=204)
async def ensure_player(
    request: EnsurePlayerRequest,
    response: Response,
    player_auth_id: Optional[str] = Cookie(None, alias="player_auth_id"),
) -> None:
    await ensure_player_and_set_cookie(response, request.player_name, player_auth_id)
