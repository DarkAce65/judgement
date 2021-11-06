# Python image with poetry and non-root user
FROM python:3.9-alpine as python_poetry

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  POETRY_VERSION=1.1.11 \
  POETRY_HOME="/opt/poetry" \
  POETRY_NO_INTERACTION=1

RUN apk add --no-cache \
  curl \
  gcc \
  git \
  libc-dev \
  make \
  musl-dev \
  postgresql-dev \
  && (curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -) \
  && chmod -R +x "$POETRY_HOME/bin"
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN addgroup --gid 1000 --system poetryuser \
  && adduser --uid 1000 --system --disabled-password --ingroup poetryuser --home /poetryuser poetryuser

# Base server container
FROM python_poetry as base_server

USER poetryuser
WORKDIR /server
EXPOSE "$API_PORT"

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev --no-interaction

# Debug/hot-reloading container
FROM base_server as debug
RUN poetry install --no-dev -E debug --no-interaction
COPY . .
CMD ["sh", "-c", "poetry run python -m debugpy --listen 0.0.0.0:5678 -m uvicorn main:app --host 0.0.0.0 --port $API_PORT --use-colors --log-config logging.config.json --reload --reload-dir server"]

# Production container
FROM base_server as production
COPY . .
CMD ["sh", "-c", "poetry run uvicorn main:app --root-path \"$API_ROOT\" --host 0.0.0.0 --port $API_PORT --proxy-headers --use-colors"]

# Model generator container
FROM python_poetry as model_generator

RUN apk add --no-cache yarn

USER poetryuser
WORKDIR /server

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev -E generator --no-interaction

WORKDIR /server/model_generator
COPY model_generator/package.json model_generator/yarn.lock ./
RUN yarn

WORKDIR /server

COPY . .
CMD ["sh", "-c", "poetry run python -m model_generator.watcher --out_dir \"$GENERATED_TYPES_OUT_DIR\""]
