from __future__ import annotations

from typing import Annotated

from pydantic import Field

from server.game.core import Game

from .camel_model import CamelModel
from .game import GameStatus


class GameIdResponse(CamelModel):
    game_id: Annotated[str, Field(description="The id of the game")]


class GameResponse(GameIdResponse):
    game_status: Annotated[GameStatus, Field(description="The state of the game")]

    @staticmethod
    def from_game(game: Game) -> GameResponse:
        return GameResponse(game_id=game.game_id, game_status=game.status)
