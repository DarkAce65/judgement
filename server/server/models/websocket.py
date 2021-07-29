from server.game.core import GameName

from .camel_model import CamelModel


class PlayersMessage(CamelModel):
    players: list[str]


class SetGameMessage(CamelModel):
    game_name: GameName
