# Judgement

A dockerized, full-stack website to play the card game ["Judgement"](https://en.wikipedia.org/wiki/Kachufool). Uses `react-scripts` for the frontend and `flask` for the backend deployed with `nginx` and `gunicorn`.

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
