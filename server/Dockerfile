# Base dependency stage
FROM python:3.9-alpine as base

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  POETRY_VERSION=1.1.6 \
  POETRY_HOME="/opt/poetry" \
  POETRY_NO_INTERACTION=1

RUN apk add --no-cache \
  curl \
  gcc \
  git \
  libc-dev \
  make \
  && (curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -) \
  && chmod -R +x "$POETRY_HOME/bin"
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN addgroup --gid 1000 --system serveruser \
  && adduser --uid 1000 --system --disabled-password --ingroup serveruser --home /serveruser serveruser
USER serveruser

WORKDIR /server
EXPOSE "$API_PORT"

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev --no-interaction

# Debug/hot-reloading container
FROM base as debug
RUN poetry install --no-dev -E debug --no-interaction
COPY . .
CMD ["sh", "-c", "poetry run python -m debugpy --listen 0.0.0.0:5678 -m uvicorn main:app --host 0.0.0.0 --port $API_PORT --reload --reload-dir server"]

# Production container
FROM base as production
COPY . .
CMD ["sh", "-c", "poetry run uvicorn main:app --root-path \"$API_ROOT\" --host 0.0.0.0 --port $API_PORT --proxy-headers"]

# Model generator container
FROM nikolaik/python-nodejs:python3.9-nodejs15-alpine as model_generator

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  POETRY_VERSION=1.1.6 \
  POETRY_HOME="/opt/poetry" \
  POETRY_NO_INTERACTION=1

RUN apk add --no-cache \
  curl \
  gcc \
  git \
  libc-dev \
  make \
  && (curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -) \
  && chmod -R +x "$POETRY_HOME/bin"
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN addgroup --gid 1000 --system generator \
  && adduser --uid 1000 --system --disabled-password --ingroup generator --home /generator generator
USER generator

WORKDIR /server/model_generator

COPY model_generator/package.json model_generator/yarn.lock ./
RUN yarn

WORKDIR /server

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev -E generator --no-interaction
COPY . .

CMD ["sh", "-c", "poetry run python -m model_generator.watcher --out_dir \"$GENERATED_TYPES_OUT_DIR\""]
