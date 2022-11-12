from typing import Optional

from fastapi import APIRouter, Cookie, HTTPException, Path, Response

from server.data import room_manager
from server.models.requests import EnsurePlayerRequest
from server.models.responses import RoomIdResponse, RoomResponse

from .player import ensure_player_and_set_cookie

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("/create", response_model=RoomIdResponse)
async def create_room() -> RoomIdResponse:
    room_id = room_manager.create_room()
    return RoomIdResponse(room_id=room_id)


@router.head("/{room_id}/exists", status_code=204)
async def does_room_exist(room_id: str = Path(..., alias="room_id")) -> None:
    if not room_manager.room_exists(room_id):
        raise HTTPException(status_code=404)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str = Path(..., alias="room_id")) -> RoomResponse:
    room = room_manager.get_room(room_id)
    return RoomResponse.from_room(room)


@router.post("/{room_id}/join", status_code=204)
async def join_room(
    request: EnsurePlayerRequest,
    response: Response,
    room_id: str = Path(..., alias="room_id"),
    player_auth_id: Optional[str] = Cookie(None, alias="player_auth_id"),
) -> None:
    if not room_manager.room_exists(room_id):
        raise HTTPException(status_code=404, detail="Room not found")

    player = await ensure_player_and_set_cookie(
        response, request.player_name, player_auth_id
    )
    room_manager.add_player_to_room(player.player_id, room_id)
