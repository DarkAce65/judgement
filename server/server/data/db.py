import sqlite3

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
