# Judgement

A dockerized, full-stack website to play the card game ["Judgement"](https://en.wikipedia.org/wiki/Kachufool). Uses [`react-scripts`](https://create-react-app.dev/) for the frontend and [`FastAPI`](https://fastapi.tiangolo.com/) and [`redis`](https://redis.io/) on the backend. Deployed with an [`nginx`](https://www.nginx.com/) proxy server and [`uvicorn`](https://www.uvicorn.org/).

## Running

- Requires `docker` and `docker-compose`
- Requires the following files to be made at the project root:
  - `.REDIS_PASSWORD` - should contain a password for the redis database on the first line

### Dev

Supports live reloading of both the backend and the frontend.

`docker-compose -p judgement_dev -f docker-compose.dev.yml up`

- Frontend accessible at http://localhost:3000
- Backend accessible at http://localhost:8000
  - VSCode debugger attachable at http://localhost:5678
- Redis database accessible at http://localhost:6379

### Production

`docker-compose up --build`

- App accessible at http://localhost

### Tests

Running tests locally requires that either [`yarn`](https://yarnpkg.com/) (frontend) or [`poetry`](https://python-poetry.org/) (backend) be installed and that dependencies are installed using `yarn install` or `poetry install` for the frontend and backend respectively.

- Frontend tests can be run by running `yarn test` from the [client](./client) folder
- Backend tests can be run by running `poetry run task test` from the [server](./server) folder
