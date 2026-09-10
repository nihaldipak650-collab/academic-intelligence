# Acceptance Tests

Future batches must include deterministic checks for:

1. publication search absent or `SEARCH_NOT_RUN` presented as complete;
2. official-profile-only package presented as publication-enriched;
3. candidate/adopted/featured counts or sets conflated;
4. article DOI/title mismatch and cited-reference DOI leakage;
5. duplicate DOI and formal/preprint double counting;
6. unresolved or excluded evidence used in synthesis/adoption;
7. single-record advisor ORCID auto-promotion;
8. conflicting ORCIDs silently collapsed;
9. featured evidence not adopted or not identity-verified;
10. cross-advisor DOI, name, ORCID or Evidence contamination;
11. historical builder overwriting Owner decisions;
12. rendered page presenting unresolved evidence as normal adopted output;
13. Renderer byte nondeterminism or stale saved Markdown;
14. public/release gate weakening and protected-path writes.

Also require ledger/package equation closure, exact roster membership, Fresh Validator, deterministic Renderer equality, full regression, `git diff --check`, protected-path content checks and a fresh independent reviewer.

Prefer extending existing tests over creating a parallel framework. A failure must name the advisor, evidence ID and violated invariant.
