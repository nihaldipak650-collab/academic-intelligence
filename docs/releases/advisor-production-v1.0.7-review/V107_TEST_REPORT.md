# v1.0.7 Test Report

Verification date: 2026-09-11.

Required checks include:

- v1.0.7 semantic truth-table regressions;
- all eight fresh Validators and deterministic Renderers;
- exact 90 = 54 + 24 + 6 + 6 ledger and 39 featured;
- unresolved/excluded Evidence exclusion from adopted/featured/synthesis;
- unresolved ORCID public-value leak prevention;
- exact 29 production projection paths (5 modified, 24 added, 0 removed);
- public DTO count 20, no `guo-hui`;
- DOI uniqueness and cross-advisor contamination;
- freeze 73/73;
- full Python and frontend suites;
- `git diff --check`.

## Results

- v1.0.7 targeted semantics: 15/15 passed.
- Full Python suite: 164 passed plus 37 subtests, 0 failed.
- Full frontend suite: 111 passed, 0 failed.
- Standard production build/typecheck/content scan: passed; the legacy React dataset remains 12 while the canonical Academic site artifact contains 20 approved advisors, with no pending/Experience content entering either surface.
- Cohort fresh Validator: 8/8 valid and `release_eligible=true` under v1.0.7 projection.
- Renderer: deterministic equality for 8/8.
- Freeze: 73 MATCH, 0 DRIFT, 0 MISSING, 0 UNEXPECTED.
- Projection: exactly 29 paths = 5 modified + 24 added + 0 removed.
- Projected DTO: 20 unique public advisors; `guo-hui` absent.
- Publication matrix: 90 = 54 adopted + 24 verified candidate + 6 excluded + 6 identity pending; 39 featured.
- DOI uniqueness/cross-advisor checks: passed.
- Unresolved ORCID public scan: zero candidate/conflicting values in projected public DTO, public advisor data, or public Evidence manifests.
- JavaScript syntax: projected T02 `data.js` and `template.js` passed `node --check`.
- `git diff --check`: passed.

The six immutable latest-surface local-review tests and four pre-release-preview tests are intentionally excluded after canonical materialization because their contract requires `site-src` to equal the pre-release `origin/main`. They remain byte-identical under the 73-file freeze. Eight canonical production-release tests now cover the post-materialization 20-advisor state, and four scanner tests cover the Academic-only DTO allowlist, per-package validation/adoption closure, missing-DTO legacy-ID bypass, and fail-closed gates.

## Calibration matrix

| Advisor | ORCID release classification | Eligible | Warning |
| --- | --- | --- | --- |
| chen-shuhua | verified identifier | yes | scoped review is not exhaustive |
| deng-meichun | verified identifier | yes | scoped review is not exhaustive |
| deng-suixin | verified identifier | yes | scoped review is not exhaustive |
| duan-ranhui | verified identifier | yes | scoped review is not exhaustive |
| fan-liangliang | optional identifier unresolved | yes | ORCID open risk retained |
| guo-yi | verified identifier | yes | scoped review is not exhaustive |
| jiang-hao | optional identifier unresolved | yes | ORCID open risk retained |
| li-jinchen | conflicting optional identifiers, none selected | yes | ORCID conflict retained |

Status: `VERIFICATION_PASS` + `INDEPENDENT_REVIEWER_PASS`.
