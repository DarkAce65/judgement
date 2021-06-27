import sqlite3
from typing import Optional

db_connection = sqlite3.connect(":memory:")
db_connection.isolation_level = None


def init_db() -> None:
    cur = db_connection.cursor()
    cur.execute(
        "CREATE TABLE client_player_room("
        "client_id TEXT PRIMARY KEY NOT NULL, "
        "player_id TEXT NOT NULL, "
        "room_id TEXT, "
        "UNIQUE(client_id, player_id, room_id)"
        ")"
    )


init_db()


def insert_client_mapping(client_id: str, player_id: str, room_id: str = None) -> None:
    cur = db_connection.cursor()
    cur.execute(
        "INSERT INTO client_player_room VALUES (?, ?, ?)",
        (client_id, player_id, room_id),
    )


def set_client_room(client_id: str, room_id: Optional[str]) -> None:
    cur = db_connection.cursor()
    cur.execute(
        "UPDATE client_player_room SET room_id=? WHERE client_id = ?",
        (room_id, client_id),
    )
