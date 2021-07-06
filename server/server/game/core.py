import logging
from abc import abstractmethod
from enum import Enum, auto, unique
from typing import Any, Generic, Type, TypeVar

from pydantic import ValidationError
from pydantic.main import BaseModel

logger = logging.getLogger(__name__)


Action = TypeVar("Action", bound=BaseModel)
Settings = TypeVar("Settings")


@unique
class GameState(Enum):
    NOT_STARTED = auto()
    IN_PROGRESS = auto()
    COMPLETE = auto()


class GameError(Exception):
    pass


class Game(Generic[Action, Settings]):
    _action_cls: Type[Action]

    game_state: GameState
    settings: Settings

    def __init__(self, action_cls: Type[Action]) -> None:
        self._action_cls = action_cls

    def process_raw_input(self, player_id: str, raw_game_input: dict[str, Any]) -> None:
        try:
            parsed_action = self._action_cls(**raw_game_input)
        except ValidationError as error:
            raise GameError(
                f"Input could not be parsed into {self._action_cls.__name__} "
                "(input: {raw_game_input})"
            ) from error

        self.process_input(player_id, parsed_action)

    @abstractmethod
    def process_input(self, player_id: str, game_input: Action) -> None:
        ...
