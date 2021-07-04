from pydantic import Field

from server.models.camel_model import CamelModel


class RoomIdResponse(CamelModel):
    room_id: str = Field(title="The id of the room")
