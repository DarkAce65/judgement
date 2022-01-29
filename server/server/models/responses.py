from pydantic import Field

from .camel_model import CamelModel
from .room import Room, RoomState


class RoomIdResponse(CamelModel):
    room_id: str = Field(title="The id of the room")


class RoomResponse(RoomIdResponse):
    room_state: RoomState = Field(title="The state of the room")
    player_ids: list[int] = Field(title="The ids of the players in the room")

    @staticmethod
    def from_room(room: Room) -> "RoomResponse":
        return RoomResponse(
            room_id=room.room_id,
            room_state=room.room_state,
            player_ids=[player.player_id for player in room.players],
        )
