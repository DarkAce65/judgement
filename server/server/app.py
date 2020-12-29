import os

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

if "CORS_ORIGINS" in os.environ:
    CORS(app)


@app.route("/hello")
def hello_world():
    return jsonify("Hello, World!")
