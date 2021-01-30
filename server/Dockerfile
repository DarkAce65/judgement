# Base dependency stage
FROM python:3.9-alpine as base

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  POETRY_VERSION=1.1.4 \
  POETRY_HOME="/opt/poetry" \
  POETRY_NO_INTERACTION=1

RUN apk add --no-cache \
  curl \
  gcc \
  libc-dev \
  make \
  && (curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -)
ENV PATH="$POETRY_HOME/bin:$PATH"

WORKDIR /server
EXPOSE "$API_PORT"

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev

# Debug/hot-reloading container
FROM base as debug
RUN poetry install --no-dev -E debug
COPY . .
CMD ["sh", "-c", "poetry run python -m debugpy --listen 0.0.0.0:5678 -m uvicorn main:app --host 0.0.0.0 --port $API_PORT --reload --reload-dir server"]

# Production container
FROM base as production
COPY . .
CMD ["sh", "-c", "poetry run uvicorn main:app --host 0.0.0.0 --port $API_PORT --proxy-headers"]
