import json

import uvicorn

from server.app import app

if __name__ == "__main__":
    with open("logging.config.json") as config:
        uvicorn.run(app, log_config=json.load(config))
