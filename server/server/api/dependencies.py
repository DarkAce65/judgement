from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Response

from server.data import player_manager
from server.models.player import Player

PLAYER_COOKIE_MAX_AGE = 7 * 24 * 60 * 60


def set_player_cookies(response: Response, player_auth_id: str, player_name: str) -> None:
    response.set_cookie(
        key="player_auth_id", value=player_auth_id, max_age=PLAYER_COOKIE_MAX_AGE
    )
    response.set_cookie(
        key="player_name", value=player_name, max_age=PLAYER_COOKIE_MAX_AGE
    )


def get_player_cookies(
    player_auth_id: Annotated[str | None, Cookie(alias="player_auth_id")] = None,
    player_name: Annotated[str | None, Cookie(alias="player_name")] = None,
) -> tuple[str | None, str | None]:
    return (player_auth_id, player_name)


def get_or_create_player(
    response: Response,
    player_cookies: Annotated[tuple[str | None, str | None], Depends(get_player_cookies)],
) -> Player:
    player_auth_id, player_name = player_cookies
    if player_auth_id is None or not player_manager.player_exists_by_auth(player_auth_id):
        if player_name is None:
            raise HTTPException(
                status_code=403, detail="No player identifier was provided"
            )
        player, player_auth_id = player_manager.create_player(player_name)
        set_player_cookies(response, player_auth_id, player_name)
    else:
        player = player_manager.get_player_by_auth(player_auth_id)
        set_player_cookies(response, player_auth_id, player.name)

    return player


def get_player(
    player_auth_id: Annotated[str | None, Cookie(alias="player_auth_id")] = None,
) -> Player:
    if player_auth_id is None:
        raise HTTPException(status_code=403, detail="Missing player cookie")

    try:
        return player_manager.get_player_by_auth(player_auth_id)
    except ValueError:
        raise HTTPException(status_code=403, detail="Invalid player cookie") from None
