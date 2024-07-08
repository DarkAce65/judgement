import logging
from abc import ABC, abstractmethod
from typing import Any, Generic, Mapping, Type, TypeVar

from pydantic import BaseModel, ValidationError, parse_obj_as

from server.models.game import GamePlayer, GamePlayerType, GameState, GameStatus

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

    status: GameStatus
    players: dict[int, GamePlayer]

    def __init__(self, action_cls: Type[Action], room_id: str) -> None:
        self._action_cls = action_cls

        self.room_id = room_id

        self.status = GameStatus.NOT_STARTED
        self.players = {}

    @abstractmethod
    def build_game_states(self, player_ids: set[int]) -> Mapping[int, GameState]: ...

    def add_player(
        self, player_id: int, player_type: GamePlayerType = GamePlayerType.PLAYER
    ) -> None:
        game_player = GamePlayer(player_id=player_id, player_type=player_type)
        self.players[player_id] = game_player

    def remove_player(self, player_id: int) -> GamePlayer:
        if player_id not in self.players:
            raise ValueError(f"Player {player_id} is not in the game")

        player = self.players[player_id]
        del self.players[player_id]

        return player

    async def start_game(self) -> None:
        if self.status == GameStatus.IN_PROGRESS:
            raise GameError("Game has already started")

        self.status = GameStatus.IN_PROGRESS

    async def process_raw_input(
        self, player_id: int, raw_game_input: dict[str, Any]
    ) -> None:
        try:
            parsed_action = parse_obj_as(self._action_cls, raw_game_input)
        except ValidationError as error:
            raise GameError(
                f"Input could not be parsed into {self._action_cls.__name__} "
                f"(input: {raw_game_input})"
            ) from error

        await self.process_input(player_id, parsed_action)

    @abstractmethod
    async def process_input(self, player_id: int, game_input: Action) -> None: ...

    def is_in_game(self, player_id: int) -> bool:
        return player_id in self.players
