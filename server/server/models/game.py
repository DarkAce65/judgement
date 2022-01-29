from abc import ABC
from enum import Enum, unique
from typing import Any

from .camel_model import CamelModel


@unique
class GameName(str, Enum):
    JUDGEMENT = "JUDGEMENT"


@unique
class GameStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"


class GamePlayer:
    player_id: int

    def __init__(self, player_id: int) -> None:
        self.player_id = player_id


class GameState(CamelModel, ABC):
    game_name: GameName
    status: GameStatus

    full_state_do_not_use: dict[str, Any]
