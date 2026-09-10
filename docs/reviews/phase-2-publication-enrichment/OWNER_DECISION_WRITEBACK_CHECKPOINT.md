# Owner Publication Decision Writeback — Checkpoint

- Objective: apply the exact 2026-09-10 Owner publication-content and featured decisions to the Phase 2 cohort of eight, then rebuild the isolated latest-surface review site.
- Start branch / HEAD: `codex/luna-advisor-pilot-3` / `fed26decc26a709379b0f087be8d68c1b50f2642`.
- Starting ledger equation independently recomputed from the current CSV: `40 adopted + 38 verified candidates + 6 rejected + 6 unresolved = 90`.
- Expected final equation: `54 adopted + 24 verified candidates + 6 rejected + 6 unresolved = 90`; expected featured total: 39.
- Allowed writes: the exact eight advisor package directories, publication-enrichment review artifacts/ledger/tests, and the isolated latest-surface review adapter/output.
- Protected: `frontend/public/`, `site-src/`, production DTO/reports, schemas/contracts/validator semantics, site-builder/deploy workflow, and every ninth advisor.
- Human/release boundary: publication-content and featured approval only. Advisor identity human review remains pending; `publication_status=review_pending`; `release_eligible=false`.
- Definition of done: exact Owner sets, regenerated canonical Markdown/validation reports, ledger and audits reconciled, deterministic tests pass, fresh independent reviewer passes, and localhost latest-surface review is rebuilt.
