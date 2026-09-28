# Thousand and One Stories

A platform for fiction writers and readers, structured like Reddit but with
editor-moderated communities instead of upvote-driven feeds. Writers submit
stories to communities; editors curate what gets published; readers browse
and follow communities they trust.

## Stack

- **Frontend**: React 19 + Vite, React Router, Tailwind CSS (`frontend/`)
- **Backend**: FastAPI + SQLite (`backend/`)
- **Deployment**: Docker, deployed on Railway (see `Dockerfile`, `railway.toml`)

## Development

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./run.sh
```

The API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies API requests to
the backend.

## Project layout

```
backend/   FastAPI app, SQLite database, seed/migration scripts
frontend/  React app (pages, components)
docs/      Product notes and planning docs
assets/    Static assets
```

## Deployment

The `Dockerfile` builds the frontend and bundles it with the backend into a
single image: on boot it seeds the database and serves both the API and the
built frontend from `uvicorn`.
