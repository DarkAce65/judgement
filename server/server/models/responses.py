from pydantic import Field

from server.models.camel_model import CamelModel


class ResourceExistsResponse(CamelModel):
    exists: bool = Field(None, title="Whether the resource exists or not")


class RoomResponse(CamelModel):
    room_id: str = Field(None, title="The id of the room")


class RoomsResponse(CamelModel):
    rooms: list[RoomResponse] = Field([], title="The available rooms")
