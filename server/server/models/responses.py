from pydantic import Field

from .camel_model import CamelModel
from .room import Room, RoomStatus


class RoomIdResponse(CamelModel):
    room_id: str = Field(title="The id of the room")


class RoomResponse(RoomIdResponse):
    room_status: RoomStatus = Field(title="The state of the room")
    ordered_player_ids: list[int] = Field(title="The ids of the players in the room")

    @staticmethod
    def from_room(room: Room) -> "RoomResponse":
        return RoomResponse(
            room_id=room.room_id,
            room_status=room.room_status,
            ordered_player_ids=room.ordered_player_ids,
        )
