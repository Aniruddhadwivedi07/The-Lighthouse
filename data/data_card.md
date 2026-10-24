# Lighthouse Historical Knowledge Base — Data Card

> **Schema version:** 1.0.0
> **Dataset version:** 0.1.0 (initial, no published records)
> **Last updated:** 2026-10-25

---

## 1. Dataset Summary

The Lighthouse historical knowledge base contains curated records of hackathon and competition problem statements and project submissions. Its purpose is to support evidence-informed project discovery by providing a searchable corpus of genuine, provenance-tracked historical records.

### Record types

| Type | Prefix | Description |
|---|---|---|
| `problem_statement` | `ps-` | A challenge or problem issued at a hackathon, competition, or open challenge |
| `project` | `proj-` | A project submitted or built in response to a problem statement or competition |

### Current state

The dataset currently contains **zero** published records. Records are added only after provenance review, licence assessment, and human verification. This file will be updated with aggregate statistics as the dataset grows.

---

## 2. Schema

The canonical schema is defined in [`data/schemas/historical_record.schema.json`](schemas/historical_record.schema.json). It is a JSON Schema (Draft 2020-12) document that validates both record types using a `oneOf` discriminator on `record_type`.

### Key schema design principles

1. **Stable IDs:** Every record has a `record_id` with a type-specific prefix (`ps-` or `proj-`) and an alphanumeric suffix. IDs are immutable once assigned.
2. **Explicit provenance:** Every record carries a `provenance` object with source URL, publisher, source type, access date, licence status, and redistribution notes.
3. **Field-level verification:** A `field_verification` object allows consumers to distinguish between `verified`, `inferred`, `unverified`, and `unknown` field values at per-field granularity.
4. **Conservative defaults:** Missing licence information is recorded as `"unknown"`, never `"open"`. Missing values use `null`, not empty strings or fabricated defaults.
5. **No fabrication:** Outcomes are optional and may only be included when documented with evidence. Repository existence or star count is never treated as evidence of project success.
6. **Versioned:** `schema_version` is embedded in every record to support forward-compatible schema evolution.

---

## 3. Data Collection Process

See [`SOURCES.md`](SOURCES.md) for the collection policy, accepted source types, and review checklist.

### Collection steps

1. **Identify candidate record** — from a public hackathon platform, competition archive, academic publication, or other documented source.
2. **Record provenance** — capture the source URL, publisher name, source type, and access date before extracting content.
3. **Assess licence** — determine the licence under which the source material is published. If unknown, record `"licence_status": "unknown"` and `"licence_identifier": null`.
4. **Extract fields** — copy or summarise title, description, domain, tags, requirements, constraints, and technologies from the source. Record only what is explicitly documented.
5. **Set field verification** — for each extracted field, record whether it is `verified` (copied from primary source), `inferred` (derived from secondary evidence), `unverified` (present but not cross-checked), or `unknown`.
6. **Assign stable ID** — generate a unique `record_id` with the appropriate prefix.
7. **Add ingestion metadata** — record `ingested_at`, `ingested_by`, and optionally `last_reviewed_at` and `review_notes`.
8. **Validate** — run the record against `historical_record.schema.json` before adding to the JSONL file.

---

## 4. Data Files

| File | Format | Description |
|---|---|---|
| `data/schemas/historical_record.schema.json` | JSON Schema 2020-12 | Machine-validatable schema for both record types |
| `data/processed/problem_statements.jsonl` | JSONL (one JSON object per line) | Published problem statement records |
| `data/processed/projects.jsonl` | JSONL (one JSON object per line) | Published project records |
| `data/data_card.md` | Markdown | This file — dataset documentation |
| `data/SOURCES.md` | Markdown | Source catalogue, collection policy, and review guidelines |

---

## 5. Limitations and Known Biases

- **English-language bias:** The initial collection targets English-language sources. Non-English hackathon ecosystems are underrepresented.
- **Platform bias:** Publicly accessible platforms (e.g. Devpost, MLH) are easier to collect from. Internal or invite-only competitions are underrepresented.
- **Survivorship bias:** Only documented projects appear. Projects that were built but not submitted, or submitted but not indexed, are missing.
- **Outcome bias:** Outcomes are only recorded when documented with evidence. The absence of an outcome field does not imply failure. The presence of a repository or stars does not imply success.
- **Temporal bias:** Recent events are more likely to have accessible documentation than older events.

---

## 6. Ethical Considerations

- **No personal data:** Records should not contain personally identifiable information about team members unless it is already publicly published and relevant.
- **No fabrication:** Synthetic records, hallucinated outcomes, or inferred statistics are strictly prohibited.
- **Attribution:** All records must credit their source via the provenance object. Redistribution notes must be respected.
- **Corrections:** Errors in published records should be corrected via the process described in `SOURCES.md`, not by silent modification.

---

## 7. Update and Versioning Policy

- **Schema versions** follow semantic versioning: `MAJOR.MINOR.PATCH`.
  - MAJOR: breaking changes to required fields or record structure.
  - MINOR: new optional fields or new enum values.
  - PATCH: documentation, description, or example corrections only.
- **Dataset versions** are incremented with each published batch of new or corrected records.
- The `schema_version` field in each record indicates which schema version the record conforms to.
- Records from older schema versions remain valid until a major version migration is performed.

---

## 8. Contact and Contribution

To propose new records, report data quality issues, or suggest schema changes, open an issue or pull request in the Lighthouse repository. See `SOURCES.md` for the contribution and review process.
