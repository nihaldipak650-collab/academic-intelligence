# Phase 2 Cohort 8 Freeze — 2026-09-10

## Freeze contract

- Goal: preserve the exact eight-advisor v1.0.6 state accepted by the Owner's focused final web spot-check.
- Canonical evidence: the eight five-file packages, Owner publication decisions, ledger, advisor/cohort audits, contract/schema sources, and validation/review code listed in `FREEZE_FILE_HASHES.csv`.
- Verification: `python scripts/check-phase2-cohort8-freeze.py` must report `MATCH`; semantic regression tests must retain the 54/24/6/6 ledger equation and 39 featured decisions.
- Protected actions: no push, merge, rebase, deploy, publication, public DTO change, or release-gate promotion.
- Definition of done: hashes and package semantics reproduce, known risks remain open, tests pass, and a fresh reviewer finds no P0/P1 defect.

## What is frozen

Exactly these advisors: `chen-shuhua`, `deng-meichun`, `deng-suixin`,
`duan-ranhui`, `fan-liangliang`, `guo-yi`, `jiang-hao`, and `li-jinchen`.
The state includes Owner publication adoption/featured decisions, retained
candidate/excluded/unresolved rows, ORCID conclusions, deterministic Markdown,
and validation reports.

The Git checkout was not assumed clean. Only explicitly enumerated paths are
part of this freeze. A file's presence in the worktree is not evidence that it
was created by this freeze.

## Authority hierarchy

1. Git and current file bytes at the recorded HEAD/worktree.
2. `FREEZE_MANIFEST.json` plus `FREEZE_FILE_HASHES.csv`.
3. Owner publication decision JSON and focused web-review conclusion.
4. v1.0.6 contract, schemas, Validator and Renderer.
5. Audits and human-readable summaries.

If prose conflicts with hashes or package data, stop and investigate. Never
edit data merely to make the prose agree.

## Owner review scope

Owner conclusion: `OWNER_FINAL_WEB_REVIEW_PASS_WITH_NOTES`.

This was a focused human spot-check of the highest-risk and representative
pages, publication choices, ORCID anomalies, unresolved/excluded records,
featured choices, and AI-synthesis boundaries. It was not exhaustive manual
re-verification of every field or publication.

## Not approved

This freeze is not `HUMAN_APPROVED`, `READY_FOR_RELEASE`, `DEPLOYED`, or
`PUBLISHED`. Advisor identity human review remains pending,
`publication_status=review_pending`, and `release_eligible=false` for all eight.
The localhost review build is derived and is not a canonical source artifact.

## How to use the snapshot

1. Run `python scripts/check-phase2-cohort8-freeze.py` from repository root.
2. Require `MATCH` before reusing this cohort as a baseline.
3. Read `KNOWN_OPEN_RISKS.md`; unresolved states are intentional truth, not cleanup work.
4. Use `docs/playbooks/advisor-research-reuse-v1/` for a new cohort. Do not copy advisor facts between packages.
5. If drift is intentional, create a new freeze rather than silently rewriting this one.
