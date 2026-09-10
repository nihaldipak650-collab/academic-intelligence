# Phase 2 Cohort 8 — Latest Surface Web Review Audit

## Final state

`READY_FOR_OWNER_WEB_REVIEW_LATEST_SURFACE`

This is not `HUMAN_APPROVED` and not `READY_FOR_RELEASE`.

## Online and Git source authority

- Current deployed site checked directly: `https://nihaldipak650-collab.github.io/academic-intelligence/`.
- Current deployed directory: `/academic/`.
- Current deployed Hu Zhengmao reference: `/academic/profile/profile.html?id=hu-zhengmao&t=t02`.
- Remote `main` at review time: `d6e4b0c035493b4007fb70f90b17dbb4acfb0254`.
- Local source HEAD: `fed26decc26a709379b0f087be8d68c1b50f2642` (`Publish Hu Zhengmao advisor profile`).
- `fed26de..origin/main` has no changes under `site-src/academic/directory/`, `site-src/academic/profile/`, `site-src/t02-src/`, or `site-builder/build-rebase.mjs`; the two later commits are merge commits.
- The deployed directory is produced by `buildDirectory()` from `site-src/academic/directory/`, including the `r2-green.css` layer and parent navigation.
- The deployed detail page is produced by `buildProfileModule()` from `site-src/t02-src/{profile.html,app.js,data.js,template.js,template.css}`. `cleanupOldProfiles()` removes the historical profile artifact, and `injectFeedback()` adds the deployed feedback layer.
- Online CSS and T02 template normalized hashes match their local source files. The local review output copies those source assets and reproduces the online assembly layer before applying isolated review-only data and wording.

## Isolation and gate behavior

- Generated output: `frontend/.local-review-phase2-8-latest/` only; it is gitignored.
- Canonical public T02 source still contains `if (!m || !m.release.eligible)` and is not edited.
- The review loader is generated only inside the isolated output and accepts only records that already passed the v1.0.6 Phase 2 package gate, have `release_eligible=false`, `publication_status=review_pending`, and `publication_identity_status=pending_verification`.
- Public DTO, public reports, public site artifacts, production workflow, and Hu Zhengmao public package/page are not modified.
- The historical React review output is not the Owner review authority.

## Exact cohort and browser result

| advisor_id | browser route | review semantics |
| --- | --- | --- |
| chen-shuhua | PASS | PASS |
| deng-meichun | PASS | PASS |
| deng-suixin | PASS | PASS |
| duan-ranhui | PASS | PASS |
| fan-liangliang | PASS | PASS |
| guo-yi | PASS | PASS |
| jiang-hao | PASS | PASS |
| li-jinchen | PASS | PASS |

Each page visibly contains:

- `LOCAL REVIEW ONLY`
- `本轮未执行论文检索`
- `当前未纳入论文候选证据`
- `代表论文及作者身份尚待检索与核验`
- `候选论文 0`
- `已采用论文 0`
- `publication identity: pending`
- `review_pending · release_eligible=false`

No page contains the invalid wording `已核验成果 0 篇（已核验）`.

## Independent review and repair

The first fresh independent review returned `FAIL` for verification-chain gaps, while confirming the current pages themselves rendered correctly 8/8. Repair closed all reported gaps:

- recursive output deletion and verification are locked to the one fixed isolated directory;
- directory DTO, profile DTO, and pack folders require exact-set equality with the eight IDs;
- UI authority is checked against the fetched `origin/main` Git tree and the actual commit is recorded;
- `--check` reruns the complete v1.0.6 source package gate and byte-compares every copied package file;
- automated jsdom integration renders all eight routes and asserts the canonical review wording;
- Hu Zhengmao and an unknown advisor are automatic rejection fixtures;
- protected production paths are checked against HEAD inside the verifier.

Repair Round independent review result: `INDEPENDENT_REVIEWER_PASS`.

## Deterministic verification

- Latest-surface + Phase 2 adapter + historical React technical-artifact tests: 17 passed.
- Advisor production regression suite: 125 passed, 6 subtests passed.
- Fresh review-site check: passed for all 8 packages.
- Real browser route and semantic check: 8/8 passed.
- `git diff --check`: passed.
- `frontend/public/`, `site-src/academic/directory/`, `site-src/academic/profile/`, `site-src/t02-src/`, `site-builder/build-rebase.mjs`, and `.github/workflows/deploy-frontend-pages.yml`: no diff.

## Owner review URLs

- Directory: `http://127.0.0.1:43125/academic/`
- Detail pattern: `http://127.0.0.1:43125/academic/profile/profile.html?id=<advisor_id>&t=t02`

The localhost server is a local review server only. No push, merge, rebase, deploy, or public release was performed.
