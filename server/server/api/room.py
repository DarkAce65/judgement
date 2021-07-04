from typing import Optional

from fastapi import APIRouter, Cookie, HTTPException, Path, Response
from starlette.status import HTTP_204_NO_CONTENT

from server.data import room_manager
from server.models.requests import EnsurePlayerRequest
from server.models.responses import RoomIdResponse

from .player import ensure_player_and_set_cookie

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("/create", response_model=RoomIdResponse)
async def create_room() -> RoomIdResponse:
    room_id = room_manager.create_room()

    return RoomIdResponse(room_id=room_id)


@router.head("/{room_id}/exists", status_code=HTTP_204_NO_CONTENT)
async def does_room_exist(room_id: str = Path(..., alias="room_id")) -> None:
    if not room_manager.room_exists(room_id):
        raise HTTPException(status_code=404)


@router.post("/{room_id}/join", status_code=HTTP_204_NO_CONTENT)
async def join_room(
    request: EnsurePlayerRequest,
    response: Response,
    room_id: str = Path(..., alias="room_id"),
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> None:
    if not room_manager.room_exists(room_id):
        raise HTTPException(status_code=404, detail="Room not found")

    player = await ensure_player_and_set_cookie(response, player_id, request.player_name)
    room_manager.add_player_to_room(player.player_id, room_id)
