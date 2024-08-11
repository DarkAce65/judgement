from typing import Annotated

from fastapi import Cookie, HTTPException

from server.data import player_manager
from server.models.player import Player


async def get_player(
    player_auth_id: Annotated[str | None, Cookie(alias="player_auth_id")] = None
) -> Player:
    if player_auth_id is None:
        raise HTTPException(status_code=403, detail="Missing player cookie")

    try:
        return player_manager.get_player_by_auth(player_auth_id)
    except ValueError:
        raise HTTPException(  # pylint: disable=raise-missing-from
            status_code=403, detail="Invalid player cookie"
        )
