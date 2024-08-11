from typing import Annotated

from pydantic import Field

from .camel_model import CamelModel


class Player:
    player_id: int
    name: str

    def __init__(self, player_id: int, name: str) -> None:
        self.player_id = player_id
        self.name = name


class PlayerNameModel(CamelModel):
    player_name: Annotated[str, Field(description="The name of the player", min_length=1)]
