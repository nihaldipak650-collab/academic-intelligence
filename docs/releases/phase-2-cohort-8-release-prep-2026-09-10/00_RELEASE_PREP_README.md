# Phase 2 Cohort 8 — Local Release Candidate Preparation

Status: `LOCAL_RELEASE_CANDIDATE_READY` after the containing commit passes the checks listed here. This directory does not authorize push, deployment, publication, or release.

## Authority and baseline

- Original HEAD: `fed26decc26a709379b0f087be8d68c1b50f2642`
- Branch: `codex/luna-advisor-pilot-3`
- Frozen authority: `docs/releases/phase-2-cohort-8-freeze-2026-09-10/FREEZE_MANIFEST.json`
- Owner decision authority: `docs/reviews/phase-2-publication-enrichment/OWNER_PUBLICATION_DECISIONS_2026-09-10.json`
- Human verdict: `OWNER_FINAL_WEB_REVIEW_PASS_WITH_NOTES`
- Human review scope: focused high-risk and representative spot-check, not exhaustive field-by-field or paper-by-paper re-verification.

The release-candidate SHA is the Git commit that contains this file and `RELEASE_CANDIDATE_MANIFEST.json`. The manifest uses the non-recursive marker `RESOLVE_AS_CONTAINING_COMMIT`; embedding a commit's own SHA inside that commit is not possible.

## Content in the local candidate

The candidate preserves exactly eight frozen v1.0.6 packages, their publication research/audits, Owner decisions, freeze artifacts, reuse pack, validator/renderer changes, regression tests, and review-only web tooling. The v1.0.5 pilot packages and contract assets are included as tested dependency fixtures because the v1.0.6 validator and regression suite load them.

The historical React review surface is retained only as a tested technical artifact required by the frozen test inventory. It is not the Owner review or production UI authority. The latest-site/T02 surface remains the UI authority.

The full Vitest command runs test files serially because the latest-surface and release-preview suites intentionally rebuild the same fixed, safety-allowlisted review root. Parallel file execution caused a Windows `EPERM` directory-removal race; it did not indicate advisor-data drift or a contract defect.

The frozen historical React test `src/test/phase2-review-ui.test.tsx` is excluded from the current full-suite command. It asserts the superseded pre-enrichment state (`candidate=0`, `adopted=0`) and also depended on an already-generated ignored directory, so it cannot be a release gate for the enriched cohort. Its bytes remain frozen for provenance. Current zero-publication semantics remain covered by the v1.0.6 Python tests; the latest-site and release-preview suites are the web release gates.

Root `.gitattributes` marks only the freeze inventory's source families as `-text`, preventing Windows `core.autocrlf` from changing approved SHA-256 bytes in a fresh checkout. It recognizes approved CRLF bytes with `cr-at-eol`; three immutable frozen review artifacts also retain one historical blank line at EOF, so only the `blank-at-eof` rule is disabled for those exact paths. Standard `git diff --check` still checks every other whitespace rule and path.

## Change classification

- `APPROVED_RELEASE_CONTENT`: the eight packages; v1.0.5 dependency fixtures; v1.0.5/v1.0.6 contracts and schemas; validator/renderer; Phase 2 audits, Owner decisions, freeze, reuse pack; directly related Python/frontend tests and local review code.
- `RELEASE_PREP_ONLY`: this directory; `frontend/scripts/release-preview-phase2-cohort8.mjs`; its test; the ignored isolated preview output.
- `PREEXISTING_OR_UNRELATED`: generated `frontend/public/` line-ending/mtime noise. Its content diff is empty and it is not committed.
- `UNKNOWN`: none at commit gate.

## Isolated preview

Generated path: `frontend/.release-preview-phase2-cohort8/`.

The preview combines the current 12 public advisors with the exact frozen eight, giving 20 projected public entries. It copies all existing public advisor package bytes unchanged. The eight candidate package bytes also remain unchanged, including `publication_status=review_pending` and `release_eligible=false`; a preview-only adapter exposes them for final authorization review.

This distinction is deliberate: the local preview is a proposed student-facing projection, not a weakening of the production release gate. Final production activation must remain a separately authorized operation.

## Known limits

- No canonical `site-src/`, `frontend/public/`, deploy workflow, or remote branch is changed by this preparation.
- The exact affected production path set is known, but release-eligibility activation bytes are intentionally not generated before explicit Owner authorization.
- All open risks in the freeze remain authoritative and fail-closed.
- `origin/main` was inspected only from the locally available ref; no fetch occurred. At preflight it was two commits ahead of the original HEAD.

## Reproduce

```powershell
python scripts/check-phase2-cohort8-freeze.py
python -m pytest -q
Set-Location frontend
npm test -- --run
npm run generate:release-preview:phase2
npm run validate:release-preview:phase2
```

Then serve `frontend/.release-preview-phase2-cohort8/` with any static local server. Do not use the preview directory as a deployment source.
