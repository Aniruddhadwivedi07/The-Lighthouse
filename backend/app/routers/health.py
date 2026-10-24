"""
Health-check router
===================
Provides two endpoints:
  GET /health        — lightweight liveness probe (no DB required)
  GET /health/ready  — readiness probe (checks DB connection + generation config)

Neither endpoint exposes internal stack traces or secrets.
"""
from __future__ import annotations

import time

import structlog
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/health", tags=["health"])
logger = structlog.get_logger()

_START_TIME = time.time()


class LivenessResponse(BaseModel):
    status: str
    uptime_seconds: float
    environment: str


class ComponentStatus(BaseModel):
    ok: bool
    detail: str | None = None


class ReadinessResponse(BaseModel):
    status: str  # "ready" | "degraded" | "not_ready"
    database: ComponentStatus
    generation: ComponentStatus
    embeddings: ComponentStatus


@router.get("", response_model=LivenessResponse, summary="Liveness probe")
async def liveness() -> LivenessResponse:
    """
    Always returns 200 while the process is running.
    Does not check external dependencies.
    """
    return LivenessResponse(
        status="alive",
        uptime_seconds=round(time.time() - _START_TIME, 1),
        environment=settings.app_env,
    )


@router.get("/ready", response_model=ReadinessResponse, summary="Readiness probe")
async def readiness(db: AsyncSession = Depends(get_db)) -> ReadinessResponse:
    """
    Checks:
    - Database connectivity (required for core functionality)
    - Generation configuration (optional — surfaces a clear message when absent)
    - Embedding model availability (checked by import only at this stage)
    """
    # --- Database ---
    db_status: ComponentStatus
    try:
        await db.execute(text("SELECT 1"))
        db_status = ComponentStatus(ok=True, detail="Connected")
    except Exception as exc:
        logger.exception("Database readiness check failed", error_type=type(exc).__name__)
        db_status = ComponentStatus(ok=False, detail="Connection failed")

    # --- Generation ---
    if settings.generation_configured:
        gen_status = ComponentStatus(
            ok=True,
            detail=f"Provider: {settings.model_provider}, Model: {settings.model_name}",
        )
    else:
        gen_status = ComponentStatus(
            ok=False,
            detail=settings.generation_missing_reason,
        )

    # --- Embeddings ---
    try:
        import sentence_transformers  # noqa: F401
        emb_status = ComponentStatus(
            ok=True,
            detail=f"sentence-transformers available (model: {settings.embedding_model})",
        )
    except ImportError as exc:
        emb_status = ComponentStatus(ok=False, detail=str(exc))

    # Overall status: ready only if DB is up; generation is optional.
    if db_status.ok:
        overall = "ready" if gen_status.ok else "degraded"
    else:
        overall = "not_ready"

    return ReadinessResponse(
        status=overall,
        database=db_status,
        generation=gen_status,
        embeddings=emb_status,
    )
