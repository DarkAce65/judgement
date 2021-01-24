import os

from redis import Redis

if "REDIS_PASSWORD_FILE" in os.environ:
    redis_password_file = os.environ.get("REDIS_PASSWORD_FILE")
    if redis_password_file is None:
        raise Exception("Missing path to redis password secret")

    with open(redis_password_file) as f:
        redis_password = f.readline().strip()
        redis_client = Redis(host="redis", password=redis_password)
else:
    redis_client = Redis(host="redis")
