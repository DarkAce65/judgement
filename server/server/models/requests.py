from pydantic import Field

from server.models.camel_model import CamelModel


class CreateGameRequest(CamelModel):
    player_name: str = Field(None, title="The name of the player")
