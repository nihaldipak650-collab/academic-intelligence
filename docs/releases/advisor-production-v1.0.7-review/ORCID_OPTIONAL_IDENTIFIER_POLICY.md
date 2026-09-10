# ORCID Optional Identifier Policy

ORCID may strengthen identity closure, but it is not the advisor's identity. v1.0.7 permits an ORCID open risk only after name, institution, department, official profile, adopted official sources, and every adopted publication identity are independently verified.

- `optional_identifier_unresolved`: retain one plausible candidate internally; never display it as canonical or verified.
- `conflicting_optional_identifiers`: retain at least two canonical conflicting values internally; select none; keep affected unresolved papers outside adopted/featured output.
- `CORE_IDENTITY_CONFLICT`: never reclassify as optional. It remains a blocker.

Student-facing output may omit ORCID entirely or show only “ORCID 尚未唯一核验”. It must not show candidate/conflicting numbers. Corresponding-author uncertainty remains separate and unchanged.

> This change does not assert that unresolved ORCID values are correct. It allows release only because no public released claim depends on selecting those unresolved identifiers.
