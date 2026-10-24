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

## Session 4 — 2026-10-25: Historical knowledge-base schema and data publication policy (Task 2)

### Changes
- Defined the canonical JSON Schema (Draft 2020-12) for Lighthouse historical records at `data/schemas/historical_record.schema.json`. Two record types (`problem_statement` and `project`) share common provenance, field-level verification, and ingestion metadata structures. The schema is machine-validatable and uses `oneOf` with `const` record_type for discrimination.
- Created empty JSONL data files at `data/processed/problem_statements.jsonl` and `data/processed/projects.jsonl`. Files start empty; records are added only after provenance review. No fabricated records.
- Created `data/data_card.md` documenting the dataset: schema design principles, collection process, file inventory, known biases, ethical considerations, and versioning policy.
- Created `data/SOURCES.md` documenting the full data publication policy: accepted source types, collection procedure, redistribution rights assessment, attribution preservation, duplicate detection, corrections workflow, versioned publishing, source registry, domain vocabulary, and prohibited practices.
- Added `jsonschema==4.23.0` to `backend/requirements-dev.txt` for schema validation tests.
- Added 48 schema validation tests in `backend/tests/unit/test_historical_record_schema.py` covering: schema meta-validation, valid/invalid records for both types, licence policy enforcement (unknown ≠ open), provenance traceability, published data file validation, duplicate ID detection, and cross-type consistency.

### Verification
- `backend/.venv/bin/python -m pytest tests/unit/test_historical_record_schema.py -v`: 44 passed, 4 skipped (data files empty as expected), 0 failed.
- Schema passes Draft 2020-12 meta-validation.
- JSON Schema enforces: stable record IDs with type-specific prefixes, required provenance with source URL and licence status, constrained verification status enums, `additionalProperties: false` on all objects, unique tags, minimum team size of 1.
- Missing licence information defaults to `"unknown"`, not `"open"` — enforced by both schema design and tests.
- No fabricated historical records introduced.

### Key design decisions
- **Schema version embedded in records:** Every record carries `schema_version: "1.0.0"` as a `const`, enabling future schema evolution without breaking existing records.
- **Field-level verification over record-level:** Rather than a single "verified" flag per record, each important field has its own `verification_status` (verified/inferred/unverified/unknown). This preserves the distinction between facts directly from the source and derived information.
- **Conservative licence defaults:** The schema and policy require `licence_status: "unknown"` when licence information is unavailable. Tests actively verify that no record claims `"open"` without a `licence_identifier`.
- **Empty initial dataset:** The JSONL files are intentionally empty. The acceptance criteria prohibit fabricating records; real records will be added during the curation phase (P1-04).

## Session 5 — 2026-10-25: Frontend foundation and design system shell (Task 3)

### Changes
- Implemented responsive application layout (`AppLayout.tsx`) with sticky header, responsive desktop and mobile navigation menus, and clean footer.
- Added SVG Lighthouse branding component (`LighthouseLogo.tsx`) with deep ocean blue & amber palette.
- Created reusable design system components under `apps/web/src/components/ui/`:
  - `Button.tsx`: Accessible, typed button supporting primary, secondary, outline, ghost, and danger variants, 3 sizes (sm/md/lg), and loading spinner state.
  - `Badge.tsx`: Semantic indicators for status and verification provenance (default, success, warning, error, neutral, outline).
  - `Card.tsx`: Composable card container with Header, Title, Description, Content, and Footer.
  - `FormControls.tsx`: Accessible Input, Textarea, Select, and FormField wrapper with error and helper text.
  - `Alert.tsx`: Informational and dismissible alerts (info, success, warning, error).
  - `Loading.tsx`: Accessible ARIA Spinner, Skeleton, and LoadingOverlay components.
  - `FeedbackStates.tsx`: EmptyState and ErrorState feedback components with clean visuals and retry actions.
- Configurable typed API client abstraction (`apps/web/src/api/client.ts`):
  - Configurable backend base URL via `VITE_API_BASE_URL` with dev fallback to `/api`.
  - Structured error parsing normalizing Axios/backend errors into typed `AppError` matching `backend/app/schemas/errors.py`.
- Centralized frontend types (`apps/web/src/types/api.ts`) for health contracts, error envelopes, and UI shell views.
- Created live `SystemStatusView.tsx` actively querying `/health` and `/health/ready` via `@tanstack/react-query` and `apiClient`.
- Created interactive `ComponentShowcaseView.tsx` showcasing all reusable components, form validation, and feedback states.
- Created transparent `PlannedWorkflowView.tsx` for planned modules (Team Profile, Knowledge Base, Candidate Generation, Blueprint) showing planned backend contracts and schema references without fabricating mock features.
- Added comprehensive unit tests:
  - `apps/web/src/api/client.test.ts` (6 tests for URL resolution, client creation, error parsing).
  - `apps/web/src/components/ui/Components.test.tsx` (6 tests for Button, Badge, Alert, EmptyState, ErrorState).
- Installed `@testing-library/jest-dom` for DOM test matchers.

### Verification
- `npm run typecheck`: passed with zero errors (`tsc --noEmit`).
- `npm run lint`: passed with zero warnings/errors (`eslint`).
- `npm run build`: passed (`tsc && vite build`).
- `npm run test`: 12 passed across 2 test suites (`vitest run`).
- No API secrets or environment keys are bundled in the frontend.

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
| Status | `IN PROGRESS` |
| Deliverable | Canonical JSON Schema for historical records, data publication policy, empty JSONL files, schema validation tests. Next: curate ≥20 genuine records. |
| Files | `data/schemas/historical_record.schema.json`, `data/processed/problem_statements.jsonl`, `data/processed/projects.jsonl`, `data/data_card.md`, `data/SOURCES.md`, `backend/tests/unit/test_historical_record_schema.py` |
| Tests | 48 schema validation tests: 44 passed, 4 skipped (empty data files). Schema meta-validation, valid/invalid fixtures, licence policy, provenance traceability, cross-type consistency. |
| Blockers | Manual curation of genuine records still required; licensing must be reviewed per record |
| Next action | Curate initial problem statement and project records from documented public sources following the policy in `data/SOURCES.md` |

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
| Status | `IN PROGRESS` |
| Deliverable | Questionnaire, Results/Comparison, Blueprint pages in React + TS. Application shell & design system foundation complete. |
| Files | `apps/web/src/` |
| Tests | Typecheck, lint, build, and vitest unit tests (12 passed); live status querying backend health |
| Blockers | Depends on API routes being available for Questionnaire, Knowledge search, and Generation |
| Next action | Integrate Questionnaire and Results views as respective backend endpoints are implemented |

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
