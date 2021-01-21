FROM redis:alpine

COPY redis.conf /usr/local/etc/redis/redis.conf

CMD ["sh", "-c", "redis-server /usr/local/etc/redis/redis.conf --requirepass \"$(head -1 \"$REDIS_PASSWORD_FILE\")\""]
