import os

from server.app import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=os.environ.get("API_PORT"))
