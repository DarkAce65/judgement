CREATE DOMAIN ROOM_ID CHAR(4);

CREATE TABLE players(id TEXT PRIMARY KEY NOT NULL, name TEXT);

CREATE TABLE rooms(
  id ROOM_ID PRIMARY KEY NOT NULL,
  room_state VARCHAR(20) NOT NULL,
  game_name VARCHAR(20)
);

CREATE TABLE room_players(
  room_id ROOM_ID NOT NULL,
  player_id TEXT NOT NULL,
  order_index INT NOT NULL,
  UNIQUE(room_id, player_id),
  UNIQUE(room_id, order_index),
  FOREIGN KEY(room_id) REFERENCES rooms(id),
  FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE client_player_room(
  client_id TEXT PRIMARY KEY NOT NULL,
  player_id TEXT NOT NULL,
  room_id ROOM_ID,
  FOREIGN KEY(player_id) REFERENCES players(id),
  FOREIGN KEY(room_id) REFERENCES rooms(id)
);
