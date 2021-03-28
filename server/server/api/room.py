from typing import Optional

from fastapi import APIRouter, Cookie, Path, Response
from starlette.status import HTTP_204_NO_CONTENT

from server.models.requests import EnsurePlayerRequest
from server.models.responses import RoomResponse
from server.room import room_manager

from .player import ensure_player_and_set_cookie

router = APIRouter(prefix="/room", tags=["room"])


@router.post("/create", response_model=RoomResponse)
async def create_room(
    request: EnsurePlayerRequest,
    response: Response,
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> dict[str, str]:
    player = ensure_player_and_set_cookie(response, player_id, request.player_name)
    room = room_manager.create_room(player.player_id)

    return {"room_id": room.room_id}


@router.post("/join/{room_id}", status_code=HTTP_204_NO_CONTENT)
async def join_room(
    request: EnsurePlayerRequest,
    response: Response,
    room_id: str = Path(..., alias="room_id"),
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> None:
    player = ensure_player_and_set_cookie(response, player_id, request.player_name)
    room_manager.add_player_to_room(player.player_id, room_id)
