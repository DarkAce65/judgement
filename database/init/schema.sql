CREATE TYPE room_id CHAR(4);

CREATE TABLE players(id TEXT PRIMARY KEY NOT NULL, name TEXT);

CREATE TABLE rooms(
  id room_id PRIMARY KEY NOT NULL,
  room_state int NOT NULL
);

CREATE TABLE room_players(
  room_id room_id NOT NULL,
  player_id TEXT NOT NULL,
  UNIQUE(room_id, player_id),
  FOREIGN KEY(room_id) REFERENCES rooms(id),
  FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE client_player_room(
  client_id TEXT PRIMARY KEY NOT NULL,
  player_id TEXT NOT NULL,
  room_id room_id,
  FOREIGN KEY(player_id) REFERENCES players(id),
  FOREIGN KEY(room_id) REFERENCES rooms(id)
);
