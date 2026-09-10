# Phase 2 Publication Enrichment — Task Contract and Checkpoint

## Objective

Produce an auditable publication-discovery and author-identity Pilot for
`chen-shuhua`. Continue to the remaining seven Phase 2 advisors only after a
fresh independent reviewer returns `INDEPENDENT_REVIEWER_PASS` for the Pilot.

The work is local review production. It does not authorize publication,
deployment, push, merge, rebase, or promotion of human-review state.

## Acceptance criteria

The Pilot must contain an official identity seed, all reasonable candidate
author identities found, a broad publication candidate set, per-paper identity
decisions, DOI/version deduplication, adopted/rejected/unresolved accounting,
an owner-facing audit, a machine-readable ledger, deterministic rendering, a
fresh validator report, relevant and full tests, and an independent review.

`featured_publication_evidence_ids` remains empty and
`featured_selection_status` remains `pending_manual_review`. Human review
remains pending and `release_eligible` must remain false.

## Stop conditions

Stop before the remaining seven advisors if the Pilot exposes a schema or
validator defect, cannot retain author ambiguity, admits an adopted paper
without adequate identity evidence, mishandles DOI/version duplicates,
overclaims in the renderer, conflicts with package status, or receives a P0/P1
finding from the fresh reviewer.

## Allowed write paths

- `data/advisors-v1/chen-shuhua/` during the Pilot
- `docs/reviews/phase-2-publication-enrichment/`
- directly related v1.0.6 tests, only if required
- `frontend/scripts/local-review-phase2-latest-site.mjs` and its directly
  related review-only tests, only after enrichment passes
- the other seven named Phase 2 package directories, only after Pilot pass

Production contracts, schemas, public artifacts, `frontend/public/`,
`site-src/`, deployment workflows, unrelated advisors, and any ninth advisor
are outside the write allowlist.

## Start checkpoint

- Recorded: 2026-09-10 Asia/Shanghai
- Branch: `codex/luna-advisor-pilot-3`
- HEAD: `fed26decc26a709379b0f087be8d68c1b50f2642`
- Worktree was already dirty before this task. Existing tracked and untracked
  paths are not attributed to this task merely from current Git status.
- Pilot package baseline SHA-256:
  - public JSON: `323870dab83285a63ac7ec53774813a59b2380e88f1b10e0d1192869231d6829`
  - Evidence Manifest: `9c43bd6468a66601d16ae7260a501904e87d187b0ddd15d788f3ea07beae701a`
  - Identity Review: `4091a1822d857c03033e74e2de6ed8fe033cfe38fe7d311568a748252d8ca5b9`
  - rendered Markdown: `555971b723da0c2cb5708752daf3159d045e1d6ef6ffa861e624638f09cd5c91`
  - validation report: `68e12bffd5cef6728e11c4ebbd2d1ddd008bfd725df702730e605097c96bb6e6`
- Protected directory baselines:
  - `frontend/public/`: `bc19f25c2f16ff18be325232877f221466314a339a6cc2518fd96a2c93506efa`
  - `site-src/`: `490f5feb95e00423b96e7bf82dd003ea7c88eb93b683de73159cedd9c0c1be59`

## Canonical decisions recovered before writing

- Candidate, adopted, verified, featured, and public-release are distinct.
- Publication Evidence uses one record per canonical publication identity;
  multiple database records do not create multiple papers.
- A publication can be identity-verified while remaining only a candidate.
- Non-null publication ORCID values must equal the advisor candidate ORCID and
  must close to that publication Evidence source URL.
- Advisor-level verified ORCID requires at least two verified publication
  records in the ORCID chain and at least one current official institution or
  email link.
- Verified publication author names must normalize to the public English name.
- Unknown and ambiguous states remain explicit; they are not production
  failures.
