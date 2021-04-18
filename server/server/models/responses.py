from pydantic import Field

from server.models.camel_model import CamelModel


class RoomResponse(CamelModel):
    room_id: str = Field(title="The id of the room")


class RoomsResponse(CamelModel):
    rooms: list[RoomResponse] = Field([], title="The available rooms")
