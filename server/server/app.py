import os

from flask import Flask, jsonify
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
def hello_world():
    return jsonify("Hello, World!")


@socketio.on("connect")
def test_connect():
    emit("response", {"data": "Connected"})


@socketio.on("message")
def handle_message(message):
    send(message)
    send("broadcast", broadcast=True)


@socketio.on("disconnect")
def test_disconnect():
    emit("client_disconnect", {"data": "Client disconnected"})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=os.environ.get("API_PORT"))
