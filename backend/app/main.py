"""
Lighthouse — FastAPI Application Entry Point
=============================================
Registers routers, configures CORS, and applies startup/shutdown lifecycle
hooks. Does NOT import LLM adapters at module level — they are loaded lazily
inside services so that the app starts cleanly without API keys.
"""
from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.routers import health
from app.schemas.errors import ErrorBody, ErrorDetail, ErrorResponse

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info(
        "Lighthouse starting",
        environment=settings.app_env,
        generation_configured=settings.generation_configured,
        model_provider=settings.model_provider,
        model_name=settings.model_name,
    )
    if not settings.generation_configured:
        logger.warning(
            "Generation is not configured",
            reason=settings.generation_missing_reason,
        )
    yield
    logger.info("Lighthouse shutting down")


app = FastAPI(
    title="Lighthouse API",
    description=(
        "Personalised hackathon problem discovery powered by historical "
        "knowledge, semantic retrieval, and transparent AI generation."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Return HTTP errors using Lighthouse's stable error envelope."""
    code = f"http_{exc.status_code}"
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    body = ErrorResponse(error=ErrorBody(code=code, message=message))
    return JSONResponse(status_code=exc.status_code, content=body.model_dump(exclude_none=True))


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Expose validation locations and messages without echoing submitted values."""
    details = [
        ErrorDetail(
            location=".".join(str(part) for part in error["loc"]),
            message=error["msg"],
            error_type=error["type"],
        )
        for error in exc.errors()
    ]
    body = ErrorResponse(
        error=ErrorBody(
            code="validation_error",
            message="Request validation failed",
            details=details,
        )
    )
    return JSONResponse(status_code=422, content=body.model_dump(exclude_none=True))


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Log internal failures and return a generic response without exposing internals."""
    logger.exception(
        "Unhandled request error",
        method=request.method,
        path=request.url.path,
        error_type=type(exc).__name__,
    )
    body = ErrorResponse(
        error=ErrorBody(code="internal_error", message="An internal server error occurred")
    )
    return JSONResponse(status_code=500, content=body.model_dump(exclude_none=True))

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health.router)

# Future routers are registered here as they are implemented:
# app.include_router(profile.router)
# app.include_router(knowledge.router)
# app.include_router(generate.router)
# app.include_router(blueprint.router)
# app.include_router(feedback.router)
