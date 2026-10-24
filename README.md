# Lighthouse

Lighthouse is an open-source project in early development to help hackathon teams choose feasible, evidence-informed projects based on team capabilities and historical hackathon knowledge.

## Current state

The repository currently contains an initial application scaffold:

- A FastAPI backend with liveness (`GET /health`) and readiness (`GET /health/ready`) endpoints.
- Environment-based settings for database, model provider and embedding configuration.
- An async SQLAlchemy database session setup.
- A React + TypeScript + Vite frontend that displays backend readiness.
- Initial backend unit and integration tests.

The team profile questionnaire, historical dataset, semantic retrieval, generation, feasibility analysis, candidate comparison and execution blueprint are **not implemented yet**. The frontend is currently a service-status screen, not the product workflow. No model has been run and no historical dataset has been collected.

## Architecture in the scaffold

The frontend calls the FastAPI backend through Vite's `/api` development proxy. The backend uses Pydantic Settings, SQLAlchemy async sessions, and is configured for PostgreSQL with an intended SQLite-compatible development/test path. PostgreSQL with pgvector is the planned primary store. Database models, migrations, repositories and vector retrieval are not implemented yet.

## Local setup

Requirements: Python 3.11–3.13, Node.js with npm, and Docker Compose for the PostgreSQL service. The current machine's project notes recommend Python 3.11.

1. Copy `.env.example` to `.env` and adjust settings as needed. Keep `.env` private.
2. Start PostgreSQL with `docker compose up -d postgres` if using the configured PostgreSQL URL.
3. In one terminal, install backend development requirements and start the API:

   ```sh
   cd backend
   python3.11 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements-dev.txt
   uvicorn app.main:app --reload
   ```

4. In another terminal, install the locked frontend dependencies and start Vite:

   ```sh
   cd apps/web
   npm ci
   npm run dev
   ```

5. Open the Vite URL (normally `http://localhost:5173`). API documentation is available at `http://localhost:8000/docs`.

For backend tests, from `backend/` run `pytest -q`. Dependencies are pinned in `requirements.txt` and `requirements-dev.txt`; frontend dependencies are pinned by `apps/web/package-lock.json`. Frontend scripts are listed in `apps/web/package.json`.

## Configuration

See `.env.example` for the available settings. Generation configuration is optional for the current scaffold; no generation endpoint exists yet. Model names and provider compatibility must be confirmed against the selected hackathon track before implementation.

## Data, licences and limitations

No historical problem data or outcomes are included yet. The application code's licence has not been selected; the repository currently has no `LICENSE` file. Historical source and content licences must be reviewed separately before adding records. This project is an early scaffold and has not had a security review.

## Roadmap

The implementation plan and current task state are in [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md), [docs/DECISIONS.md](docs/DECISIONS.md), and [docs/PROGRESS.md](docs/PROGRESS.md). The first product slice is a validated team profile, genuine provenance-tracked seed records, retrieval, and evidence-linked candidate generation; optional analysis and blueprint work follows once that path is verified.
