from typing import Optional

from pydantic import Field

from server.models.camel_model import CamelModel


class EnsurePlayerRequest(CamelModel):
    player_name: Optional[str] = Field(None, title="The name of the player", min_length=1)
