import os
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)

if "CORS_ALLOWED_ORIGIN" in os.environ:
    origin = os.environ.get("CORS_ALLOWED_ORIGIN")
    CORS(app, origins=origin)
    socketio = SocketIO(app, cors_allowed_origins=origin)
else:
    socketio = SocketIO(app)


@app.route("/hello")
def hello_world() -> Any:
    return jsonify("Hello, World!")


@socketio.on("connect")
def test_connect() -> None:
    sid = request.sid  # type: ignore
    emit("response", {"data": "Connected: " + sid}, broadcase=True)


@socketio.on("message")
def handle_message(message: str) -> None:
    sid = request.sid  # type: ignore
    send(message)
    send("broadcast from " + sid, broadcast=True)


@socketio.on("disconnect")
def test_disconnect() -> None:
    sid = request.sid  # type: ignore
    emit(
        "client_disconnect",
        {"data": "Client disconnected: " + sid},
        broadcast=True,
    )


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=os.environ.get("API_PORT"))
