# Lighthouse — Architecture & Implementation Decisions

> Decisions are recorded here once made. Every entry includes the chosen option, the rationale and the alternatives considered.

---

## DEC-001 — Database: PostgreSQL + pgvector

**Date:** 2026-10-24
**Status:** Decided

**Choice:** PostgreSQL as the primary structured database; pgvector extension for semantic vector storage and retrieval.

**Rationale:**
- The project directive specifies PostgreSQL as the preferred database.
- pgvector is a mature, actively maintained extension that allows vector similarity search inside the same Postgres instance, eliminating a separate vector-database service dependency at MVP stage.
- Keeping structured records and embeddings in one database simplifies joins (e.g., retrieving a historical record alongside its embedding) and reduces operational complexity.
- If retrieval requirements outgrow pgvector, the `EmbeddingAdapter` abstraction allows migration to a dedicated vector store without changing service logic.

**Alternatives considered:**
- Separate vector DB (Qdrant, Weaviate, Chroma): adds an operational dependency; unnecessary for MVP scale.
- SQLite: insufficient for pgvector extension and concurrent write access.

---

## DEC-002 — ORM and Migrations: SQLAlchemy + Alembic

**Date:** 2026-10-24
**Status:** Decided

**Choice:** SQLAlchemy 2.x (async) as the ORM; Alembic for schema migrations.

**Rationale:**
- SQLAlchemy 2.x provides typed model definitions compatible with Pydantic and FastAPI's async patterns.
- Alembic gives versioned, reproducible migrations — essential for a team project and for the project directive's requirement of idempotent ingestion.
- Both are standard in the FastAPI ecosystem with extensive documentation.

**Alternatives considered:**
- Tortoise ORM: smaller ecosystem, fewer Alembic-style migration tools.
- Raw SQL: acceptable for simple projects but loses typing benefits and makes migrations error-prone.

---

## DEC-003 — Backend Framework: FastAPI

**Date:** 2026-10-24
**Status:** Decided

**Choice:** FastAPI with Pydantic v2 schemas.

**Rationale:**
- Specified by the project directive.
- Pydantic v2 provides fast, strict schema validation — required for validating LLM structured output.
- Auto-generated OpenAPI docs aid frontend development and demo.

**Alternatives considered:** None; this is a directive requirement.

---

## DEC-004 — Frontend: React + TypeScript + Vite

**Date:** 2026-10-24
**Status:** Decided

**Choice:** React 18, TypeScript, Vite as the build tool; shadcn/ui + Tailwind CSS for components.

**Rationale:**
- React + TypeScript are specified by the directive.
- Vite is the modern, fast build tool recommended over CRA.
- shadcn/ui provides accessible, unstyled-by-default components that avoid a heavy design-system lock-in. Tailwind CSS gives consistent utility-first styling.

**Alternatives considered:**
- Next.js: adds SSR complexity not needed for an MVP SPA.
- MUI / Chakra: heavier component libraries with more opinionated styling.

---

## DEC-005 — LLM Provider and Model: Configurable Adapter, Default Gemini (Gemma 4)

**Date:** 2026-10-24
**Status:** Decided — subject to hackathon track confirmation

**Choice:** A `ModelAdapter` interface with an initial implementation using the Google Gemini API (targeting Gemma 4 if the Gemma 4 partner track is selected). The model, provider and API key are set via environment variables.

**Rationale:**
- The directive explicitly states that all model and provider configuration must go through environment variables and a documented configuration layer.
- Hardcoding a provider into business logic would prevent switching without refactoring.
- The Gemma 4 partner track is referenced in the directive as a possible track; the adapter must be verified against the actual track requirement before launch.

**What must be confirmed before using a specific model:**
- The event's stated track requirement (Gemma 4 / Gemini API vs. open-weight local model).
- Model identity, licence and inference method.
- Whether multimodal capability is required by the track.

**Alternatives considered:**
- OpenAI API: not mentioned in the directive's preferred track.
- Local Ollama / vLLM: valid for open-weight track; adapter can support this.

**Action required:** Confirm the hackathon track before Phase 1 completion.

---

## DEC-006 — Embedding Model: sentence-transformers (local, configurable)

**Date:** 2026-10-24
**Status:** Decided

**Choice:** `sentence-transformers` library with a configurable model name (default: `all-MiniLM-L6-v2`). Embeddings run locally; no external embedding API call at MVP.

**Rationale:**
- Avoids a paid embedding API dependency for the core retrieval loop.
- `all-MiniLM-L6-v2` is compact (80 MB), produces 384-dimensional embeddings, runs on CPU, and has a permissive licence (Apache 2.0).
- The `EmbeddingAdapter` abstraction allows swapping to OpenAI, Vertex AI or a larger local model without changing retrieval logic.

**Alternatives considered:**
- OpenAI text-embedding-ada-002: costs money per call; adds external dependency.
- Gemini embedding API: valid if the track requires it; can be added as a second adapter.

---

## DEC-007 — Seed Data Strategy: Manual Curation First

**Date:** 2026-10-24
**Status:** Decided

**Choice:** Start with a manually curated set of ≥20 genuine historical problem statements from publicly documented hackathon sources (e.g., Devpost, MLH, published challenge specs). Expand in Phase 2.

**Rationale:**
- The directive prohibits fabricating historical records, project outcomes or statistics.
- Scraping at scale requires licence review, deduplication and significant engineering — inappropriate for MVP.
- A small, high-quality, fully-provenance-tracked seed set is more reliable than a large, poorly-attributed one.
- Provenance (source URL, retrieval date, licence status) is recorded for every seed record.

**Action required:** Curate and review seed records before wiring the retrieval pipeline.

---

## DEC-008 — Local Development Environment: docker-compose

**Date:** 2026-10-24
**Status:** Decided

**Choice:** A `docker-compose.yml` that starts PostgreSQL with pgvector. Application services run locally (not in Docker) during development for easier debugging.

**Rationale:**
- Reproducible database environment for all contributors.
- pgvector requires a Postgres image with the extension compiled; `ankane/pgvector` (or `pgvector/pgvector`) provides this.
- Running the app outside Docker preserves fast reload cycles.

**Alternatives considered:**
- Full docker-compose stack: useful for demo but adds friction during active development.
- Managed cloud DB: requires credentials; not reproducible for open-source contributors.

---

## DEC-009 — Python Version: 3.11 (not 3.14)

**Date:** 2026-10-24
**Status:** Decided — discovered during installation

**Choice:** Use Python 3.11 for the backend virtual environment.

**Rationale:**
- The system default Python (`python3`) is 3.14.6 (Homebrew).
- `pydantic-core` 2.27.1 fails to build on Python 3.14 because its Rust binding (pyo3 0.22.6) only supports up to Python 3.13.
- Python 3.11 is installed via Homebrew and fully supported by all required packages.
- This constraint is documented in `requirements.txt` and in `README.md`.

**What this means in practice:**
- Create the venv with: `python3.11 -m venv .venv`
- Do **not** use the system `python3` (which resolves to 3.14) on this machine.
- `requirements-ml.txt` separates the heavy torch/sentence-transformers install so tests run without them.

**Alternatives considered:**
- `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1`: undocumented flag; risks subtle runtime bugs; not appropriate for a reliable product.
- Upgrade pydantic-core: no release supporting Python 3.14 exists at time of writing (2026-10-24).
- Downgrade to Python 3.12/3.13: both supported, but 3.11 is already installed; no reason to install another version.

---

## DEC-010 — Database Flexibility: PostgreSQL/pgvector with SQLite Fallback

**Date:** 2026-10-24
**Status:** Direction chosen; implementation pending

**Choice:** Design database models and retrieval services to be dialect-agnostic via clean interfaces. Support PostgreSQL + pgvector as the primary target, while providing an out-of-the-box SQLite (`sqlite+aiosqlite`) fallback with in-memory/cosine similarity vector retrieval so that the application, tests, and demo can work without a running Docker/PostgreSQL instance.

**Rationale:**
- In accordance with project directive and user guidance, Docker or database configuration issues must not block a working demo.
- Keeping retrieval behind an interface (`RetrievalRepository` / `KnowledgeRepository`) allows pgvector when connected to Postgres, and an exact cosine similarity fallback over stored vectors when using SQLite.
- Enables zero-friction local development and automated CI testing.

**Alternatives considered:**
- Hard dependency on Postgres/Docker: breaks immediate usability when Docker is inactive.
- SQLite-only: loses the production-grade PostgreSQL and native pgvector integration requested by the project directive.

**Implementation status at 2026-10-24:** The current scaffold configures SQLAlchemy async sessions and includes `aiosqlite`/`pgvector` dependencies, but has no ORM models, migrations, repositories, or vector retrieval. SQLite fallback and PostgreSQL/pgvector behaviour remain to be implemented and verified.

---

## DEC-011 — Foundation layout and error contract

**Date:** 2026-10-24
**Status:** Implemented for the repository foundation

**Choice:** Keep the backend under `backend/` and place the React + TypeScript + Vite application at `apps/web/`. Define liveness and readiness endpoints as the initial API contract, with a consistent JSON error envelope for HTTP, validation, and unexpected failures.

**Rationale:** This matches the requested frontend location while preserving the existing UI files by moving the directory intact. The error envelope gives future frontend/API work one predictable shape and avoids exposing internal exceptions. The `/health` liveness endpoint remains independent of external services; `/health/ready` reports dependency status.

**Alternatives considered:** Keeping the frontend at `frontend/` would avoid a move but conflict with the requested repo layout. Returning FastAPI's default responses for each exception type yields inconsistent shapes.

**Scope boundary:** No database models, migrations, business endpoints, AI generation, or product screens are introduced by this decision.
