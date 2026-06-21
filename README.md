# Carbon Footprint Calculator

Lightweight project to estimate and discuss personal carbon footprints using an AI-backed FastAPI service and a Vite + React frontend.

## Repository Structure

- `carbon-backend/`: FastAPI backend, database models/migrations, AI agent, and API docs.
- `carbon-frontend/`: Vite + React frontend with Supabase auth and UI components.

## Quick Start

Prerequisites: Python 3.10+, Node 18+, and `poetry` (optional) or `pip`/`venv`.

Backend (development):

```bash
cd carbon-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt  # or use poetry install
uvicorn main:app --reload
```

Frontend (development):

```bash
cd carbon-frontend
npm install
npm run dev
```

## Tests

Run backend tests:

```bash
cd carbon-backend
pytest -q
```

## Notes

- Configure environment variables in `carbon-backend/.env` and `carbon-frontend/.env` (see per-folder READMEs).
- Backend exposes a streaming endpoint used by the frontend; see `carbon-backend/app/api` for routes.
- Ask me to add CI, expanded setup steps, or local seed data if you'd like.
