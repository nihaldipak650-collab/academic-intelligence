# Publication Decision Rules

## Normalize first

- Extract DOI only from the article's own identifier block. A broad XML XPath can capture cited-reference DOIs; reject that method.
- Independently verify DOI/title correspondence through publisher, Crossref, PubMed or Europe PMC metadata.
- Canonicalize DOI case/prefix and deduplicate identical DOI/title records.
- Link formal/preprint versions. Count the formal article once and retain the preprint only as a version relation; Ranhui Duan E3 is the reference case.

## Decisions

- `candidate`: discovered, not yet adopted.
- `identity_pending`/`unresolved`: plausible but insufficient closure.
- `excluded`/`conflict`: counterevidence indicates another person or invalid record.
- `adopted`: identity verified and accepted for this package.

Only adopted identity-verified publications may support public-facing research synthesis. Never use unresolved or excluded evidence. Adoption proves authorship identity for this use; it does not prove current priority, featured status, corresponding authorship or release eligibility.
