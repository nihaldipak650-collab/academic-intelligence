# Academic Intelligence Advisor Production Contract v1.0.7

v1.0.7 inherits all v1.0.6 Evidence, publication identity, DOI/version, provenance, privacy, synthesis, featured-selection, and release rules. Historical v1.0.5/v1.0.6 artifacts are immutable.

## Narrow semantic delta

Advisor-level ORCID is optional identifying metadata, not the advisor identity itself. An unresolved advisor-level ORCID may be retained as an open risk instead of a release blocker only when core identity is independently verified, every adopted publication and adopted official source is verified, unresolved/conflicting publication records are excluded from adopted and featured sets, no released claim depends on selecting an unresolved ORCID, and an explicit scoped Owner release review is approved.

This exception never applies to unresolved advisor name, institution, school/department, official profile, adopted publication identity, adopted official source identity, or any genuine P0 core-identity conflict.

## ORCID release classifications

| Classification | Required state | Release effect |
| --- | --- | --- |
| `verified_identifier` | `orcid_status=verified`, one canonical candidate, no conflicts | eligible if all other gates pass |
| `identifier_not_found` | `orcid_status=not_found`, no candidate or conflicts | eligible if all other gates pass |
| `optional_identifier_unresolved` | `orcid_status=unresolved`, one plausible candidate, no conflicts | open risk; candidate must not be exposed as verified public data |
| `conflicting_optional_identifiers` | `orcid_status=unresolved`, no selected candidate, at least two retained conflicting candidates | open risk; none may be exposed as canonical public data |

## Scoped Owner release review

v1.0.7 adds `owner_release_review`. It records a focused release decision, not exhaustive field-by-field identity research. Release eligibility requires:

- status `approved` or `approved_with_notes`;
- reviewer role `owner` and a valid review date;
- explicit coverage of publication adoption, rejected/unresolved records, ORCID anomalies, featured papers, and focused final web review;
- the current advisor ID in scope;
- acknowledgement of known open risks;
- `exhaustive_review=false`.

`release_authorized` records remote/deployment authority separately and is not a content-validity shortcut. It remains `false` for local calibration and projection work.

The legacy `review_status`, `reviewed_at`, `reviewer_role`, `advisor_identity.human_review_status`, and `HUMAN_IDENTITY_REVIEW_PENDING` record are retained as historical machine/global-review state. A valid scoped Owner release review supersedes only that legacy human-review blocker for v1.0.7 release eligibility; it does not erase or rewrite the history.

## Release blockers

- missing or incomplete scoped Owner release review;
- unresolved core advisor identity;
- unresolved adopted official source;
- unresolved/conflicting adopted publication;
- featured publication not adopted or not identity-verified;
- unresolved/excluded Evidence used by public synthesis;
- inconsistent ORCID release classification;
- any active P0 blocker other than the superseded legacy `HUMAN_IDENTITY_REVIEW_PENDING` marker;
- public exposure of an unresolved/conflicting ORCID as verified or canonical.

## Open risks

Optional or conflicting advisor-level ORCID, unknown corresponding-author role, and unresolved/excluded non-adopted publications may coexist with `release_eligible=true`. They must remain recorded internally and must not support released claims.

## Publication identity and rendering

The v1.0.6 publication truth table is unchanged. Candidate, verified identity, adopted, featured, and released remain separate states. Renderer output may use only adopted Evidence; unresolved/excluded Evidence must never enter synthesis or normal publication output.

When advisor-level ORCID is unresolved, public output must omit candidate/conflicting identifiers. A neutral status such as “ORCID 尚未唯一核验” is allowed only when the product intentionally displays evidence status.

## Cohort 8 calibration boundary

The first calibration applies only to the eight advisor IDs recorded in the scoped Owner review artifact. Canonical v1.0.6 packages remain frozen; v1.0.7 release packages are generated as a deterministic isolated projection.

> This change does not assert that unresolved ORCID values are correct. It allows release only because no public released claim depends on selecting those unresolved identifiers.
