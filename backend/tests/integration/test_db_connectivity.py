"""
Integration tests for database connectivity and readiness endpoint.
Uses an async SQLite database to verify the real DB query path without external dependencies.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import get_db
from app.main import app


@pytest.mark.asyncio
async def test_real_db_connectivity() -> None:
    """Verifies that an async engine connects and executes SELECT 1 successfully."""
    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    async_session = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        result = await session.execute(text("SELECT 1"))
        scalar = result.scalar()
        assert scalar == 1

    await test_engine.dispose()


def test_readiness_with_real_sqlite_db() -> None:
    """Tests the /health/ready endpoint using a real SQLite session override."""
    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )
    test_session_maker = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_db():
        async with test_session_maker() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as client:
            resp = client.get("/health/ready")
            assert resp.status_code == 200
            data = resp.json()
            assert data["database"]["ok"] is True
            assert data["database"]["detail"] == "Connected"
    finally:
        app.dependency_overrides.clear()
