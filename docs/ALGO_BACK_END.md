# ALGO_BACK_END.md

## Current State

The backend is no longer blank. The repo currently has:

- a FastAPI app in `backend/app/main.py`
- CORS configured for the local Vite frontend
- a working `GET /health` endpoint
- a basic `GET /api/realms` endpoint returning hardcoded realm metadata
- no database yet
- no auth, progress, content, AI, project, Forge, or settings APIs yet

## Backend Finish Checklist

### Foundation

- [x] Create the FastAPI service scaffold.
- [x] Add local CORS support for the frontend.
- [x] Add a health check endpoint.
- [x] Add an initial sample API route.
- [ ] Add environment-based configuration for allowed origins, secrets, database URL, and provider keys.
- [ ] Split `main.py` into clearer modules as the API surface grows.
- [ ] Add consistent API response/error handling conventions.

### Data Layer

- [ ] Choose the ORM or SQL layer and wire SQLite as the initial database.
- [ ] Create the initial schema for users, settings, lessons, progress, algorithms, simulations, blueprints, projects, posters, challenges, and AI requests.
- [ ] Add migrations.
- [ ] Seed static content for lessons, algorithms, simulation presets, and project blueprints.
- [ ] Define Pydantic schemas for request and response contracts.

### Content APIs

- [ ] Replace the hardcoded realms endpoint with structured content backed by seed data or static fixtures.
- [ ] Add `GET /api/lessons`.
- [ ] Add `GET /api/lessons/{slug}`.
- [ ] Add `GET /api/algorithms`.
- [ ] Add `GET /api/algorithms/{slug}`.
- [ ] Add `GET /api/simulations`.
- [ ] Add `GET /api/project-blueprints`.

### Progress and Settings APIs

- [ ] Add `GET /api/progress/summary`.
- [ ] Add `GET /api/progress/lessons`.
- [ ] Add `PUT /api/progress/lessons/{lesson_id}`.
- [ ] Add weekly gate endpoints.
- [ ] Add `GET /api/path/analytics`.
- [ ] Add synced settings read/write endpoints for Terminal.

### Projects and Forge APIs

- [ ] Add project list, create, get, and update endpoints.
- [ ] Add project export manifest generation.
- [ ] Add poster list/create endpoints.
- [ ] Add challenge list/create endpoints.
- [ ] Validate and sanitize project, poster, and challenge payloads before persistence.

### AI Broker

- [ ] Add provider configuration without exposing keys to the client.
- [ ] Implement `POST /api/ai/review-logic`.
- [ ] Implement `POST /api/ai/socratic-anchor`.
- [ ] Implement `POST /api/ai/idea-to-syntax`.
- [ ] Validate payload size and request shape on all AI routes.
- [ ] Normalize AI responses into stable structured contracts for the frontend.
- [ ] Log usage and failures for cost visibility and debugging.
- [ ] Add rate limiting or quota controls.

### Auth and Cloud Sync

- [ ] Decide whether to ship anonymous device identities first or full signup/login first.
- [ ] Add session/auth endpoints.
- [ ] Add optional account creation and login.
- [ ] Add guest-to-cloud merge behavior for progress, settings, and projects.
- [ ] Define conflict resolution rules before enabling sync.

### Security and Operations

- [ ] Add request validation on every write endpoint.
- [ ] Define payload size limits for code review requests, project files, posters, and challenge configs.
- [ ] Add structured logging.
- [ ] Add test coverage for core routes and validation failures.
- [ ] Add deployment-ready startup/config docs.

### Frontend Integration Readiness

- [ ] Keep guest mode fully functional even before auth ships.
- [ ] Ensure response shapes are stable enough for Nexus, Dojo, World, Forge, Path, and Terminal integrations.
- [ ] Add local dev examples for frontend API base URL wiring.
- [ ] Verify the frontend can swap hardcoded sample data for live endpoints incrementally.

## Suggested Build Order From Here

1. Add settings/config management and choose the data layer.
2. Create the schema, migrations, and seeded content.
3. Build content endpoints for lessons, algorithms, simulations, and blueprints.
4. Build progress, settings, and analytics endpoints.
5. Add the AI broker with validation, normalization, and rate limiting.
6. Add projects, posters, and challenge endpoints.
7. Add auth and guest-to-cloud sync last.

## Definition of Done

- [ ] The backend exposes stable content, progress, project, Forge, settings, and AI APIs.
- [ ] SQLite-backed persistence exists with migrations.
- [ ] AI provider keys never reach the client.
- [ ] Guest-first frontend flows still work even when cloud sync is not used.
- [ ] The API contracts are stable enough for the planned frontend integration.
