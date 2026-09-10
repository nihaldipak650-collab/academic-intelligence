# v1.0.6 Blocker Analysis

v1.0.6 treats every advisor-level ORCID state outside `verified`/`not_found` as a release blocker and also requires the historical top-level identity review to be globally verified by a human role.

That correctly failed closed, but it conflated two claims:

- core advisor/publication identity is sufficiently closed for the released content;
- one optional global identifier has been uniquely resolved.

For Cohort 8, all adopted publication identities and official profile identities are verified, while Fan Liangliang and Jiang Hao have one insufficient ORCID chain and Jinchen Li has two conflicting candidates with neither selected. None of these values supports a public claim. v1.0.6 therefore blocked safe content because optional metadata remained unresolved.

The earlier hypothetical activation produced `IDENTITY_HUMAN_REVIEW_REQUIRED`, `IDENTITY_REVIEW_DATE_REQUIRED`, `ADVISOR_IDENTITY_NOT_RELEASE_READY`, and `PUBLICATION_STATUS_NOT_ALLOWED` for all eight. v1.0.7 addresses only this representational mismatch; it does not assert that any unresolved identifier is correct.
