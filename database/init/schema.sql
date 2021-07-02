CREATE TABLE players(id TEXT PRIMARY KEY NOT NULL, name TEXT);

CREATE TABLE rooms(id TEXT PRIMARY KEY NOT NULL);

CREATE TABLE room_players(
  room_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  UNIQUE(room_id, player_id),
  FOREIGN KEY(room_id) REFERENCES rooms(id),
  FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE client_player_room(
  client_id TEXT PRIMARY KEY NOT NULL,
  player_id TEXT NOT NULL,
  room_id TEXT,
  FOREIGN KEY(player_id) REFERENCES players(id),
  FOREIGN KEY(room_id) REFERENCES rooms(id)
);
