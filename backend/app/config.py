"""
Lighthouse — Application Configuration
=======================================
All settings are read from environment variables (or a .env file in the
project root). Application startup does not require an LLM API key; only
the generation endpoints will fail with a clear error if one is absent.
"""
from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        protected_namespaces=(),
    )

    # -----------------------------------------------------------------------
    # Application
    # -----------------------------------------------------------------------
    app_env: Literal["development", "production", "test"] = "development"
    log_level: str = "INFO"
    cors_origins: list[str] = ["http://localhost:5173"]

    # -----------------------------------------------------------------------
    # Database
    # -----------------------------------------------------------------------
    database_url: str = (
        "postgresql+asyncpg://lighthouse:lighthouse@localhost:5432/lighthouse"
    )

    # -----------------------------------------------------------------------
    # LLM — Model Adapter
    # MODEL_PROVIDER selects the adapter implementation.
    # MODEL_NAME is the exact model identifier for that provider.
    # Both are optional; generation endpoints surface a clear error when absent.
    # -----------------------------------------------------------------------
    model_provider: str | None = None  # "google_gemini" | "openai" | "ollama"
    model_name: str | None = None

    google_api_key: str | None = None
    openai_api_key: str | None = None
    ollama_base_url: str = "http://localhost:11434"

    # -----------------------------------------------------------------------
    # Embeddings (local sentence-transformers, no API key required)
    # -----------------------------------------------------------------------
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    # -----------------------------------------------------------------------
    # Derived helpers
    # -----------------------------------------------------------------------
    @property
    def generation_configured(self) -> bool:
        """True only when a provider and model are both specified."""
        return bool(self.model_provider and self.model_name)

    @property
    def generation_missing_reason(self) -> str | None:
        """Human-readable explanation of why generation is unavailable."""
        if not self.model_provider:
            return (
                "MODEL_PROVIDER is not set. "
                "Set it to 'google_gemini', 'openai', or 'ollama' in your .env file."
            )
        if not self.model_name:
            return (
                "MODEL_NAME is not set. "
                "Specify the exact model identifier for the chosen provider."
            )
        return None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


# Module-level singleton — import `settings` everywhere rather than
# instantiating Settings() in multiple places.
settings = Settings()
