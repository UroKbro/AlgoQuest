# ALGO_FRONT_END.md

## Current State

The frontend is no longer blank. The repo currently has:

- a Vite + React app in `frontend/`
- a single landing-shell component in `frontend/src/App.jsx`
- base cyber-minimal styling in `frontend/src/styles.css`
- no routing yet
- no page implementations for the 8-product-page experience yet
- no persistence, editor runtime, Pyodide integration, or API wiring yet

## Frontend Finish Checklist

### Foundation and App Shell

- [x] Create the React + Vite app scaffold.
- [x] Add a first-pass visual shell for the brand and core realms.
- [ ] Add route-based navigation for `Nexus`, `Dojo`, `Laboratory`, `Sandbox`, `World`, `Forge`, `Path`, and `Terminal`.
- [ ] Create a shared layout with navigation, page container, and global overlays.
- [ ] Move realm metadata and page config out of `App.jsx` into reusable app config.
- [ ] Add a not-found route and basic loading/error UI states.

### Design System

- [x] Establish initial dark theme tokens and glass-panel styling.
- [ ] Expand tokens for all realm accents, semantic states, spacing, radii, shadows, and typography.
- [ ] Build reusable UI primitives: buttons, cards, panels, tags, modal, tooltip, sidebar, tabs, sliders, empty states.
- [ ] Add responsive layout rules for desktop, tablet, and mobile across the app shell.
- [ ] Add reduced-motion support tied to OS preference and future Terminal settings.
- [ ] Add motion primitives that match the design spec spring behavior.

### State and Persistence

- [ ] Add app-level state for session mode, settings, progress, notifications, and AI request state.
- [ ] Implement guest persistence with `localStorage`.
- [ ] Restore persisted settings and progress on boot.
- [ ] Define import/export JSON shape for future cloud sync.
- [ ] Keep feature state isolated by realm instead of one oversized store.

### Runtime and Editor

- [ ] Choose and install the code editor package for Dojo and World.
- [ ] Add a boot/loading flow for Pyodide initialization.
- [ ] Build a single runtime adapter that initializes Pyodide once and reuses it.
- [ ] Capture structured execution results: stdout, stderr, and visualization snapshots.
- [ ] Separate runtime output from visualization state so Lab and Dojo can share the snapshot model.

### Page Delivery

#### Nexus

- [ ] Build the Quest Continuity resume card.
- [ ] Build weekly stats and focus summary cards.
- [ ] Link realm cards into real routes with transitions.

#### Dojo

- [ ] Build the lesson rail grouped by learning tier.
- [ ] Build the lesson content area and integrated editor.
- [ ] Build the stage for memory boxes and pointer visuals.
- [ ] Wire lesson execution to the Pyodide runtime.
- [ ] Persist lesson progress and completion state.
- [ ] Add the Weekly Gate placeholder flow.
- [ ] Add the transfer action into Laboratory.

#### Laboratory

- [ ] Build the main visualization canvas.
- [ ] Implement timeline snapshot capture and scrubber playback.
- [ ] Add discovery anchors and code-line synchronization.
- [ ] Support at least 3 canonical algorithm experiences.
- [ ] Add visual diff feedback when code changes affect the algorithm.

#### Sandbox

- [ ] Build the high-scale simulation canvas path.
- [ ] Build the parameter console with sliders and toggles.
- [ ] Add presets and chaos/fault-injection controls.
- [ ] Verify smooth interaction under large data loads.

#### World

- [ ] Build the blueprint browser.
- [ ] Build the implementation IDE view.
- [ ] Add the architecture map view with React Flow or equivalent.
- [ ] Add the AI review trigger and review panel.
- [ ] Add project save/export UX.

#### Forge

- [ ] Build the poster gallery grid.
- [ ] Build the challenge browser.
- [ ] Add launch flows from Forge into Lab and Sandbox.

#### Path

- [ ] Build mastery radar and weekly breakdown views.
- [ ] Add badge/belt presentation.
- [ ] Add friction-point drilldown with teleport links back into learning flows.

#### Terminal

- [ ] Build settings controls for neon intensity, sound volume, motion blur, and reduced motion.
- [ ] Add live CSS variable updates from personalization controls.
- [ ] Add cache clear and progress export/import actions.
- [ ] Add backend/cloud-sync settings when auth exists.

### Backend Integration

- [ ] Replace hardcoded realm data with API-backed content where appropriate.
- [ ] Add API client utilities and environment-based base URL configuration.
- [ ] Integrate progress, settings, projects, Forge, and analytics endpoints as they become available.
- [ ] Add explicit loading, empty, and failure states for network-backed views.

### Quality and Delivery

- [ ] Add frontend test coverage for critical state and interaction flows.
- [ ] Add linting/formatting if the team wants it enforced in-repo.
- [ ] Run production build checks and fix bundle/runtime issues.
- [ ] Verify keyboard access for navigation, editor-adjacent controls, scrubbers, and sliders.
- [ ] Verify the app is usable on mobile for the simplified flows.

## Suggested Build Order From Here

1. Add routing and the shared app shell.
2. Build Terminal settings plus guest persistence.
3. Build Nexus on top of real persisted data.
4. Add the editor and Pyodide runtime adapter.
5. Finish Dojo as the first full learning loop.
6. Reuse the snapshot model for Laboratory.
7. Build Sandbox on a separate performance-focused canvas path.
8. Build World, then Forge and Path.
9. Finish backend integration, accessibility, and polish.

## Definition of Done

- [ ] All 8 pages exist and are navigable.
- [ ] The visual system is consistent with the cyber-minimal design docs.
- [ ] Guest-mode persistence works across reloads.
- [ ] Pyodide is initialized once and reused safely.
- [ ] Dojo, Laboratory, Sandbox, and World each have a working core interaction loop.
- [ ] Terminal settings affect the experience in real time.
- [ ] Backend-backed data flows are wired where needed without breaking guest mode.
