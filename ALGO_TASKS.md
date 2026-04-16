# ALGO_TASKS.md

This file tracks the implementation work across `docs/ALGO_FRONT_END.md` and `docs/ALGO_BACK_END.md`.
Items are checked off as they are completed in the codebase.

## Product Guardrails

- [x] Keep the app aligned with `docs/ALGO_QUEST.md`: browser-first AOS, guest-first persistence, and the Dojo -> Laboratory -> Sandbox -> World learning arc.
- [x] Keep page structure aligned with `docs/ALGO_PAGES.md`: each realm should map to its intended core interaction loop, not just a generic placeholder.
- [x] Keep visual decisions aligned with `docs/ALGO_DESIGN.md`: glass-on-black, realm-specific accents, low-friction flows, and spring-loaded interactions.
- [x] Keep technical decisions aligned with `docs/ALGO_TECH_STACK.md`: React + pure CSS on the frontend, Pyodide for browser execution, Canvas for visualizers, React Flow for World, FastAPI + SQLite on the backend.

## Current Priority

- [x] Focus current implementation passes on frontend framework and app structure before deeper feature work.
- [ ] Finish shared frontend framework layers before adding more realm-specific behavior.
- [ ] Defer visual polish and advanced product interactions until the framework layer is stable.

## Done

- [x] Add route-based navigation for `Nexus`, `Dojo`, `Laboratory`, `Sandbox`, `World`, `Forge`, `Path`, and `Terminal`.
- [x] Create a shared layout with navigation, page container, and global overlays.
- [x] Move realm metadata and page config out of `App.jsx` into reusable app config.
- [x] Add a not-found route and basic loading/error UI states.
- [x] Expand tokens for semantic states, layout radii, shadows, and reduced-motion handling.
- [x] Add responsive layout rules for desktop and mobile across the app shell.
- [x] Add API client utilities and environment-based base URL configuration.
- [x] Replace hardcoded realm data with API-backed content where appropriate.
- [x] Add environment-based backend configuration for allowed origins, secrets, database URL, and provider keys.
- [x] Split `backend/app/main.py` into clearer modules as the API surface grows.
- [x] Add consistent basic API error handling conventions.
- [x] Replace the hardcoded realms endpoint with structured content backed by static fixtures.
- [x] Add `GET /api/lessons`.
- [x] Add `GET /api/lessons/{slug}`.
- [x] Add `GET /api/algorithms`.
- [x] Add `GET /api/algorithms/{slug}`.
- [x] Add `GET /api/simulations`.
- [x] Add `GET /api/project-blueprints`.
- [x] Keep `ALGO_TASKS.md` updated as work is completed.
- [x] Replace the generic `Dojo` placeholder route with a dedicated page component.
- [x] Build the lesson rail grouped by learning tier using live lesson API data.
- [x] Add a Dojo workspace shell with stage, editor placeholder, Weekly Gate card, and Laboratory handoff link.
- [x] Create a backend virtual environment at `backend/.venv`.
- [x] Add backend `.env` support and a committed `.env.example` template.
- [x] Create `frontend/src/styles/` and move design tokens into a dedicated styles entrypoint.
- [x] Replace the generic `Laboratory` placeholder with an actual algorithm visualizer page.
- [x] Add playback controls, a timeline scrubber, and discovery anchors to the Laboratory.
- [x] Support concrete Laboratory studies for Binary Search, Merge Sort, and Dijkstra.
- [x] Add workspace Python interpreter settings and a root `.venv` link so editor tooling resolves backend imports from `backend/.venv`.
- [x] Build the Quest Continuity resume card.
- [x] Build weekly stats and focus summary cards.
- [x] Add a mini continuity visualizer that shows last lesson state or last project context on Nexus.
- [x] Add a `Resume Quest` action that deep-links the user back into the last active realm.
- [x] Add a clickable Mastery Pulse card that opens Path analytics.
- [x] Add a continuity response shape that tells Nexus what the user should resume next.
- [x] Add weekly-focus analytics output for the diagnostics engine concept.
- [x] Add backend route smoke checks using the FastAPI test client during implementation.
- [x] Choose and install the code editor package for Dojo and World.
- [x] Replace the Dojo editor placeholder with a real editor package.
- [x] Add a boot/loading flow for Pyodide initialization.
- [x] Add Pyodide boot and execution wiring to the Dojo workspace.
- [x] Add a browser-side lesson runner that can execute starter code and guided snippets without a backend compile step.
- [x] Add structured runtime output panes for stdout and stderr in the Dojo.
- [x] Persist Dojo lesson selection, code, and completion state in guest mode.
- [x] Add the transfer action into Laboratory.
- [x] Add a lightweight SQLite connection layer and app startup initialization.
- [x] Create concrete tables for settings, lesson progress, weekly gate results, projects, posters, and challenges.
- [x] Define request and response schemas for settings, progress, analytics, projects, and Forge resources.
- [x] Add `GET /api/progress/summary`.
- [x] Add `GET /api/progress/lessons`.
- [x] Add `PUT /api/progress/lessons/{lesson_id}`.
- [x] Add weekly gate endpoints.
- [x] Add `GET /api/path/analytics`.
- [x] Add synced settings read/write endpoints for Terminal.
- [x] Add project list, create, get, and update endpoints.
- [x] Add project export manifest generation.
- [x] Add poster list/create endpoints.
- [x] Add challenge list/create endpoints.
- [x] Add pytest-based backend route tests with isolated SQLite databases per test run.
- [x] Add automated route coverage for settings, progress, weekly gate, projects, and Forge endpoints.

## In Progress

- [ ] Build reusable UI primitives: buttons, cards, panels, tags, modal, tooltip, tabs, sliders, and empty states.
- [ ] Keep feature state isolated by realm instead of one oversized store.
- [ ] Add route/page transition framework that can later power realm handoff animations.
- [ ] Create consistent page scaffold/layout primitives for all realms.
- [ ] Normalize loading, empty, and error state components across the frontend.
- [ ] Add repository-backed tests or API-level tests for backend routes without relying on manual scripts.
- [ ] Wire Terminal settings and Dojo progress to the new backend persistence endpoints instead of local-only state.

## Frontend Foundation

- [ ] Build reusable UI primitives: buttons, cards, panels, tags, modal, tooltip, sidebar, tabs, sliders, empty states.
- [ ] Add motion primitives that match the design spec spring behavior.
- [ ] Add realm-specific visual treatments so each core realm feels distinct while staying inside the shared cyber-minimal system.
- [ ] Add route transition treatment that feels like a realm handoff or zoom-in instead of a hard page swap.
- [ ] Add a reusable floating overlay system for AI critique panels, discovery anchors, and future modal flows.
- [ ] Add chart and telemetry primitives for weekly pulse, mastery radar, and small stat readouts.
- [ ] Add a cinematic boot screen for the future Logic Engine install/load sequence.
- [ ] Split shared frontend concerns into clearer modules: UI primitives, layout primitives, realm state, runtime state, and view helpers.
- [ ] Add a realm page scaffold component so pages share header, sections, and support-panel composition consistently.
- [ ] Add shared async view wrappers for loading, empty, and failure states.
- [ ] Add a frontend state boundary for persisted app settings versus realm-local working state.
- [ ] Add a frontend state boundary for runtime/execution state versus visualization state.
- [ ] Add a lightweight navigation metadata layer for future breadcrumbs, continuity, and transitions.

## Runtime And Editor

- [x] Choose and install the code editor package for Dojo and World.
- [x] Add a boot/loading flow for Pyodide initialization.
- [ ] Build a single runtime adapter that initializes Pyodide once and reuses it.
- [ ] Capture structured execution results: stdout, stderr, and visualization snapshots.
- [ ] Separate runtime output from visualization state so Lab and Dojo can share the snapshot model.
- [x] Add a browser-side lesson runner that can execute starter code and guided snippets without a backend compile step.
- [ ] Define a shared snapshot contract for variable state, loop steps, pointer movement, and algorithm frames.
- [ ] Add logic-engine status states for installing, ready, running, error, and offline-capable behavior.
- [ ] Keep AI review flows user-triggered so critique stays on-demand instead of always-on.

## Page Delivery

- [x] Build the Quest Continuity resume card.
- [x] Build weekly stats and focus summary cards.
- [ ] Link realm cards into real routes with transitions.
- [x] Add a mini continuity visualizer that shows last lesson state or last project context on Nexus.
- [x] Add a `Resume Quest` action that deep-links the user back into the last active realm.
- [x] Add a clickable Mastery Pulse card that opens Path analytics.
- [x] Build the lesson rail grouped by learning tier.
- [ ] Build the lesson content area and integrated editor.
- [x] Build the lesson content area and integrated editor.
- [ ] Build the stage for memory boxes and pointer visuals.
- [x] Wire lesson execution to the Pyodide runtime.
- [x] Persist lesson progress and completion state.
- [ ] Add the Weekly Gate placeholder flow.
- [x] Add the transfer action into Laboratory.
- [ ] Add visible metaphors for variables, loops, functions, and references so code concepts read visually before text explanation.
- [ ] Add a non-intrusive Dojo critique surface that highlights the exact logical issue without turning into a chat-first interface.
- [ ] Add a reprioritization rule so weak topics move higher in the lesson rail after Weekly Gate results.
- [x] Build the main visualization canvas.
- [x] Implement timeline snapshot capture and scrubber playback.
- [x] Add discovery anchors and code-line synchronization.
- [x] Support at least 3 canonical algorithm experiences.
- [ ] Add visual diff feedback when code changes affect the algorithm.
- [ ] Add a Telemetry Dock with step count, complexity hints, and active structure state for Laboratory playback.
- [ ] Add a floating live-logic sandbox card for small code edits during algorithm study.
- [ ] Build the high-scale simulation canvas path.
- [ ] Build the parameter console with sliders and toggles.
- [ ] Add presets and chaos/fault-injection controls.
- [ ] Verify smooth interaction under large data loads.
- [ ] Add structural sabotage flows that intentionally break the simulation and show recovery behavior.
- [ ] Add ripple-feedback visuals so Sandbox parameter changes feel immediate and physical.
- [ ] Build the blueprint browser.
- [ ] Build the implementation IDE view.
- [ ] Add the architecture map view with React Flow or equivalent.
- [ ] Add the AI review trigger and review panel.
- [ ] Add project save/export UX.
- [ ] Add an idea-to-syntax entry flow that can generate a starter blueprint without replacing the user as the builder.
- [ ] Add a dual-view toggle between the implementation editor and architecture map with shared selection state.
- [ ] Add export flows that turn completed work into Forge-ready posters or downloadable project manifests.
- [ ] Build the poster gallery grid.
- [ ] Build the challenge browser.
- [ ] Add launch flows from Forge into Lab and Sandbox.
- [ ] Add challenge launch payloads that preserve exact parameters when teleporting into Laboratory or Sandbox.
- [ ] Add poster metadata so Forge items explain what logic or system they demonstrate.
- [ ] Build mastery radar and weekly breakdown views.
- [ ] Add badge/belt presentation.
- [ ] Add friction-point drilldown with teleport links back into learning flows.
- [ ] Add strength and focus summaries so Path feels like a training readout instead of a raw stats dump.
- [ ] Add portfolio framing so Path can evolve into a verified mastery showcase.
- [ ] Add cache clear and progress export/import actions.
- [ ] Add backend/cloud-sync settings when auth exists.
- [ ] Add ecosystem and extension placeholders in Terminal for the broader AOS control-center concept.
- [ ] Add an exportable guest backup format that can later merge into cloud sync.

## Backend Data Layer

- [x] Add a lightweight SQLite connection layer and app startup initialization.
- [x] Create concrete tables for guest settings and lesson progress.
- [x] Choose the ORM or SQL layer and wire SQLite as the initial database.
- [ ] Create the initial schema for users, settings, lessons, progress, algorithms, simulations, blueprints, projects, posters, challenges, and AI requests.
- [ ] Add migrations.
- [x] Seed static content for lessons, algorithms, simulation presets, and project blueprints.
- [x] Define Pydantic schemas for request and response contracts.
- [x] Add schema support for weekly stats, weekly focus, diagnostic friction points, and continuity resume state.
- [x] Add storage support for visualization snapshots and project poster metadata.
- [x] Expand SQLite storage to cover weekly gate results, projects, posters, and Forge challenges.

## Backend Progress And Settings APIs

- [x] Add `GET /api/progress/summary`.
- [x] Add `GET /api/progress/lessons`.
- [x] Add `PUT /api/progress/lessons/{lesson_id}`.
- [x] Add `GET /api/settings`.
- [x] Add `PUT /api/settings`.
- [x] Add weekly gate endpoints.
- [x] Add `GET /api/path/analytics`.
- [x] Add synced settings read/write endpoints for Terminal.
- [x] Add a continuity response shape that tells Nexus what the user should resume next.
- [x] Add weekly-focus analytics output for the diagnostics engine concept.

## Backend Projects And Forge APIs

- [x] Add project list, create, get, and update endpoints.
- [x] Add project export manifest generation.
- [x] Add poster list/create endpoints.
- [x] Add challenge list/create endpoints.
- [x] Validate and sanitize project, poster, and challenge payloads before persistence.
- [ ] Add launch payload contracts so Forge challenges can open directly in Laboratory or Sandbox.
- [ ] Add blueprint generation/storage shapes that support idea-to-syntax and starter skeleton flows.

## AI Broker

- [ ] Add provider configuration without exposing keys to the client.
- [ ] Implement `POST /api/ai/review-logic`.
- [ ] Implement `POST /api/ai/socratic-anchor`.
- [ ] Implement `POST /api/ai/idea-to-syntax`.
- [ ] Validate payload size and request shape on all AI routes.
- [ ] Normalize AI responses into stable structured contracts for the frontend.
- [ ] Log usage and failures for cost visibility and debugging.
- [ ] Add rate limiting or quota controls.
- [ ] Add AI response modes that distinguish critique, hint, explanation, and blueprint generation.
- [ ] Add safeguards to keep AI feedback non-intrusive and user-triggered.

## Auth And Cloud Sync

- [ ] Decide whether to ship anonymous device identities first or full signup/login first.
- [ ] Add session/auth endpoints.
- [ ] Add optional account creation and login.
- [ ] Add guest-to-cloud merge behavior for progress, settings, and projects.
- [ ] Define conflict resolution rules before enabling sync.

## Security And Quality

- [ ] Add request validation on every write endpoint.
- [ ] Define payload size limits for code review requests, project files, posters, and challenge configs.
- [ ] Add structured logging.
- [ ] Add frontend test coverage for critical state and interaction flows.
- [x] Add test coverage for core routes and validation failures.
- [ ] Add deployment-ready startup/config docs.
- [ ] Run production build checks and fix bundle/runtime issues.
- [ ] Verify keyboard access for navigation, editor-adjacent controls, scrubbers, and sliders.
- [ ] Verify the app is usable on mobile for the simplified flows.
- [ ] Add performance checks for Canvas-heavy experiences, especially Sandbox scale targets and Laboratory playback smoothness.
- [ ] Add UX checks for the Rule of 3 so core idea-to-visual flows stay simple.
- [ ] Add guest-mode regression checks so no core learning flow depends on auth or cloud sync.

## Narrative And Product Cohesion

- [ ] Add a consistent copy system so the app reads like one operating system instead of eight disconnected tools.
- [ ] Add cross-realm handoff flows: Dojo -> Laboratory, Laboratory/Sandbox -> Forge, Nexus -> Path, World -> Forge.
- [ ] Add continuity tracking so the app always knows the user's current quest, last active realm, and next suggested step.
- [ ] Add diagnostics-driven focus messaging so weekly summaries, Path, and Nexus reflect the same training narrative.
- [ ] Add a browser-first onboarding flow that explains zero-install execution and guest persistence without overwhelming the user.
