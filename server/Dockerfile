FROM python:3.9-alpine

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  POETRY_VERSION=1.1.4 \
  POETRY_HOME="/opt/poetry" \
  POETRY_NO_INTERACTION=1

RUN apk add --no-cache \
  curl \
  gcc \
  libc-dev \
  && (curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -)
ENV PATH="$POETRY_HOME/bin:$PATH"

WORKDIR /server
EXPOSE "$API_PORT"

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev

COPY . .
CMD ["sh", "-c", "poetry run gunicorn --worker-class eventlet -w 1 wsgi:app --bind 0.0.0.0:$API_PORT"]
