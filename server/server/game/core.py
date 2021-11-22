import logging
from abc import ABC, abstractmethod
from typing import Any, Generic, Type, TypeVar

from pydantic import BaseModel, ValidationError, parse_obj_as

from server.models.game import GamePhase, GamePlayer, GameState

logger = logging.getLogger(__name__)


Action = TypeVar("Action", bound=BaseModel)


class GameError(Exception):
    message: str

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class Game(Generic[Action], ABC):
    _action_cls: Type[Action]

    room_id: str

    game_phase: GamePhase
    players: list[GamePlayer]

    def __init__(self, action_cls: Type[Action], room_id: str) -> None:
        self._action_cls = action_cls

        self.room_id = room_id

        self.game_phase = GamePhase.NOT_STARTED
        self.players = []

    @abstractmethod
    def build_game_state(self) -> GameState:
        ...

    def add_player(self, player_id: str) -> None:
        self.players.append(GamePlayer(player_id))

    def remove_player(self, player_id: str) -> None:
        for index, player in enumerate(self.players):
            if player.player_id == player_id:
                self.players.pop(index)
                break

    def start_game(self) -> None:
        if self.game_phase != GamePhase.NOT_STARTED:
            raise GameError("Game has already started")

        self.game_phase = GamePhase.IN_PROGRESS

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

    def is_host(self, player_id: str) -> bool:
        return len(self.players) > 0 and self.players[0].player_id == player_id
