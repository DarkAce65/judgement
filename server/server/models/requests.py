from pydantic import BaseModel, Field


class CreateGameRequest(BaseModel):
    player_name: str = Field(None, title="The name of the player")
