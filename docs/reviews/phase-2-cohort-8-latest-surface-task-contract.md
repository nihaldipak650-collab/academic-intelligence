# Phase 2 Cohort 8 — Latest Surface Local Review Task Contract

## Goal

Build an isolated Owner-review website for the exact Phase 2 cohort using the latest Academic Intelligence directory and T02 profile design family from commit `fed26de`, without changing any public release gate or public artifact.

## Acceptance criteria

- Exact advisor set: `chen-shuhua`, `deng-meichun`, `deng-suixin`, `duan-ranhui`, `fan-liangliang`, `guo-yi`, `jiang-hao`, `li-jinchen`.
- Output only under `frontend/.local-review-phase2-8-latest/`.
- Latest source authority: `site-src/academic/directory/`, `site-src/t02-src/`, and the `buildProfileModule()` flow in `site-builder/build-rebase.mjs`.
- Each package remains `review_pending`, `pending_verification`, and `release_eligible=false`.
- Review-only pages explicitly state that publication search was not run, with candidate and adopted publication counts both zero.
- Public production files, DTOs, reports, workflow, and Hu Zhengmao page are unchanged.
- Eight detail routes and the directory render in a real browser.
- Fresh deterministic checks and an independent review pass.

## Stop conditions

- Any package fails the existing v1.0.6 Phase 2 gate.
- Latest source replacement anchors drift or become ambiguous.
- Any public/production path changes.
- Any pending package is represented as public, approved, verified, or release eligible.

## Owner review boundary

The historical React review remains a technical artifact only. It is not the Owner review authority. This latest-surface output is still local review material and does not authorize publication, push, merge, or deploy.
