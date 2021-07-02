# Judgement

A dockerized, full-stack website to play the card game ["Judgement"](https://en.wikipedia.org/wiki/Kachufool). Uses [`react-scripts`](https://create-react-app.dev/) for the frontend and [`FastAPI`](https://fastapi.tiangolo.com/) and [`PostgreSQL`](https://www.postgresql.org/) on the backend. Deployed with an [`nginx`](https://www.nginx.com/) reverse proxy server and [`uvicorn`](https://www.uvicorn.org/).

## Running

- Requires `docker` and `docker-compose`
- Requires the following files to be made at the project root:
  - `.POSTGRES_PASSWORD` - should contain a password for the postgres database on the first line

### Dev

Supports live reloading of both the backend and the frontend.

`docker-compose -p judgement_dev -f docker-compose.dev.yml up`

- Frontend accessible at http://localhost:3000
- Backend accessible at http://localhost:8000
  - VSCode debugger attachable at http://localhost:5678
- Postgres database accessible at http://localhost:5432

### Production

`docker-compose up --build`

- App accessible at http://localhost

### Tests

Running tests locally requires that either [`yarn`](https://yarnpkg.com/) (frontend) or [`poetry`](https://python-poetry.org/) (backend) be installed and that dependencies are installed using `yarn install` or `poetry install` for the frontend and backend respectively.

- Frontend tests can be run by running `yarn test` from the [client](./client) folder
- Backend tests can be run by running `poetry run task test` from the [server](./server) folder

### Notes

If changes are made to any `package.json` or `yarn.lock` files, the dev environment may need to be rebuilt with the following command: `docker-compose -p judgement_dev -f docker-compose.dev.yml up --build --renew-anon-volumes`

Some frontend interfaces are generated from backend models. The `docker-compose` commands both automatically generate these files as needed and the dev command will additionally write these locally into the `client/generated_types` folder for local editor usage. They can also be manually generated by running `poetry run task generate` or `poetry run task generate_watch` from the [server](./server) folder (this method requires that both `yarn` and `poetry` are installed locally).
