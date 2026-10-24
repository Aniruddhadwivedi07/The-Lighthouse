"""
Tests for the Lighthouse historical record JSON Schema.

Validates that:
- The schema itself is a valid JSON Schema document.
- Valid problem_statement records pass validation.
- Valid project records pass validation.
- Missing required fields are rejected.
- Invalid field values are rejected.
- Missing licence information defaults to 'unknown', not 'open'.
- No unverified outcomes slip through without verification_status.
- Record IDs conform to their expected prefix patterns.
- Field verification statuses are constrained to the defined enum.
"""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator, ValidationError, validate

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

SCHEMA_PATH = Path(__file__).resolve().parents[3] / "data" / "schemas" / "historical_record.schema.json"
PROBLEM_STATEMENTS_PATH = Path(__file__).resolve().parents[3] / "data" / "processed" / "problem_statements.jsonl"
PROJECTS_PATH = Path(__file__).resolve().parents[3] / "data" / "processed" / "projects.jsonl"


@pytest.fixture(scope="module")
def schema() -> dict:
    """Load the historical record JSON Schema."""
    with open(SCHEMA_PATH) as f:
        return json.load(f)


@pytest.fixture(scope="module")
def validator(schema: dict) -> Draft202012Validator:
    """Create a reusable validator instance."""
    return Draft202012Validator(schema)


def _minimal_problem_statement() -> dict:
    """Return a minimal valid problem_statement record."""
    return {
        "record_id": "ps-testrecord01",
        "record_type": "problem_statement",
        "schema_version": "1.0.0",
        "title": "Build a flood early-warning system",
        "description": "Design and prototype an IoT-based flood monitoring and alert platform.",
        "domain": "sustainability",
        "tags": ["iot", "disaster-response"],
        "provenance": {
            "source_url": "https://example.com/hackathon/2024/flood-challenge",
            "publisher": "Example Hackathon Org",
            "source_type": "hackathon_platform",
            "access_date": "2026-10-25",
            "licence_identifier": None,
            "licence_status": "unknown",
            "redistribution_note": "Licence not stated on challenge page.",
        },
        "field_verification": {
            "title": "verified",
            "description": "verified",
            "domain": "inferred",
        },
        "ingestion": {
            "ingested_at": "2026-10-25T00:00:00Z",
            "ingested_by": "test-suite",
        },
    }


def _minimal_project() -> dict:
    """Return a minimal valid project record."""
    return {
        "record_id": "proj-testproject01",
        "record_type": "project",
        "schema_version": "1.0.0",
        "title": "AquaGuard — Smart Flood Monitor",
        "description": "An IoT system using water-level sensors and SMS alerts.",
        "domain": "sustainability",
        "tags": ["iot", "sms", "hardware"],
        "provenance": {
            "source_url": "https://devpost.com/software/aquaguard",
            "publisher": "Devpost",
            "source_type": "hackathon_platform",
            "access_date": "2026-10-25",
            "licence_identifier": None,
            "licence_status": "unknown",
            "redistribution_note": None,
        },
        "field_verification": {
            "title": "verified",
            "description": "verified",
            "domain": "verified",
        },
        "ingestion": {
            "ingested_at": "2026-10-25T00:00:00Z",
            "ingested_by": "test-suite",
        },
    }


# ---------------------------------------------------------------------------
# Schema meta-validation
# ---------------------------------------------------------------------------


class TestSchemaValidity:
    """Verify the schema document itself is well-formed."""

    def test_schema_file_exists(self) -> None:
        assert SCHEMA_PATH.exists(), f"Schema file not found at {SCHEMA_PATH}"

    def test_schema_is_valid_json(self) -> None:
        with open(SCHEMA_PATH) as f:
            data = json.load(f)
        assert "$schema" in data

    def test_schema_is_valid_json_schema(self, schema: dict) -> None:
        """The schema itself should be a valid JSON Schema 2020-12 document."""
        Draft202012Validator.check_schema(schema)


# ---------------------------------------------------------------------------
# Problem statement validation
# ---------------------------------------------------------------------------


class TestProblemStatementValid:
    """Valid problem_statement records must pass validation."""

    def test_minimal_problem_statement(self, schema: dict) -> None:
        validate(instance=_minimal_problem_statement(), schema=schema)

    def test_problem_statement_with_all_optional_fields(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["event_name"] = "Global Hack 2024"
        record["event_date"] = "2024-03-15"
        record["requirements"] = ["Must use open-source tools", "Team of 2-5"]
        record["constraints"] = ["48-hour time limit"]
        record["technologies"] = ["Python", "MQTT"]
        record["field_verification"]["event_name"] = "verified"
        record["field_verification"]["event_date"] = "verified"
        record["field_verification"]["requirements"] = "verified"
        record["field_verification"]["constraints"] = "verified"
        record["field_verification"]["technologies"] = "verified"
        record["ingestion"]["last_reviewed_at"] = "2026-10-25T12:00:00Z"
        record["ingestion"]["review_notes"] = "Initial review complete."
        validate(instance=record, schema=schema)


class TestProblemStatementInvalid:
    """Invalid problem_statement records must be rejected."""

    def test_missing_record_id(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["record_id"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_missing_title(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["title"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_missing_provenance(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["provenance"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_missing_field_verification(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["field_verification"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_missing_ingestion(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["ingestion"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_empty_title_rejected(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["title"] = ""
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_wrong_record_id_prefix(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["record_id"] = "proj-wrongprefix01"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_invalid_record_id_characters(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["record_id"] = "ps-UPPERCASE"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_invalid_verification_status(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["field_verification"]["title"] = "maybe"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_invalid_source_type(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["provenance"]["source_type"] = "random_blog"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_invalid_licence_status(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["provenance"]["licence_status"] = "free"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_wrong_schema_version(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["schema_version"] = "2.0.0"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_additional_properties_rejected(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["invented_field"] = "should not be here"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_missing_required_field_verification_keys(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["field_verification"] = {"title": "verified"}  # missing description, domain
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_duplicate_tags_rejected(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["tags"] = ["iot", "iot"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)


# ---------------------------------------------------------------------------
# Project validation
# ---------------------------------------------------------------------------


class TestProjectValid:
    """Valid project records must pass validation."""

    def test_minimal_project(self, schema: dict) -> None:
        validate(instance=_minimal_project(), schema=schema)

    def test_project_with_outcomes(self, schema: dict) -> None:
        record = _minimal_project()
        record["outcomes"] = [
            {
                "summary": "Won first place at Global Hack 2024.",
                "evidence_url": "https://example.com/results",
                "verification_status": "verified",
            }
        ]
        validate(instance=record, schema=schema)

    def test_project_with_all_optional_fields(self, schema: dict) -> None:
        record = _minimal_project()
        record["event_name"] = "Global Hack 2024"
        record["event_date"] = "2024-03-15"
        record["problem_statement_id"] = "ps-testrecord01"
        record["requirements"] = ["Use open data"]
        record["constraints"] = ["24-hour build"]
        record["technologies"] = ["React", "Python", "PostgreSQL"]
        record["team_size"] = 4
        record["field_verification"]["event_name"] = "verified"
        record["field_verification"]["event_date"] = "verified"
        record["field_verification"]["requirements"] = "inferred"
        record["field_verification"]["constraints"] = "unverified"
        record["field_verification"]["technologies"] = "verified"
        record["field_verification"]["team_size"] = "verified"
        record["outcomes"] = [
            {
                "summary": "Finalist, top 10 of 200 teams.",
                "evidence_url": "https://example.com/finalists",
                "verification_status": "verified",
            }
        ]
        record["ingestion"]["last_reviewed_at"] = "2026-10-25T12:00:00Z"
        record["ingestion"]["review_notes"] = "All fields checked against Devpost page."
        validate(instance=record, schema=schema)


class TestProjectInvalid:
    """Invalid project records must be rejected."""

    def test_missing_record_id(self, schema: dict) -> None:
        record = _minimal_project()
        del record["record_id"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_wrong_record_id_prefix(self, schema: dict) -> None:
        record = _minimal_project()
        record["record_id"] = "ps-wrongprefix01"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_missing_provenance(self, schema: dict) -> None:
        record = _minimal_project()
        del record["provenance"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_outcome_without_verification_status(self, schema: dict) -> None:
        record = _minimal_project()
        record["outcomes"] = [
            {
                "summary": "Won first place.",
                # Missing verification_status
            }
        ]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_outcome_with_invalid_verification_status(self, schema: dict) -> None:
        record = _minimal_project()
        record["outcomes"] = [
            {
                "summary": "Won first place.",
                "verification_status": "assumed",
            }
        ]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_team_size_zero_rejected(self, schema: dict) -> None:
        record = _minimal_project()
        record["team_size"] = 0
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_team_size_negative_rejected(self, schema: dict) -> None:
        record = _minimal_project()
        record["team_size"] = -1
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_additional_properties_rejected(self, schema: dict) -> None:
        record = _minimal_project()
        record["github_stars"] = 500  # should not be in the schema
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)


# ---------------------------------------------------------------------------
# Licence policy tests
# ---------------------------------------------------------------------------


class TestLicencePolicy:
    """Enforce that missing licence information is never treated as open."""

    def test_unknown_licence_status_is_valid(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["provenance"]["licence_status"] = "unknown"
        record["provenance"]["licence_identifier"] = None
        validate(instance=record, schema=schema)

    def test_open_licence_requires_explicit_status(self, schema: dict) -> None:
        """A record can have 'open' licence — but it must be explicitly set, not defaulted."""
        record = _minimal_problem_statement()
        record["provenance"]["licence_status"] = "open"
        record["provenance"]["licence_identifier"] = "CC-BY-4.0"
        validate(instance=record, schema=schema)

    def test_missing_licence_status_is_rejected(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["provenance"]["licence_status"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)


# ---------------------------------------------------------------------------
# Provenance traceability tests
# ---------------------------------------------------------------------------


class TestProvenanceTraceability:
    """Every record must be traceable to its source."""

    def test_source_url_required(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["provenance"]["source_url"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_access_date_required(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["provenance"]["access_date"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_source_type_required(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        del record["provenance"]["source_type"]
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)

    def test_additional_provenance_fields_rejected(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        record["provenance"]["extra_field"] = "not allowed"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)


# ---------------------------------------------------------------------------
# Published data file validation
# ---------------------------------------------------------------------------


class TestPublishedDataFiles:
    """Validate every record in the published JSONL files."""

    def test_problem_statements_file_exists(self) -> None:
        assert PROBLEM_STATEMENTS_PATH.exists()

    def test_projects_file_exists(self) -> None:
        assert PROJECTS_PATH.exists()

    def test_all_problem_statements_are_valid(self, schema: dict) -> None:
        """Every line in problem_statements.jsonl must pass schema validation."""
        content = PROBLEM_STATEMENTS_PATH.read_text().strip()
        if not content:
            pytest.skip("No problem statement records published yet.")
        for i, line in enumerate(content.splitlines(), 1):
            record = json.loads(line)
            validate(instance=record, schema=schema), f"Record on line {i} failed validation"

    def test_all_projects_are_valid(self, schema: dict) -> None:
        """Every line in projects.jsonl must pass schema validation."""
        content = PROJECTS_PATH.read_text().strip()
        if not content:
            pytest.skip("No project records published yet.")
        for i, line in enumerate(content.splitlines(), 1):
            record = json.loads(line)
            validate(instance=record, schema=schema), f"Record on line {i} failed validation"

    def test_no_duplicate_record_ids_in_problem_statements(self) -> None:
        content = PROBLEM_STATEMENTS_PATH.read_text().strip()
        if not content:
            pytest.skip("No problem statement records published yet.")
        ids = [json.loads(line)["record_id"] for line in content.splitlines()]
        assert len(ids) == len(set(ids)), f"Duplicate record_ids found: {[x for x in ids if ids.count(x) > 1]}"

    def test_no_duplicate_record_ids_in_projects(self) -> None:
        content = PROJECTS_PATH.read_text().strip()
        if not content:
            pytest.skip("No project records published yet.")
        ids = [json.loads(line)["record_id"] for line in content.splitlines()]
        assert len(ids) == len(set(ids)), f"Duplicate record_ids found: {[x for x in ids if ids.count(x) > 1]}"

    def test_no_unknown_licence_marked_as_open(self, schema: dict) -> None:
        """Ensure no record claims 'open' licence without a licence identifier."""
        for path in [PROBLEM_STATEMENTS_PATH, PROJECTS_PATH]:
            content = path.read_text().strip()
            if not content:
                continue
            for i, line in enumerate(content.splitlines(), 1):
                record = json.loads(line)
                prov = record["provenance"]
                if prov["licence_status"] == "open":
                    assert prov.get("licence_identifier") is not None, (
                        f"Record {record['record_id']} (line {i} in {path.name}) "
                        f"claims 'open' licence but has no licence_identifier"
                    )


# ---------------------------------------------------------------------------
# Cross-type consistency tests
# ---------------------------------------------------------------------------


class TestCrossTypeConsistency:
    """Verify that record_type and record_id prefix are consistent."""

    def test_problem_statement_type_matches_prefix(self, schema: dict) -> None:
        record = _minimal_problem_statement()
        assert record["record_type"] == "problem_statement"
        assert record["record_id"].startswith("ps-")
        validate(instance=record, schema=schema)

    def test_project_type_matches_prefix(self, schema: dict) -> None:
        record = _minimal_project()
        assert record["record_type"] == "project"
        assert record["record_id"].startswith("proj-")
        validate(instance=record, schema=schema)

    def test_mixed_type_and_prefix_rejected(self, schema: dict) -> None:
        """A problem_statement with a proj- prefix must be rejected."""
        record = _minimal_problem_statement()
        record["record_id"] = "proj-mismatch01"
        with pytest.raises(ValidationError):
            validate(instance=record, schema=schema)
