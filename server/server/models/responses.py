from pydantic import BaseModel, Field


class GameResponse(BaseModel):
    room_id: str = Field(None, title="The room id of the game")
