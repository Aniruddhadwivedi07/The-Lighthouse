# Lighthouse — Project Plan

> Last updated: 2026-10-24

---

## 1. Product Scope

Lighthouse helps hackathon teams discover what to build by combining structured team profiling, a curated historical knowledge base, semantic retrieval, pattern analysis and LLM-based generation into a single, explainable, end-to-end pipeline.

**Core user journey:**

```
Team Profile → Domain & Objectives → Retrieve Historical Knowledge
→ Generate Candidates → Compare Evidence & Feasibility
→ Select a Candidate → View Execution Blueprint
```

### Repository checkpoint (2026-10-24)

The checkout is on `main` at `f66062e` (`Initialising Repo`), tracking `origin/main`. Application and planning files remain untracked local work. Preserve them; do not reset or replace them. The current implementation is a foundation only: FastAPI liveness/readiness and structured errors, environment configuration, async SQLAlchemy session setup, and a React readiness shell. There are no implemented profile or knowledge APIs, ORM models, migrations, seed records, retrieval/generation services, feasibility checks, blueprint, or complete product workflow. The README documents local setup and limitations; the npm lockfile is now present under `apps/web/`. There is no `LICENSE` file.

The backend suite was run with the repository's `backend/.venv`: 18 passed and 2 integration tests failed because `greenlet` is missing from that environment. The global Python 3.11 installation does not have `pytest`. No test suite is currently green.

---

## 2. System Architecture

### High-level topology

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React + TS)               │
│  Questionnaire | Results | Blueprint | Feedback      │
└───────────────────────┬─────────────────────────────┘
                        │ REST / JSON
┌───────────────────────▼─────────────────────────────┐
│               Backend (FastAPI + Python)             │
│                                                      │
│  Routers:  /profile  /knowledge  /generate           │
│            /blueprint  /feedback                     │
│                                                      │
│  Services:                                           │
│    ProfileService        KnowledgeService            │
│    EmbeddingService      RetrievalService            │
│    PatternService        GenerationService           │
│    FeasibilityService    BlueprintService            │
│    FeedbackService                                   │
│                                                      │
│  Adapters:                                           │
│    ModelAdapter (configurable — Gemma 4 / Gemini)   │
│    EmbeddingAdapter                                  │
└────────┬──────────────────────────┬─────────────────┘
         │                          │
┌────────▼──────────┐    ┌──────────▼──────────────┐
│  PostgreSQL        │    │  pgvector               │
│  (structured data) │    │  (semantic embeddings)  │
└────────────────────┘    └─────────────────────────┘
```

This is the target topology, not the current implementation. Start with clear service/repository interfaces and a SQLite-backed local/test path if the existing DEC-010 direction is retained. Keep PostgreSQL + pgvector as the preferred persistent deployment. The current code creates a SQLAlchemy engine but has no models, migrations, or retrieval implementation, so neither database path is yet demonstrated. Confirm the event's model requirement before choosing a concrete LLM provider or model.

### Foundation API contract and layer responsibilities

The initial API contract is intentionally small:

| Method and path | Purpose | Response |
|---|---|---|
| `GET /health` | Liveness; confirms the API process is serving | `200` with `status`, `uptime_seconds`, and `environment` |
| `GET /health/ready` | Reports database, model configuration, and embedding-library readiness | `200` with overall status and component status objects |

Errors use `{ "error": { "code": "...", "message": "...", "details": [...] } }`. Validation details identify field locations and error types without echoing submitted values. Internal failures are logged with method, path, and exception type while the response stays generic.

- **Backend:** FastAPI routing, Pydantic request/response contracts, environment settings, and later domain services/repositories.
- **Frontend:** React/TypeScript user interface and API client; Vite proxies `/api/*` to the local backend.
- **Data:** PostgreSQL + pgvector is the intended structured and vector store; migrations and persistence schemas are future work.
- **AI:** Embeddings and configurable model adapters belong behind backend services/adapters; no model calls or generation are part of this foundation task.

### Directory layout (target)

```
The-Lighthouse/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── routers/
│   │   │   ├── profile.py
│   │   │   ├── knowledge.py
│   │   │   ├── generate.py
│   │   │   ├── blueprint.py
│   │   │   └── feedback.py
│   │   ├── schemas/
│   │   │   ├── profile.py
│   │   │   ├── knowledge.py
│   │   │   ├── generation.py
│   │   │   ├── blueprint.py
│   │   │   └── feedback.py
│   │   ├── models/
│   │   │   └── db_models.py
│   │   ├── services/
│   │   │   ├── profile_service.py
│   │   │   ├── knowledge_service.py
│   │   │   ├── embedding_service.py
│   │   │   ├── retrieval_service.py
│   │   │   ├── pattern_service.py
│   │   │   ├── generation_service.py
│   │   │   ├── feasibility_service.py
│   │   │   ├── blueprint_service.py
│   │   │   └── feedback_service.py
│   │   └── adapters/
│   │       ├── model_adapter.py
│   │       └── embedding_adapter.py
│   ├── data/
│   │   ├── seed/          # curated JSON seed records
│   │   └── migrations/    # Alembic migrations
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── alembic.ini
├── apps/
│   └── web/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── PROJECT_PLAN.md   (this file)
│   ├── DECISIONS.md
│   └── PROGRESS.md
├── .env.example
├── docker-compose.yml    (PostgreSQL + pgvector local dev)
├── README.md
└── LICENSE
```

---

## 3. Data Model

### Core tables

| Table | Purpose |
|---|---|
| `team_profiles` | One profile per session; contains team-level metadata |
| `team_members` | One row per member; linked to team profile |
| `member_skills` | Per-member skills with proficiency and learning intent |
| `problem_statements` | Historical problem statements |
| `hackathon_events` | Events/editions with rules and themes |
| `hackathon_projects` | Projects submitted at an event |
| `implementation_notes` | Technical challenges, approaches, outcomes |
| `embeddings` | pgvector embeddings keyed to records above |
| `patterns` | Discovered patterns with evidence and limitations |
| `generation_runs` | A generation request and its inputs |
| `candidate_statements` | Generated candidates linked to a run |
| `feasibility_checks` | Per-candidate feasibility results |
| `blueprints` | Execution blueprints for a selected candidate |
| `feedback_items` | User feedback linked to runs and candidates |
| `data_sources` | Source provenance records |

### Key relationships

- `team_members` → `team_profiles` (many-to-one)
- `member_skills` → `team_members` (many-to-one)
- `hackathon_projects` → `hackathon_events` (many-to-one)
- `implementation_notes` → `hackathon_projects` (many-to-one)
- `candidate_statements` → `generation_runs` (many-to-one)
- `candidate_statements` → `problem_statements` (many-to-many, via analogues table)
- `blueprints` → `candidate_statements` (one-to-one)
- `feedback_items` → `candidate_statements` (many-to-one)

---

## 4. Module Boundaries

| Module | Responsibilities | Key services |
|---|---|---|
| A — Team Profiling | Collect, validate, persist team profiles | `ProfileService` |
| B — Knowledge Base | Ingest, store, deduplicate historical records | `KnowledgeService` |
| C — Retrieval | Embed queries, retrieve ranked examples | `EmbeddingService`, `RetrievalService` |
| D — Pattern Intelligence | Co-occurrence, clustering, association rules | `PatternService` |
| E — Generation | LLM prompt construction, structured output, schema validation | `GenerationService`, `ModelAdapter` |
| F — Feasibility | Deterministic skill/time/dependency checks | `FeasibilityService` |
| G — Blueprint | Task plan, architecture, risk register | `BlueprintService` |
| H — Feedback | Collect and store user feedback | `FeedbackService` |

---

## 5. Implementation Phases

### Phase 1 — Vertical slice (MVP priority)

**Goal:** First prove one complete, reviewable journey: validated team input → genuine retrieved examples with provenance → structured candidate generation with evidence links. Add blueprint after this path is stable; do not let a missing model credential prevent deterministic profile and retrieval work.

Tasks:
- [x] Foundation scaffold, API contract, and development setup exist locally. Docker Compose syntax validated; see `docs/PROGRESS.md` for runtime checks.
- [ ] Database: SQLAlchemy models and migrations; verify SQLite test path and PostgreSQL + pgvector startup
- [ ] Module A: Team profile API (POST, GET) with validation
- [ ] Module B: Seed data — start with a small curated, genuine, provenance-reviewed set; expand only when the ingest/retrieval path works (20 records is a phase target, not a substitute for verifying provenance)
- [ ] Module B: Knowledge API (list, get by id, search)
- [ ] Module C: Embedding service (embedding adapter, embed on ingest, embed query)
- [ ] Module C: Retrieval API (semantic search, ranked results with provenance)
- [ ] Module E: Generation service (prompt → structured output → schema validation)
- [ ] Module F: Basic feasibility checks (skills, time, MVP scope)
- [ ] Module G: Blueprint generation for a selected candidate
- [ ] Frontend: Questionnaire page, Results/Comparison page, Blueprint page
- [ ] Tests: unit tests for schemas, services; integration tests for API routes
- [ ] README: accurate setup and demo instructions

### Phase 2 — Pattern intelligence and enrichment

Tasks:
- [ ] Module D: Co-occurrence analysis, clustering by domain
- [ ] Module D: Pattern API (list patterns, pattern detail with evidence)
- [ ] Expand seed dataset (target: 60+ records across ≥5 domains)
- [ ] Feasibility: external API/data checks, dependency graph
- [ ] Frontend: Pattern explorer panel, evidence citations UI
- [ ] Tests: pattern service unit tests

### Phase 3 — Feedback loop and evaluation

Tasks:
- [ ] Module H: Feedback API and persistence
- [ ] Outcome tracking data model
- [ ] Frontend: inline feedback controls
- [ ] Evaluation metrics for retrieval relevance
- [ ] Documentation: architecture diagrams, data-flow docs

---

## 6. Acceptance Criteria (Phase 1)

1. A user can complete the team questionnaire and receive a persisted profile ID.
2. The API retrieves semantically similar historical problem statements for a given team + domain.
3. The system generates ≥2 meaningfully different candidate problem statements using the configured LLM.
4. Each candidate includes all 15 required fields (title through unresolved questions).
5. Generated output is validated against the defined Pydantic schema before being saved.
6. Each candidate links to the specific historical records that informed it.
7. Basic feasibility checks run deterministically and surface at least: skill gaps, time risk, external dependency risk.
8. A blueprint is generated for a selected candidate.
9. The frontend completes the full journey without unhandled errors.
10. The documented database and app setup works; relevant tests pass or are explicitly recorded as blocked.
11. README accurately describes what is implemented.

---

## 7. Testing Plan

| Layer | Tool | Scope |
|---|---|---|
| Backend unit | pytest | Schemas, service logic, adapters, validators |
| Backend integration | pytest + TestClient | All API routes, DB interactions |
| Frontend unit | Vitest + React Testing Library | Components, hooks, form validation |
| End-to-end | Playwright (Phase 2+) | Full journey from questionnaire to blueprint |

Test categories to cover:
- Invalid / empty team profiles
- Missing fields in historical records
- Duplicate record detection
- Empty retrieval results
- Malformed LLM responses
- Invalid model configuration
- API timeouts and provider failures
- Infeasible candidates
- Missing evidence
- Database failures

---

## 8. Known Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| LLM API unavailable or rate-limited | Medium | Configurable adapter; surface error clearly; do not fall back silently |
| pgvector extension not available | Low | docker-compose pins extension; document fallback |
| Insufficient seed data for meaningful retrieval | Medium | Curate ≥20 records before wiring retrieval; expand in Phase 2 |
| LLM structured output fails schema validation | Medium | Strict Pydantic validation; retry with corrective prompt; surface failure |
| Seed data licensing unclear | Medium | Record provenance; flag uncertain licences in data_sources table |

---

## 9. Deferred Features

The following are explicitly deferred to Phase 2 or later:

- Full hackathon project scraping (internet-scale ingestion)
- Fine-tuning any model
- Supervised ranking with feedback labels
- Production deployment and cloud infrastructure
- Multi-tenant / authentication layer
- Playwright end-to-end test suite
- Association-rule mining (requires larger dataset)
- User accounts and session persistence across devices
