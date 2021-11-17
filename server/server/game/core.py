import logging
from abc import ABC, abstractmethod
from enum import Enum, unique
from typing import Any, Generic, Type, TypeVar

from pydantic import BaseModel, ValidationError, parse_obj_as

from server.models.camel_model import GenericCamelModel

logger = logging.getLogger(__name__)


Action = TypeVar("Action", bound=BaseModel)


@unique
class GameName(str, Enum):
    JUDGEMENT = "JUDGEMENT"


@unique
class GameStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"


class GameError(Exception):
    message: str

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class GamePlayer:
    player_id: str

    def __init__(self, player_id: str) -> None:
        self.player_id = player_id


class GameState(GenericCamelModel, Generic[Action], ABC):
    game_name: GameName
    game_status: GameStatus

    @staticmethod
    @abstractmethod
    def from_game(game: "Game[Action]") -> "GameState[Action]":
        ...


class Game(Generic[Action], ABC):
    _action_cls: Type[Action]

    game_status: GameStatus
    players: list[GamePlayer]

    def __init__(self, action_cls: Type[Action]) -> None:
        self._action_cls = action_cls

        self.game_status = GameStatus.NOT_STARTED
        self.players = []

    @abstractmethod
    def build_game_state(self) -> GameState[Action]:
        ...

    def add_player(self, player_id: str) -> None:
        self.players.append(GamePlayer(player_id))

    def remove_player(self, player_id: str) -> None:
        for index, player in enumerate(self.players):
            if player.player_id == player_id:
                self.players.pop(index)
                break

    def start_game(self) -> None:
        if self.game_status != GameStatus.NOT_STARTED:
            raise GameError

        self.game_status = GameStatus.IN_PROGRESS

    def process_raw_input(self, player_id: str, raw_game_input: dict[str, Any]) -> None:
        try:
            parsed_action = parse_obj_as(self._action_cls, raw_game_input)
        except ValidationError as error:
            raise GameError(
                f"Input could not be parsed into {self._action_cls.__name__} "
                f"(input: {raw_game_input})"
            ) from error

        self.process_input(player_id, parsed_action)

    @abstractmethod
    def process_input(self, player_id: str, game_input: Action) -> None:
        ...
