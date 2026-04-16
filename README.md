# AlgoQuest

AlgoQuest is organized as a monorepo with separate frontend and backend applications.

## Structure

- `frontend/`: React + Vite application
- `backend/`: FastAPI service
- `docs/`: product, design, and implementation planning docs

## Architecture Notes

- Keep the repo as one monorepo with two app boundaries.
- `frontend/` owns routing, UI state, visualization, and the future Pyodide runtime.
- `backend/` stays thin and owns metadata, persistence, and AI-facing APIs.
- The frontend talks to FastAPI over HTTP, but both applications evolve together in one codebase.

## Current Foundation

- route-driven React shell covering all 8 product pages
- shared frontend config for realm metadata and accents
- backend router modules for health and content endpoints
- product and implementation docs consolidated under `docs/`

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Copy `backend/.env.example` to `backend/.env` and fill in values such as `GEMINI_API_KEY` when you are ready to enable provider-backed features.

### From the repo root

After installing root and frontend Node dependencies:

```bash
npm install
npm run dev:frontend
npm run dev:backend
```

The root `package.json` exists to make multi-app development easier. The backend still uses Python-native dependency management.
