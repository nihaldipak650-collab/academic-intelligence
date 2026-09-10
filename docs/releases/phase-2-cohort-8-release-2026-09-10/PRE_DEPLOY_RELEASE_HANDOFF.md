# Phase 2 Cohort 8 — Pre-deploy Release Handoff

Status: `READY_FOR_MANUAL_DEPLOY` only after the final release commit is pushed and its remote SHA is verified.

## Authority and baseline

- Owner approved the Advisor Production Contract v1.0.7 semantic delta.
- Owner approved the exact 29-path production projection: 5 modified, 24 added, 0 removed.
- Owner authorized normal non-force commit and push to the repository's established remote `main` route.
- Owner did not authorize deployment, publication, workflow dispatch, or `deploy=true`.
- Remote baseline used for this release: `d6e4b0c035493b4007fb70f90b17dbb4acfb0254`.
- Integrated Cohort 8 RC commit: `5d0059b1245fca4d4ab6685bfe60751f52bedb5e`.
- Final release SHA: the commit containing this handoff and the canonical 29-path production materialization; record the resolved SHA in the final Owner handoff after push verification.

## Review scope

The Owner review was `approved_with_notes` and scoped to release-critical publication, identity, ORCID, featured-selection, and rendered-output boundaries. `exhaustive_review` remains `false`; this is not `HUMAN_APPROVED_ALL_FIELDS`.

The frozen Cohort 8 totals remain:

- 90 publication candidates;
- 54 adopted;
- 24 verified candidates not adopted;
- 6 excluded;
- 6 identity-pending;
- 39 featured selections.

## Retained open risks

- Chen Shuhua: E21/E22 excluded; E23 unresolved.
- Guo Yi: E7 unresolved; E11 excluded.
- Jiang Hao: E5/E11 unresolved; E8/E9/E10 excluded; advisor ORCID unresolved; no unsupported tumor–nerve publication trajectory.
- Jinchen Li: E7/E8 unresolved; two conflicting ORCIDs remain internal; neither is selected or publicly exposed.
- Fan Liangliang: the single-record advisor ORCID remains unresolved.
- Corresponding-author role remains null unless independently verified.

None of these unresolved or excluded records may enter adopted, featured, or ordinary verified student-facing publication output.

## Manual deployment boundary

After verifying the pushed release SHA, the Owner may manually run GitHub Actions workflow `Validate and deploy frontend 1.0 to GitHub Pages` with `deploy=true`. This task does not run that workflow and records no deployment, publication, live-site result, or production smoke result.
