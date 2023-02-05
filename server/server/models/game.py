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


class GamePlayer(CamelModel):
    player_id: int
    player_type: GamePlayerType


class GameState(CamelModel, ABC):
    player_type: GamePlayerType

    game_name: GameName
    status: GameStatus

    players: dict[int, GamePlayer]

    full_state_do_not_use: dict[str, Any]
