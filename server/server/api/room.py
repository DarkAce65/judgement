from fastapi import APIRouter, Path

from server.data import room_manager
from server.models.responses import RoomIdResponse, RoomResponse

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("/create", response_model=RoomIdResponse)
async def create_room() -> RoomIdResponse:
    room_id = room_manager.create_room()
    return RoomIdResponse(room_id=room_id)


@router.get("/{room_id}/exists")
async def does_room_exist(room_id: str = Path(..., alias="room_id")) -> bool:
    return room_manager.room_exists(room_id)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str = Path(..., alias="room_id")) -> RoomResponse:
    room = room_manager.get_room(room_id)
    return RoomResponse.from_room(room)
