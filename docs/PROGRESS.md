# Lighthouse — Implementation Progress

> Single source of truth for task status. Updated after every significant work session.
> Statuses: `NOT STARTED` | `IN PROGRESS` | `BLOCKED` | `DONE`

---

## Session 1 — 2026-10-24: Initial scaffold and planning

This session was recorded before the local scaffold was fully assembled. The current checkout contains local, untracked scaffold and planning work; see Session 2 for the verified state. Do not interpret this historical note as the current working-tree description.

## Session 2 — 2026-10-24: Safe reconnaissance and plan correction

### Repository state inspected
- Repository: `/Users/krishnaverma/Desktop/Projects/The-Lighthouse`.
- Branch: `main`, at `f66062e` (`Initialising Repo`), tracking `origin/main`.
- Working tree: `.env.example`, `.gitignore`, `backend/`, `docker-compose.yml`, `docs/`, and `frontend/` are untracked local files. No files were reset or discarded.
- Existing implementation: FastAPI app with `/health` and `/health/ready`, settings, async SQLAlchemy session setup, a React status screen, and backend tests for configuration, health and DB connectivity.
- Missing implementation: profile APIs/forms, ORM models and migrations, real historical seed data, knowledge ingestion/search, embeddings, retrieval, generation, feasibility, comparisons and blueprints.
- Root README was a two-line placeholder; updated to describe the actual scaffold and setup. No `LICENSE` file or frontend lockfile was found.
- Python 3.11.15 and `backend/.venv` are present. `backend/.venv/bin/pytest -q` ran: 18 passed, 2 failed. Both SQLite integration failures are caused by missing `greenlet`; the global Python 3.11 environment has no `pytest`. Docker startup and frontend scripts were not run.

### Changes in this session
- Replaced the placeholder README with current setup, features, limitations and roadmap.
- Updated the project plan to distinguish target architecture from implemented code and to define a smaller initial vertical slice.
- Corrected this progress log to reflect the local scaffold and test blocker.
- No application code, dependencies, or tests were changed.

## Session 3 — 2026-10-24: Repository foundation (Task 1)

### Changes
- Moved the existing frontend directory intact from `frontend/` to `apps/web/` as requested.
- Added a stable structured API error envelope for HTTP, request-validation, and unexpected server errors. Unexpected exception text is logged, not returned to clients.
- Fixed `.env` lookup to resolve from repository root independent of the API launch directory.
- Added the pinned `greenlet` runtime dependency required by this SQLAlchemy async setup; this addresses the earlier local integration-test failures.
- Added tests for HTTP, validation, and unexpected error responses; retained the existing health tests.
- Added the frontend npm lockfile and updated README commands to use `npm ci`.
- Documented the initial API contract, layer boundaries, layout decision, and Task 1 progress.

### Verification
- `docker compose config -q`: passed. Docker daemon unavailable, so the PostgreSQL container was not started.
- `backend/.venv/bin/pytest -q`: 23 passed, 1 Starlette/AnyIO deprecation warning.
- `backend/.venv/bin/ruff check app tests`: passed after import/unused-import cleanup.
- `npm ci`: passed; npm reported 12 dependency advisories (8 moderate, 1 high, 3 critical). No broad dependency updates were applied.
- `npm run build`: passed (TypeScript and Vite production build).
- `npm run lint`: passed with the new ESLint flat config.
- Started FastAPI and Vite dev servers and requested `/health` and `/`; both returned successful responses. Servers were stopped after verification.
- `mypy app` was attempted after installing its pinned version but interrupted during startup after no output; type checking remains unverified.
- `git diff --check`: passed.

---

## Phase 1 — Vertical Slice (MVP)

### P1-01 — Repo scaffold

| Field | Value |
|---|---|
| Status | `IN PROGRESS` |
| Deliverable | Initial directory structure, `.env.example`, docker-compose, requirements, frontend manifest and docs exist in the working tree |
| Files | Root, `backend/`, `apps/web/`, `docs/` |
| Tests | Backend pytest: 23 passed; Compose syntax, frontend build and lint passed; dev servers returned successful responses |
| Blockers | Docker daemon unavailable, so PostgreSQL container startup could not be verified |
| Next action | Verify PostgreSQL startup when Docker is running |

---

### P1-02 — Database schema & migrations

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | SQLAlchemy models, Alembic migration, `database.py` |
| Files | `backend/app/models/db_models.py`, `backend/data/migrations/` |
| Tests | Migration applies cleanly; all tables created |
| Blockers | Depends on P1-01 |
| Next action | Define models after scaffold |

---

### P1-03 — Module A: Team Profile API

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | `POST /profile`, `GET /profile/{id}` with full validation |
| Files | `backend/app/routers/profile.py`, `backend/app/schemas/profile.py`, `backend/app/services/profile_service.py` |
| Tests | Valid profile saved; invalid input rejected with 422; empty profile rejected |
| Blockers | Depends on P1-02 |
| Next action | Implement after DB models |

---

### P1-04 — Module B: Seed data curation

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | ≥20 genuine, provenance-tracked problem statement JSON records in `backend/data/seed/` |
| Files | `backend/data/seed/problem_statements.json`, `backend/data/seed/sources.json` |
| Tests | Seed script runs idempotently; no duplicates inserted; all records have source URL |
| Blockers | Manual curation required; licensing must be reviewed per record |
| Next action | Draft seed records from documented public sources |

---

### P1-05 — Module B: Knowledge Base API

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | `GET /knowledge/problems`, `GET /knowledge/problems/{id}`, `POST /knowledge/ingest` |
| Files | `backend/app/routers/knowledge.py`, `backend/app/services/knowledge_service.py` |
| Tests | List returns ingested records; duplicate ingest is idempotent; missing fields handled |
| Blockers | Depends on P1-02, P1-04 |
| Next action | Implement after DB and seed |

---

### P1-06 — Module C: Embedding service

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | `EmbeddingAdapter` (sentence-transformers), embed-on-ingest, pgvector storage |
| Files | `backend/app/adapters/embedding_adapter.py`, `backend/app/services/embedding_service.py` |
| Tests | Embedding produced for a known string; stored in DB; dimension matches config |
| Blockers | Depends on P1-02 |
| Next action | Implement after DB models |

---

### P1-07 — Module C: Retrieval API

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | `POST /knowledge/retrieve` — semantic search, ranked results with provenance |
| Files | `backend/app/routers/knowledge.py`, `backend/app/services/retrieval_service.py` |
| Tests | Returns relevant records for a domain query; empty corpus returns empty list gracefully |
| Blockers | Depends on P1-06 |
| Next action | Implement after embedding service |

---

### P1-08 — Module E: Generation service

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | `POST /generate` — prompt construction, LLM call, schema validation, candidate persistence |
| Files | `backend/app/routers/generate.py`, `backend/app/services/generation_service.py`, `backend/app/adapters/model_adapter.py`, `backend/app/schemas/generation.py` |
| Tests | Valid candidates saved; malformed LLM output rejected; missing fields flagged |
| Blockers | Depends on P1-07; LLM API key required (BLOCKED until track confirmed) |
| Next action | Implement adapter and schema; wire API key from env |

---

### P1-09 — Module F: Feasibility checks

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | Deterministic skill-gap, time-risk and dependency checks per candidate |
| Files | `backend/app/services/feasibility_service.py`, `backend/app/schemas/generation.py` |
| Tests | Infeasible candidate flagged; hard constraint violation marked; missing evidence reported |
| Blockers | Depends on P1-03, P1-08 |
| Next action | Implement after generation |

---

### P1-10 — Module G: Blueprint generation

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | `POST /blueprint` — MVP definition, architecture, task plan, risk register for selected candidate |
| Files | `backend/app/routers/blueprint.py`, `backend/app/services/blueprint_service.py`, `backend/app/schemas/blueprint.py` |
| Tests | Blueprint contains all required sections; task plan references team members |
| Blockers | Depends on P1-08, P1-09 |
| Next action | Implement after generation and feasibility |

---

### P1-11 — Frontend: Core pages

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | Questionnaire, Results/Comparison, Blueprint pages in React + TS |
| Files | `apps/web/src/pages/`, `apps/web/src/components/`, `apps/web/src/api/` |
| Tests | Loading, error and empty states all render; form validates required fields |
| Blockers | Depends on API routes being available |
| Next action | Scaffold frontend after backend routes are defined |

---

### P1-12 — Tests: backend unit and integration

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | pytest suite covering all Phase 1 acceptance criteria |
| Files | `backend/tests/` |
| Tests | `pytest` passes; all blocked tests documented |
| Blockers | Depends on all service implementations |
| Next action | Write alongside each service |

---

### P1-13 — README and setup documentation

| Field | Value |
|---|---|
| Status | `NOT STARTED` |
| Deliverable | Accurate README: setup, env vars, demo workflow, known limitations |
| Files | `README.md` |
| Tests | Fresh checkout can start app following README alone |
| Blockers | Depends on Phase 1 completion |
| Next action | Update README at end of Phase 1 |

---

## Phase 2 — Pattern Intelligence (NOT STARTED)

- P2-01: Module D — co-occurrence and clustering
- P2-02: Pattern API
- P2-03: Seed dataset expansion (≥60 records, ≥5 domains)
- P2-04: Feasibility — external API / dependency checks
- P2-05: Frontend — Pattern explorer panel
- P2-06: Module H — Feedback API

## Phase 3 — Feedback Loop (NOT STARTED)

- P3-01: Outcome tracking
- P3-02: Evaluation metrics for retrieval
- P3-03: Architecture documentation diagrams
