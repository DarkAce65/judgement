from pydantic import Field

from server.models.camel_model import CamelModel


class RoomResponse(CamelModel):
    room_id: str = Field(None, title="The id of the room")
