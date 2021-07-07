import logging
from abc import abstractmethod
from enum import Enum, unique
from typing import Any, Generic, Type, TypeVar

from pydantic import BaseModel, ValidationError

from server.models.camel_model import GenericCamelModel

logger = logging.getLogger(__name__)


Action = TypeVar("Action", bound=BaseModel)
Settings = TypeVar("Settings", bound=BaseModel)


@unique
class GamePhase(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"


class GameError(Exception):
    pass


class Game(Generic[Action, Settings]):
    _action_cls: Type[Action]

    game_phase: GamePhase
    settings: Settings

    def __init__(self, action_cls: Type[Action], settings: Settings) -> None:
        self._action_cls = action_cls

        self.game_phase = GamePhase.NOT_STARTED
        self.settings = settings

    def process_raw_input(self, player_id: str, raw_game_input: dict[str, Any]) -> None:
        try:
            parsed_action = self._action_cls(**raw_game_input)
        except ValidationError as error:
            raise GameError(
                f"Input could not be parsed into {self._action_cls.__name__} "
                f"(input: {raw_game_input})"
            ) from error

        self.process_input(player_id, parsed_action)

    @abstractmethod
    def process_input(self, player_id: str, game_input: Action) -> None:
        ...


class GameState(GenericCamelModel, Generic[Action, Settings]):
    game_phase: GamePhase
    settings: Settings

    @staticmethod
    @abstractmethod
    def from_game(game: Game[Action, Settings]) -> "GameState[Action, Settings]":
        ...
