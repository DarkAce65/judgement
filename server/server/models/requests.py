from server.models.game import GameName

from .camel_model import CamelModel


class CreateGameRequest(CamelModel):
    game_name: GameName
