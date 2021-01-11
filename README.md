# Judgement

A dockerized, full-stack website to play the card game ["Judgement"](https://en.wikipedia.org/wiki/Kachufool). Uses [`react-scripts`](https://create-react-app.dev/) for the frontend and [`FastAPI`](https://fastapi.tiangolo.com/) and [`redis`](https://redis.io/) on the backend. Deployed with an [`nginx`](https://www.nginx.com/) proxy server and [`uvicorn`](https://www.uvicorn.org/).

## Running

- Requires `docker` and `docker-compose`

### Dev

Supports live reloading of both the backend and the frontend.

`docker-compose -f docker-compose.dev.yml up`

- Frontend accessible at http://localhost:3000
- Backend accessible at http://localhost:8000

### Production

`docker-compose up --build`

- App accessible at http://localhost
