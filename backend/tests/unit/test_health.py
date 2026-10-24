"""
Tests for the health-check endpoints.

These tests use FastAPI's TestClient and mock the database session so they
run without a live PostgreSQL instance.
"""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_mock_db(execute_raises: Exception | None = None) -> AsyncMock:
    """Return a mock AsyncSession."""
    session = AsyncMock()
    if execute_raises:
        session.execute.side_effect = execute_raises
    else:
        session.execute.return_value = MagicMock()
    return session


def client_with_db(mock_db: AsyncMock) -> TestClient:
    """Return a TestClient with the DB dependency overridden."""

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    c = TestClient(app, raise_server_exceptions=False)
    return c


# ---------------------------------------------------------------------------
# Liveness tests
# ---------------------------------------------------------------------------

class TestLiveness:
    def test_liveness_returns_200(self) -> None:
        with TestClient(app) as client:
            resp = client.get("/health")
        assert resp.status_code == 200

    def test_liveness_body_has_status_alive(self) -> None:
        with TestClient(app) as client:
            data = client.get("/health").json()
        assert data["status"] == "alive"

    def test_liveness_body_has_uptime(self) -> None:
        with TestClient(app) as client:
            data = client.get("/health").json()
        assert isinstance(data["uptime_seconds"], float)
        assert data["uptime_seconds"] >= 0

    def test_liveness_body_has_environment(self) -> None:
        with TestClient(app) as client:
            data = client.get("/health").json()
        assert data["environment"] in ("development", "production", "test")


# ---------------------------------------------------------------------------
# Readiness tests
# ---------------------------------------------------------------------------

class TestReadiness:
    def test_readiness_db_ok_no_generation_is_degraded(self) -> None:
        """When DB is reachable but no model is configured, status is 'degraded'."""
        mock_db = make_mock_db()
        client = client_with_db(mock_db)
        try:
            with patch("app.config.settings.model_provider", None), \
                 patch("app.config.settings.model_name", None):
                resp = client.get("/health/ready")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "degraded"
            assert data["database"]["ok"] is True
            assert data["generation"]["ok"] is False
            assert data["generation"]["detail"] is not None
        finally:
            app.dependency_overrides.clear()

    def test_readiness_db_ok_generation_configured_is_ready(self) -> None:
        """When DB is reachable and model is configured, status is 'ready'."""
        mock_db = make_mock_db()
        client = client_with_db(mock_db)
        try:
            with patch("app.config.settings.model_provider", "google_gemini"), \
                 patch("app.config.settings.model_name", "test-model"):
                resp = client.get("/health/ready")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "ready"
            assert data["database"]["ok"] is True
            assert data["generation"]["ok"] is True
        finally:
            app.dependency_overrides.clear()

    def test_readiness_db_failure_is_not_ready(self) -> None:
        """When DB is unreachable, status must be 'not_ready' regardless of generation."""
        mock_db = make_mock_db(execute_raises=Exception("connection refused"))
        client = client_with_db(mock_db)
        try:
            resp = client.get("/health/ready")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "not_ready"
            assert data["database"]["ok"] is False
            assert data["database"]["detail"] == "Connection failed"
        finally:
            app.dependency_overrides.clear()

    def test_readiness_generation_detail_explains_missing_provider(self) -> None:
        """The detail field must explain what is missing, not just return None."""
        mock_db = make_mock_db()
        client = client_with_db(mock_db)
        try:
            with patch("app.config.settings.model_provider", None), \
                 patch("app.config.settings.model_name", None):
                data = client.get("/health/ready").json()
            detail = data["generation"]["detail"]
            assert detail is not None
            assert "MODEL_PROVIDER" in detail
        finally:
            app.dependency_overrides.clear()

    def test_readiness_embeddings_field_present(self) -> None:
        """Embeddings status must always be present in the response."""
        mock_db = make_mock_db()
        client = client_with_db(mock_db)
        try:
            data = client.get("/health/ready").json()
            assert "embeddings" in data
            assert "ok" in data["embeddings"]
        finally:
            app.dependency_overrides.clear()
