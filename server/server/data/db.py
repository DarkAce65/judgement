import sqlite3

db_connection = sqlite3.connect(":memory:")
db_connection.isolation_level = None


def init_db() -> None:
    cur = db_connection.cursor()
    cur.execute("CREATE TABLE players(id TEXT PRIMARY KEY NOT NULL, name TEXT)")
    cur.execute("CREATE TABLE rooms(id TEXT PRIMARY KEY NOT NULL)")
    cur.execute(
        "CREATE TABLE room_players("
        "  room_id TEXT NOT NULL, "
        "  player_id TEXT NOT NULL, "
        "  UNIQUE(room_id, player_id), "
        "  FOREIGN KEY(room_id) REFERENCES rooms(id), "
        "  FOREIGN KEY(player_id) REFERENCES players(id)"
        ")"
    )
    cur.execute(
        "CREATE TABLE client_player_room("
        "  client_id TEXT PRIMARY KEY NOT NULL, "
        "  player_id TEXT NOT NULL, "
        "  room_id TEXT, "
        "  FOREIGN KEY(player_id) REFERENCES players(id), "
        "  FOREIGN KEY(room_id) REFERENCES rooms(id)"
        ")"
    )


init_db()
