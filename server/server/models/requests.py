from pydantic import Field

from .camel_model import CamelModel


class EnsurePlayerRequest(CamelModel):
    player_name: str = Field(title="The name of the player", min_length=1)
