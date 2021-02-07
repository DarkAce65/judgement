from pydantic import Field
from pydantic.fields import Undefined

from server.models.camel_model import CamelModel


class EnsurePlayerRequest(CamelModel):
    player_name: str = Field(Undefined, title="The name of the player", min_length=1)


class CreateGameEnsurePlayerRequest(EnsurePlayerRequest):
    pass
