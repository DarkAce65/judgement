from pydantic import Field

from server.models.camel_model import CamelModel


class GameResponse(CamelModel):
    room_id: str = Field(None, title="The room id of the game")
