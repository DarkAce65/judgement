from .camel_model import CamelModel


class PlayersMessage(CamelModel):
    players: list[str]
