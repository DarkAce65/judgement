import random
import string

from server.game.core import Game
from server.game.judgement import JudgementGame
from server.models.game import GameName

from . import ROOM_ID_LENGTH

games: dict[str, Game] = {}


def generate_id() -> str:
    return "".join(random.choices(string.ascii_uppercase, k=ROOM_ID_LENGTH))


def game_exists(game_id: str) -> bool:
    return game_id in games


def get_game(game_id: str) -> Game:
    if not game_exists(game_id):
        raise ValueError(f"Invalid game id: {game_id}")
    return games[game_id]


def create_game(game_name: GameName) -> str:
    game_id = generate_id()
    while game_exists(game_id):
        game_id = generate_id()

    if game_name == GameName.JUDGEMENT:
        games[game_id] = JudgementGame(game_id)
    else:
        raise ValueError(f"Unrecognized game name ({game_name})")

    return game_id


def delete_game(game_id: str) -> None:
    del games[game_id]


async def start_game(game_id: str) -> None:
    game = get_game(game_id)
    await game.start_game()
