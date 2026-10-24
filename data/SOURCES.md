# Lighthouse — Data Sources and Publication Policy

> Last updated: 2026-10-25

---

## 1. Purpose

This document defines how historical records are collected, reviewed, published, corrected, and versioned in the Lighthouse knowledge base. Every published record must be traceable to its source, and every licence assessment must be explicit.

---

## 2. Accepted Source Types

Records may be collected from the following source categories. Each category has different licence and attribution expectations.

| Source Type | Examples | Typical Licence Expectation |
|---|---|---|
| `hackathon_platform` | Devpost, MLH, Devfolio | Platform ToS; often allows public viewing but redistribution may be restricted. Assess per platform. |
| `competition_archive` | Kaggle competitions, DrivenData | Competition-specific rules. Read the competition's data licence. |
| `academic_publication` | ACM, IEEE, arXiv | Varies widely. arXiv is typically CC-BY or author-granted. Check per paper. |
| `government_dataset` | data.gov, EU Open Data Portal | Often open licence (CC0, OGL). Verify per dataset. |
| `official_documentation` | Challenge organisers' official pages | Organisers may grant public use; verify before redistributing. |
| `news_article` | TechCrunch, Hacker News | Fair use for factual summaries; do not reproduce full articles. |
| `blog_post` | Medium, Dev.to, personal blogs | Author's copyright; summarise, attribute, do not copy. |
| `repository_readme` | GitHub, GitLab | Governed by repository licence. Do not infer project outcomes from existence. |
| `conference_proceedings` | Conference websites, published proceedings | Publisher's copyright. Often restricted redistribution. |
| `other` | Any source not fitting above | Document explicitly. Treat licence as `unknown` unless confirmed. |

---

## 3. Collection Procedure

### 3.1 Identify a candidate record

Potential records come from browsing hackathon platforms, reading challenge announcements, reviewing academic publications, or community contributions.

### 3.2 Record provenance before extracting content

Before copying any content, record:

- **`source_url`** — the URL where the content was found.
- **`publisher`** — the platform, organisation, or individual that published the content.
- **`source_type`** — one of the accepted types above.
- **`access_date`** — the date (YYYY-MM-DD) you accessed the source.

### 3.3 Assess redistribution rights

Follow this decision tree:

1. Does the source page or platform ToS explicitly permit redistribution? → Record the licence identifier (SPDX if possible) and set `licence_status` to `"open"` or `"restricted"`.
2. Does the source page state a specific licence (e.g. CC-BY-4.0, MIT, Apache-2.0)? → Record it as `licence_identifier`.
3. Is the licence ambiguous or not stated? → Set `licence_status` to `"unknown"` and `licence_identifier` to `null`. Add a `redistribution_note` explaining what was checked.
4. Does the source prohibit redistribution? → Set `licence_status` to `"proprietary"`. You may still create a record containing only metadata and a link (title, domain, source URL) but must not reproduce copyrighted description text.

**Rule: never default to `"open"`.** Unknown is the safe default.

### 3.4 Extract fields

- Copy the title and description from the source. Use quotation or close paraphrase with attribution.
- Assign a domain category from the controlled vocabulary (see Section 5).
- List tags for discoverability.
- Record requirements, constraints, and technologies **only if explicitly stated in the source**. Do not infer technologies from repository file listings.
- For projects: record team size **only if explicitly stated**. Do not count GitHub contributors.

### 3.5 Set field-level verification

For each extracted field, set the `field_verification` status:

| Status | When to use |
|---|---|
| `verified` | Directly copied from or confirmed against the primary source document |
| `inferred` | Derived from secondary evidence (e.g. event page mentions a year, you infer date) |
| `unverified` | Present in the source but not cross-checked against a second source |
| `unknown` | No information available for this field |

### 3.6 Assign a stable record ID

Generate a unique identifier:

- Problem statements: `ps-` followed by 8–32 lowercase alphanumeric characters (e.g. `ps-devpost2024abc`).
- Projects: `proj-` followed by 8–32 lowercase alphanumeric characters (e.g. `proj-kaggle2023xyz`).

IDs are **immutable** once assigned. If a record is found to be a duplicate, the duplicate is removed and the original retains its ID.

### 3.7 Validate and add

- Run the record through `data/schemas/historical_record.schema.json` using a JSON Schema validator (e.g. `jsonschema`, `ajv`, or the project's test suite).
- Append the validated JSON object as a single line to the appropriate JSONL file.

---

## 4. Preserving Attribution

Every record's `provenance` object serves as the attribution record. Additionally:

- If the source licence requires specific attribution text, include it in `redistribution_note`.
- If you summarise or paraphrase content, note this in the record's `review_notes` field.
- Never remove or modify the `source_url` or `publisher` fields after publication.

---

## 5. Domain Vocabulary

The following domain categories are recommended for consistency. New domains may be added as the dataset grows, but prefer existing terms when possible.

| Domain | Description |
|---|---|
| `healthcare` | Health, medicine, wellness, medical devices |
| `education` | Learning, ed-tech, accessibility in education |
| `sustainability` | Environment, climate, green tech, circular economy |
| `fintech` | Financial technology, payments, banking |
| `civic_tech` | Government, public services, civic engagement |
| `social_impact` | Non-profit, humanitarian, community support |
| `developer_tools` | IDEs, build tools, CI/CD, APIs |
| `data_science` | Analytics, visualisation, ML/AI applications |
| `communication` | Messaging, collaboration, social media |
| `gaming` | Games, interactive entertainment, gamification |
| `security` | Cybersecurity, privacy, authentication |
| `accessibility` | Assistive technology, inclusive design |
| `transportation` | Mobility, logistics, autonomous systems |
| `agriculture` | Farming, food supply chain, agri-tech |
| `other` | Domains not covered above |

---

## 6. Duplicate Detection

Before adding a record, check for duplicates:

1. **Exact URL match:** Search existing records for the same `source_url`. If found, do not add a duplicate.
2. **Title similarity:** Check if a record with a substantially similar title and the same `event_name` already exists.
3. **Cross-type references:** A project record may reference a problem statement via `problem_statement_id`. This is not a duplicate — it is a cross-reference.

If a duplicate is found after publication:
- Remove the newer record.
- Add a note in the retained record's `review_notes` explaining the deduplication.
- Log the deduplication in the dataset's version history.

---

## 7. Handling Corrections

If an error is found in a published record:

1. **Document the error** — describe what is wrong and what the correct value should be.
2. **Update the record** — modify the field value and update `field_verification` if appropriate.
3. **Update ingestion metadata** — set `last_reviewed_at` to the current timestamp and describe the correction in `review_notes`.
4. **Re-validate** — run the corrected record through the schema validator.
5. **Bump the dataset version** — increment the dataset patch version.
6. **Do not change the `record_id`** — the ID is immutable.

---

## 8. Publishing Versioned Datasets

### Dataset version format

Dataset versions follow `MAJOR.MINOR.PATCH`:

- **MAJOR:** Schema breaking change that requires record migration.
- **MINOR:** New records added, domains expanded, or new optional fields added.
- **PATCH:** Corrections to existing records or documentation updates.

### Release checklist

Before publishing a new dataset version:

- [ ] All records in `problem_statements.jsonl` pass schema validation.
- [ ] All records in `projects.jsonl` pass schema validation.
- [ ] No record has `licence_status: "open"` without a confirmed licence identifier.
- [ ] No record has fabricated outcomes or unverified facts presented as verified.
- [ ] `data_card.md` is updated with current record counts and statistics.
- [ ] This file (`SOURCES.md`) is updated if new source types or domains were added.
- [ ] Changes are documented in the version history below.

### Version history

| Version | Date | Changes |
|---|---|---|
| 0.1.0 | 2026-10-25 | Initial schema, empty dataset, documentation published |

---

## 9. Source Registry

This section catalogues every source that has been assessed for the dataset, whether or not records were extracted from it. This supports traceability and prevents re-assessment.

| Source | URL | Source Type | Licence Assessment | Records Extracted |
|---|---|---|---|---|
| *(No sources assessed yet)* | — | — | — | 0 |

---

## 10. Prohibited Practices

The following are explicitly prohibited in the Lighthouse dataset:

1. **Fabricating records.** Every record must come from a documented source.
2. **Inferring outcomes.** Do not infer project success from repository stars, forks, or continued activity.
3. **Defaulting to open.** If the licence is not confirmed, it is `"unknown"`.
4. **Removing provenance.** Source URLs and publishers must never be deleted from records.
5. **Silent corrections.** All corrections must be documented in `review_notes` and trigger a version bump.
6. **Inferring technologies.** Do not list technologies based on repository file extensions. Only include technologies explicitly documented in the source.
7. **Including personal data.** Do not include personally identifiable information unless it is already publicly published and relevant to the record.
