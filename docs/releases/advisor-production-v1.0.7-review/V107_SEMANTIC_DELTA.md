# v1.0.7 Semantic Delta

Unchanged:

- Evidence provenance and claim closure;
- publication candidate/adopted/featured separation;
- per-paper identity verification;
- official-source verification;
- DOI/version deduplication;
- privacy and synthesis boundaries;
- all v1.0.5/v1.0.6 behavior.

Added:

- explicit ORCID release classification separate from `orcid_status`;
- structured scoped Owner release review with `exhaustive_review=false`;
- distinction between active release blockers and retained open risks;
- public fail-closed check preventing unresolved/conflicting ORCID values from appearing in v1.0.7 public records;
- deterministic v1.0.6-to-v1.0.7 projection for the exact Cohort 8.

The old machine/global review fields and legacy pending blocker remain in projected internal identity evidence. The scoped Owner record supersedes only the legacy human-review release blocker; it does not rewrite history or claim all-field approval.
