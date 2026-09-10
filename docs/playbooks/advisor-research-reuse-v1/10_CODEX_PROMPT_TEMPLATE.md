# Codex Prompt Template — New Advisor Batch

Copy, fill variables, and preserve all gates.

```text
TASK: Run {COHORT_NAME} using the established advisor-research workflow.

Repository: {REPOSITORY}
Advisor IDs: {ADVISOR_IDS}
Official profiles: {OFFICIAL_PROFILE_URLS}
Output: {OUTPUT_DIR}
Schema: {SCHEMA_VERSION}
Contract: {CONTRACT_VERSION}

First read the contract, schemas, Validator/Renderer, latest approved freeze,
reuse playbook, roster, and existing packages. Git/current files outrank chat.

Allowed writes: only the named advisor packages, cohort review artifacts,
directly related tests, and isolated review-only adapter if required.
Forbidden: public DTO/reports, frontend/public, production site artifacts,
deploy workflow, push, merge, rebase, deploy, publish, or automatic approval.

For each advisor: official profile -> identity seed -> candidate author
inventory -> broad publication retrieval -> article-local DOI normalization ->
record-level name/affiliation/email/ORCID/topic/network verification ->
candidate/unresolved/excluded -> adoption -> publication-supported synthesis ->
featured shortlist. Preserve counterexamples and source failures.

candidate != identity verified != adopted != featured != released.
OpenAlex entities and topic fit are discovery clues, never sole identity proof.
One ORCID-bearing paper does not automatically verify advisor ORCID; retain
conflicts. Verify DOI/title independently and deduplicate formal/preprint.
Only adopted identity-verified evidence may support synthesis. Do not invent
current projects, recruitment, lab atmosphere, mentoring or student tasks.

Pilot gate: process one advisor completely; run Validator, deterministic
Renderer, relevant/full tests, fresh independent reviewer and Owner-visible
latest-surface review. Stop on P0/P1 or common-layer defect. Scale only after
Pilot PASS. Keep human review pending and release_eligible=false unless the
Owner explicitly grants broader authority.

At cohort end reconcile counts, identities, DOI/version groups, cross-advisor
contamination, allowlisted paths, hashes, git diff and public/deploy no-diff.
Return review-ready artifacts, not release claims.
```
