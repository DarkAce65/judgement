import json

import uvicorn

from server.app import app

if __name__ == "__main__":
    with open("logging.config.json", encoding="utf-8") as config:
        uvicorn.run(app, log_config=json.load(config))
