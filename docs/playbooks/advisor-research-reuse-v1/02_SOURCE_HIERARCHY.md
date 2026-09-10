# Source Hierarchy

## Tier 1 — identity and claim anchors

- Official university advisor/lab/CV/publication pages.
- ORCID record when independently linked to the advisor.
- DOI publisher metadata and article-local author affiliations.
- PubMed/Europe PMC article metadata with author-level affiliation/email.

## Tier 2 — discovery

- OpenAlex, Crossref, PubMed, Europe PMC and Semantic Scholar.
- These generate candidates; database author clustering alone is not identity authority. Cohort 8 exposed merged entities, fragments, unrelated ORCIDs and one-work clusters in OpenAlex.

## Tier 3 — weak clues

- Search results, third-party profiles and aggregators.
- Use only to locate stronger records. Never use as the sole adoption basis.

Record inaccessible sources as `NOT_ACCESSED`, `ACCESS_FAILED` or `UNKNOWN`. Do not claim an access occurred when it did not.

Historical affiliations such as MD Anderson, Fudan or Beijing Normal may be valid. Evaluate them against publication date and career timeline rather than requiring every real paper to show current CSU affiliation.
