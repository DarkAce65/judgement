FROM python:3.9-alpine

RUN apk update \
  && apk add curl \
  && (curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -)
ENV PATH="/root/.poetry/bin:${PATH}"

WORKDIR /server
EXPOSE "$BACKEND_PORT"

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev --no-interaction

COPY . .
CMD ["sh", "-c", "poetry run gunicorn -w $NUM_WSGI_WORKERS wsgi:app --bind 0.0.0.0:$BACKEND_PORT"]
