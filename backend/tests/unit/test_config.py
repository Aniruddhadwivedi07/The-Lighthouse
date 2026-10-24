"""
Tests for application configuration.
Verifies that Settings correctly interprets environment variables and that
the generation_configured / generation_missing_reason helpers behave as
documented.
"""
from __future__ import annotations

from app.config import Settings


class TestGenerationConfigured:
    def test_both_absent_is_not_configured(self) -> None:
        s = Settings(model_provider=None, model_name=None)
        assert s.generation_configured is False

    def test_provider_only_is_not_configured(self) -> None:
        s = Settings(model_provider="google_gemini", model_name=None)
        assert s.generation_configured is False

    def test_model_only_is_not_configured(self) -> None:
        s = Settings(model_provider=None, model_name="gemma-3-27b-it")
        assert s.generation_configured is False

    def test_both_present_is_configured(self) -> None:
        s = Settings(model_provider="google_gemini", model_name="gemma-3-27b-it")
        assert s.generation_configured is True


class TestGenerationMissingReason:
    def test_missing_provider_mentions_MODEL_PROVIDER(self) -> None:
        s = Settings(model_provider=None, model_name=None)
        assert s.generation_missing_reason is not None
        assert "MODEL_PROVIDER" in s.generation_missing_reason

    def test_missing_model_name_mentions_MODEL_NAME(self) -> None:
        s = Settings(model_provider="google_gemini", model_name=None)
        assert s.generation_missing_reason is not None
        assert "MODEL_NAME" in s.generation_missing_reason

    def test_fully_configured_returns_none(self) -> None:
        s = Settings(model_provider="openai", model_name="gpt-4o-mini")
        assert s.generation_missing_reason is None


class TestCorsOriginParsing:
    def test_list_passthrough(self) -> None:
        s = Settings(cors_origins=["http://localhost:3000", "http://localhost:5173"])
        assert "http://localhost:3000" in s.cors_origins

    def test_comma_string_is_split(self) -> None:
        s = Settings(cors_origins="http://a.com, http://b.com")
        assert "http://a.com" in s.cors_origins
        assert "http://b.com" in s.cors_origins
