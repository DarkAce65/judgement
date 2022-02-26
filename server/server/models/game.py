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


@unique
class GamePlayerType(str, Enum):
    PLAYER = "PLAYER"
    SPECTATOR = "SPECTATOR"


class GamePlayer:
    player_id: int
    player_type: GamePlayerType

    def __init__(self, player_id: int, player_type: GamePlayerType) -> None:
        self.player_id = player_id
        self.player_type = player_type


class GameState(CamelModel, ABC):
    player_type: GamePlayerType

    game_name: GameName
    status: GameStatus

    full_state_do_not_use: dict[str, Any]
