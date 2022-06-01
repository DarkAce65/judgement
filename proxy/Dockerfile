# Model generator container
FROM python:3.9-alpine as model_generator

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  POETRY_VERSION=1.1.12 \
  POETRY_HOME="/opt/poetry" \
  POETRY_NO_INTERACTION=1

RUN apk add --no-cache \
  curl \
  gcc \
  libc-dev \
  make \
  musl-dev \
  postgresql-dev \
  yarn \
  && (curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -) \
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
RUN poetry install --no-dev -E generator --no-interaction

COPY server .
RUN poetry run python -m model_generator.model_generator --out_dir /poetryuser/generated_types

# Client builder stage
FROM node:16 as client_builder

USER node
WORKDIR /client

COPY client/package.json client/yarn.lock ./
RUN yarn

ARG VITE_APP_API_HOST
ARG VITE_APP_API_ROOT
ENV VITE_APP_API_HOST="$VITE_APP_API_HOST" \
  VITE_APP_API_ROOT="$VITE_APP_API_ROOT"

COPY client ./
COPY --from=model_generator /poetryuser/generated_types ./generated_types/
RUN yarn build

# nginx container
FROM nginx

EXPOSE 80

COPY proxy/templates /etc/nginx/templates/
COPY --from=client_builder /client/dist /usr/share/nginx/html/
