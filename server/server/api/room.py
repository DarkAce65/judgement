from typing import Any, Optional

from fastapi import APIRouter, Cookie, Path, Response
from starlette.status import HTTP_204_NO_CONTENT

from server.models.requests import EnsurePlayerRequest
from server.models.responses import ResourceExistsResponse, RoomResponse, RoomsResponse
from server.room import room_manager

from .player import ensure_player_and_set_cookie

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("", response_model=RoomsResponse)
async def get_all_rooms() -> dict[str, Any]:
    return {"rooms": [vars(room) for room in room_manager.get_all_rooms()]}


@router.post("/create", response_model=RoomResponse)
async def create_room(
    request: EnsurePlayerRequest,
    response: Response,
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> dict[str, str]:
    player = ensure_player_and_set_cookie(response, player_id, request.player_name)
    room = room_manager.create_room(player.player_id)

    return {"room_id": room.room_id}


@router.get("/{room_id}/exists", response_model=ResourceExistsResponse)
async def does_room_exist(room_id: str = Path(..., alias="room_id")) -> dict[str, Any]:
    return {"exists": room_manager.room_exists(room_id)}


@router.post("/{room_id}/join", status_code=HTTP_204_NO_CONTENT)
async def join_room(
    request: EnsurePlayerRequest,
    response: Response,
    room_id: str = Path(..., alias="room_id"),
    player_id: Optional[str] = Cookie(None, alias="player_id"),
) -> None:
    player = ensure_player_and_set_cookie(response, player_id, request.player_name)
    room_manager.add_player_to_room(player.player_id, room_id)
