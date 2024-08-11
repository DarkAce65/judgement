# Python image with poetry and non-root user
FROM python:3.12-alpine AS python_poetry

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  POETRY_VERSION=1.8.3 \
  POETRY_HOME="/opt/poetry"

RUN apk add --no-cache \
  curl \
  gcc \
  libc-dev \
  make \
  musl-dev \
  postgresql-dev \
  && (curl -sSL https://install.python-poetry.org | python3 -) \
  && chmod -R +x "$POETRY_HOME/bin"
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN addgroup --gid 1000 --system poetryuser \
  && adduser --uid 1000 --system --disabled-password --ingroup poetryuser --home /poetryuser poetryuser

# Base server dependencies stage
FROM python_poetry AS base_server_deps

USER poetryuser
WORKDIR /server

COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-interaction

# Debug/hot-reloading container
FROM base_server_deps AS debug
EXPOSE "$API_PORT"
RUN poetry install --only main,debug --no-interaction
COPY . .
CMD ["sh", "-c", "poetry run python -Xfrozen_modules=off -m debugpy --listen 0.0.0.0:5678 -m uvicorn main:app --host 0.0.0.0 --port $API_PORT --use-colors --log-config logging.config.json --reload --reload-dir server"]

# Production container
FROM base_server_deps AS production
EXPOSE "$API_PORT"
COPY . .
CMD ["sh", "-c", "poetry run uvicorn main:app --root-path \"$API_ROOT\" --host 0.0.0.0 --port $API_PORT --proxy-headers --use-colors"]

# Model generator container
FROM base_server_deps AS model_generator

USER root
RUN apk add --no-cache yarn
USER poetryuser

WORKDIR /server/model_generator
COPY model_generator/package.json model_generator/yarn.lock ./
RUN yarn

WORKDIR /server
RUN poetry install --only main,generator --no-interaction

COPY . .
CMD ["sh", "-c", "poetry run python -m model_generator.model_generator --watch --out_dir \"$GENERATED_TYPES_OUT_DIR\""]
