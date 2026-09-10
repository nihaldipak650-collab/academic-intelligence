# Academic Intelligence — Phase 2 Expansion Cohort 8 Audit v1

## Decision

`PHASE_2_COHORT_8_REPAIRED_READY_FOR_SCALE_REVIEW`

The original independent semantic review returned `FAIL`. The v1.0.6 builder repair, deterministic verification and fresh independent re-review are complete. This permits Owner scale review only; it does not authorize another cohort or publication.

## Independent re-review

- Repair Round 1 reviewer: `FAIL`, failure signature `PHASE2_V106_AUDIT_INTERNAL_STATE_CONTRADICTION`; implementation and packages passed, but the audit mixed pre-repair and current-state statements.
- Audit-only repair: separated original v1.0.5 historical baseline from current v1.0.6 results; no code or package changes.
- Fresh Repair Round 2 reviewer: `PASS`; blocking defects `[]`, non-blocking defects `[]`, failure signature `null`.
- Independent evidence included the zero-publication negative/positive cases, publication-bearing v1.0.5 compatibility, v1.0.4 approved release gate, exact test counts, all eight package counts and bytes, Git allowlist, and protected public paths.

## v1.0.6 common-layer repair

- Added versioned v1.0.6 contract, Public/Manifest/Identity schemas, display mapping and public Markdown template; v1.0.4 and v1.0.5 artifacts remain unchanged.
- Validator now distinguishes zero candidates, zero adopted, none verified, partially verified and fully verified publication sets. `verified` requires at least one adopted publication whose Manifest and Identity Review records are both verified.
- Zero adopted publications with `publication_identity_status=verified` now return `ZERO_PUBLICATION_IDENTITY_STATUS_CONTRADICTION`.
- Renderer uses actual Manifest publication counts. Zero candidates render “当前未纳入论文候选证据，代表论文及作者身份尚待检索与核验。” A nonzero candidate set renders its exact N count and does not claim completeness.
- The same eight packages were upgraded to v1.0.6 and set to `publication_identity_status=pending_verification`.
- No ninth advisor was added.

## Repair verification

- New regression module: 10 tests covering zero candidates, zero adopted, none verified, partial, full, Renderer wording, the zero-publication release gate, v1.0.5 publication-bearing compatibility and a v1.0.4 approved release gate.
- Full suite after repair: `125 passed, 6 subtests passed`.
- Fresh Validator: 8/8 valid; Fresh Renderer and saved validation reports: 8/8 byte-identical.
- Semantic assertions: forbidden overclaim text absent from 8/8 packages; explicit zero-publication/pending wording present in 8/8.
- Five-file structure, roster membership, cross-advisor contamination, allowlist and `git diff --check`: passed.
- HEAD remains `fed26decc26a709379b0f087be8d68c1b50f2642`.

## Original cohort checkpoint (pre-repair history)

- Worktree: `work/luna-advisor-pilot-3`
- Branch: `codex/luna-advisor-pilot-3`
- HEAD before and after: `fed26decc26a709379b0f087be8d68c1b50f2642`
- Original cohort contract: `production-contract-v1.0.5.md`; the authorized repair added v1.0.6 without overwriting v1.0.5.
- Allowed new advisor paths: the eight directories listed below only.
- Allowed batch record: this audit file.
- During the original cohort production, common renderer, validator, schemas and tests were frozen. The later Owner-authorized repair changed only the directly related common-layer files, v1.0.6 artifacts, tests, these eight packages and review records. Workflow, `frontend/public/`, public DTOs and public reports remained frozen throughout.
- Existing pilot and v1.0.5 repair changes were present at checkpoint and were not counted as Phase 2 writes.

## Cohort selection

Each target was checked against `data/rosters/life-sciences-supervisor-roster-v1.json`. All eight records have confirmed official structured supervisor type, accessible independent profile pages, and `has_v1_advisor_data=false` at the checkpoint.

| Advisor | advisor_id | Structured type | Official profile | Existing package overwritten |
| --- | --- | --- | --- | --- |
| 陈淑华 | `chen-shuhua` | 硕导 | yes | no |
| 邓梅春 | `deng-meichun` | 博导 | yes | no |
| 邓穗馨 | `deng-suixin` | 硕导 | yes | no |
| 段然慧 | `duan-ranhui` | 博导 | yes | no |
| 范亮亮 | `fan-liangliang` | 博导 | yes | no |
| 虢毅 | `guo-yi` | 硕导 | yes | no |
| 姜浩 | `jiang-hao` | 博导 | yes | no |
| 李津臣 | `li-jinchen` | 博导 | yes | no |

## Result matrix

These remain intentionally conservative official-profile-only packages. v1.0.6 now represents their actual state truthfully, but mechanical validity does not imply publication research completeness.

| Advisor | Official profile | Publication candidates | Adopted publications | Publication search | ORCID | Validator | Release eligible |
| --- | ---: | ---: | ---: | --- | --- | --- | --- |
| 陈淑华 | 1 | 0 | 0 | not executed this round | `unresolved` | `valid=true` | `false` |
| 邓梅春 | 1 | 0 | 0 | not executed this round | `unresolved` | `valid=true` | `false` |
| 邓穗馨 | 1 | 0 | 0 | not executed this round | `unresolved` | `valid=true` | `false` |
| 段然慧 | 1 | 0 | 0 | not executed this round | `unresolved` | `valid=true` | `false` |
| 范亮亮 | 1 | 0 | 0 | not executed this round | `unresolved` | `valid=true` | `false` |
| 虢毅 | 1 | 0 | 0 | not executed this round | `unresolved` | `valid=true` | `false` |
| 姜浩 | 1 | 0 | 0 | not executed this round | `unresolved` | `valid=true` | `false` |
| 李津臣 | 1 | 0 | 0 | not executed this round | `unresolved` | `valid=true` | `false` |

## Historical failure trace from the original cohort

1. First-package validation rejected an empty `orcid_verification_basis` and `pending_verification` publication status when no publication records were adopted. The data package was corrected to record an explicit unresolved basis and to use `verified` for the vacuously complete adopted-publication set. No Validator change was made.
2. The 李津臣 package was rejected because an official-profile manifest cannot encode a null school/department and because the external lab URL lacked an Evidence fact/notes closure. The package now records the official host context as `生命科学学院` (not an inferred department) and preserves the lab URL in E1 as `official_contact`. No Validator change was made.
3. Independent review found a new common-layer semantic defect: with zero publication Evidence and an empty `publication_identity` list, `publication_identity_status=verified` passes validation and renders a false “论文归属已核验” statement. The Renderer also states that a complete candidate-evidence set exists although the manifest contains only E1 and zero publication candidates.
4. The original cohort turn stopped under the Owner's Stop Rule and did not attempt a common-layer repair. The separately authorized repair recorded above introduced v1.0.6 and closed this defect. See `phase-2-zero-publication-identity-minimal-repro-v1.md`.

## Original pre-repair batch verification (historical baseline)

- Fresh Validator under v1.0.5: all eight passed despite the later semantic rejection.
- Fresh Renderer under v1.0.5: all eight byte-identical to saved Markdown but deterministically reproduced the overclaim.
- Full pre-repair test baseline: `115 passed, 6 subtests passed`.
- Cross-package advisor_id contamination: none detected.
- Roster membership and target eligibility: all eight passed.
- Five-file structure: all eight passed.
- Allowed write paths: passed; no Phase 2 writes outside the eight advisor directories and this audit file.
- `git diff --check`: passed.
- HEAD before/after: unchanged.
- Historical proposed repair coverage included `ZERO_PUBLICATION_IDENTITY_STATUS_CONTRADICTION` and a Renderer overclaim assertion. v1.0.6 implemented the Validator error code and direct Renderer regression assertions without inventing a Renderer-only Validator error.
- Historical defect: one zero-publication semantic state defect spanning contract/Validator/Renderer, with a second Renderer overclaim in the same state; both are closed by the v1.0.6 repair above.
- Exception queue: empty.

## Owner review boundary

The repair reached `BUILDER_DONE`, `VERIFICATION_PASS` and `INDEPENDENT_REVIEWER_PASS`. Packages remain `publication_status=review_pending`, `release_eligible=false`, with featured selection empty and human identity review pending. Their publication search was not executed in this round, so they are not equivalent in evidence depth to the three publication-bearing pilot packages. No push, merge, rebase, deploy, public-file update, publication, or ninth-advisor production was performed.
