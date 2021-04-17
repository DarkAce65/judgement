from server.models.camel_model import CamelModel


class StringMessage(CamelModel):
    data: str


class PlayersMessage(CamelModel):
    players: list[str]
