# Model generator container
FROM python:3.12-alpine AS model_generator

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
  yarn \
  && (curl -sSL https://install.python-poetry.org | python3 -) \
  && chmod -R +x "$POETRY_HOME/bin"
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN addgroup --gid 1000 --system poetryuser \
  && adduser --uid 1000 --system --disabled-password --ingroup poetryuser --home /poetryuser poetryuser
USER poetryuser

WORKDIR /server/model_generator
COPY server/model_generator/package.json server/model_generator/yarn.lock ./
RUN yarn

WORKDIR /server
COPY server/pyproject.toml server/poetry.lock ./
RUN poetry install --only main,generator --no-interaction

COPY server .
RUN poetry run python -m model_generator.model_generator --out_dir /poetryuser/generated_types

# Client builder stage
FROM node:22 AS client_builder

USER node
WORKDIR /client

COPY --chown=node:node client/package.json client/yarn.lock ./
RUN yarn

ARG VITE_APP_API_HOST
ARG VITE_APP_API_ROOT
ENV VITE_APP_API_HOST="$VITE_APP_API_HOST" \
  VITE_APP_API_ROOT="$VITE_APP_API_ROOT"

COPY --chown=node:node client ./
COPY --chown=node:node --from=model_generator /poetryuser/generated_types ./generated_types/
RUN yarn build

# nginx container
FROM nginx

EXPOSE 80

COPY proxy/templates /etc/nginx/templates/
COPY --from=client_builder /client/dist /usr/share/nginx/html/
