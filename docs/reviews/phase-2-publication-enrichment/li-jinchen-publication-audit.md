# li-jinchen Publication Audit

- Official-profile search seed: Jinchen Li; official profile E1
- Candidate author discovery: PubMed name+CSU query returned 167 records before advisor-local triage.
- Candidates retained: 10
- Adopted: 5
- Identity-verified candidates not adopted: 3
- Rejected/conflict: 0
- Unresolved: 2
- ORCID state: unresolved (no candidate selected)
- Human review: pending; release: false

## Candidate publications

| ID | Year | Decision | Identity | DOI | Reason |
| --- | ---: | --- | --- | --- | --- |
| E2 | 2024 | adopted | verified | 10.1016/j.ebiom.2023.104928 | Official representative list plus official email and multi-unit CSU affiliation. |
| E3 | 2024 | adopted | verified | 10.1093/nar/gkad1061 | Official representative list plus exact author and multi-unit CSU affiliation; publication ORCID conflicts with another official paper and is not adopted as advisor ORCID. |
| E4 | 2024 | adopted | verified | 10.1038/s41467-024-52310-9 | Official representative list plus official email and multi-unit CSU affiliation; ORCID conflicts with E3 and remains unresolved. |
| E5 | 2026 | adopted | verified | 10.1093/nar/gkaf980 | Official representative list plus exact author and multi-unit CSU affiliation. |
| E6 | 2026 | adopted | verified | 10.1016/j.scib.2025.10.028 | Official representative list plus official email and multi-unit CSU affiliation. |
| E7 | 2026 | identity_pending | unresolved | 10.1093/bib/bbag428 | Relevant unit but carries ORCID 0000-0003-3335-9303, one side of the unresolved two-ORCID conflict. |
| E8 | 2026 | identity_pending | unresolved | 10.1038/s41380-026-03754-6 | Relevant unit but carries ORCID 0000-0001-5522-806X, the other side of the unresolved two-ORCID conflict. |
| E9 | 2026 | candidate | verified | 10.1016/j.scib.2026.07.038 | Exact multi-unit CSU bioinformatics/medical-genetics affiliation and official disease direction. |
| E10 | 2026 | candidate | verified | 10.1016/j.ebiom.2026.106383 | Exact multi-unit CSU affiliation and official neuropsychiatric-disease direction. |
| E11 | 2026 | candidate | verified | 10.1016/j.ebiom.2026.106224 | Official email, exact multi-unit CSU affiliation and disease direction. |

## Candidate author identities and counterevidence

This inventory preserves every reasonable author cluster retained after broad discovery. `NOT_AVAILABLE`, `NOT_ACCESSED`, `NOT_EXTRACTED`, and `UNKNOWN` are intentional fail-closed values; no name-only database entity was treated as an identity authority.

| Candidate | Assessment | Source | Source author ID | Displayed name | Affiliation(s) | ORCID | Works count | Coauthors / network | Topics | Metadata URL | Why candidate | Why maybe wrong |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LJ-A1 | primary target cluster; no advisor ORCID selected | CSU E1 + PubMed/DOI E2-E6,E9-E11 | NOT_AVAILABLE (record-level sources) | Jinchen Li | Central South University multi-unit medical-genetics/bioinformatics affiliations | CONFLICT: no candidate selected | 8 retained in target/plausible cluster; source-entity total NOT_ACCESSED | Full list NOT_EXTRACTED; de novo-variant, neuropsychiatric-genetics and bioinformatics network recorded in E2-E11 | de novo variants; neurodevelopment; medical genetics; multi-omics | https://life.csu.edu.cn/info/1042/2483.htm | official representative list, exact official email, multi-unit CSU affiliations and coherent network | two incompatible publication ORCIDs prevent advisor-level selection |
| LJ-A2 | unresolved ORCID-side cluster | PubMed/DOI E7 and related reviewed records | NOT_AVAILABLE (record-level source) | Jinchen Li | relevant Central South University unit | 0000-0003-3335-9303 | 1 explicit unresolved row; source-entity total NOT_ACCESSED | NOT_EXTRACTED | de novo mutation pathogenicity prediction | https://doi.org/10.1093/bib/bbag428 | name, relevant unit and research topic fit | ORCID conflicts with LJ-A3; candidate ORCID must remain null |
| LJ-A3 | unresolved ORCID-side cluster | PubMed/DOI E8 and related reviewed records | NOT_AVAILABLE (record-level source) | Jinchen Li | relevant Central South University unit | 0000-0001-5522-806X | 1 explicit unresolved row; source-entity total NOT_ACCESSED | NOT_EXTRACTED | rare variants; autism genetics | https://doi.org/10.1038/s41380-026-03754-6 | name, relevant unit and research topic fit | ORCID conflicts with LJ-A2; candidate ORCID must remain null |

Broad retrieval produced 167 record hits before advisor-local triage. That hit count is not an author works count. 0 clearly different cluster(s) were rejected and 2 record(s) remain unresolved.

## FEATURED_CANDIDATE_SHORTLIST

This is not a featured decision. Owner selection remains pending.

- E2 — Prioritizing de novo potential non-canonical splicing variants in neurodevelopmental disorders. (2024, 10.1016/j.ebiom.2023.104928): official-list anchor; Owner should assess direction coverage, role and recency bias.
- E3 — VarCards2: an integrated genetic and clinical database for ACMG-AMP variant-interpretation guidelines in the human whole genome. (2024, 10.1093/nar/gkad1061): official-list anchor; Owner should assess direction coverage, role and recency bias.
- E4 — A metabolomic profile of biological aging in 250,341 individuals from the UK Biobank. (2024, 10.1038/s41467-024-52310-9): official-list anchor; Owner should assess direction coverage, role and recency bias.
- E5 — Gene4Denovo2: an updated platform for human de novo mutations discovery and interpretation. (2026, 10.1093/nar/gkaf980): official-list anchor; Owner should assess direction coverage, role and recency bias.
- E6 — Interactions between rare and common variant genetic risks in determining telomere length. (2026, 10.1016/j.scib.2025.10.028): official-list anchor; Owner should assess direction coverage, role and recency bias.

## Research enrichment boundary

- PUBLIC FACT: official E1 identity and original research direction.
- Publication-supported: titles, years, author positions, publication-time affiliation and per-paper identity decisions.
- AI SYNTHESIS: cross-paper questions, method grouping, workflow and possible undergraduate evidence-matrix task.
- No claim is made about current recruitment, lab atmosphere, mentoring style, active projects, efficacy or outcomes.

## Remaining uncertainty

- Publication records expose two incompatible ORCIDs (0000-0003-3335-9303 and 0000-0001-5522-806X); neither is selected.
- Corresponding-author status is null unless separately closed; author position does not substitute for it.
- v1.0.6 expressed all retained states; no schema extension was required.

## Owner decision

- Decision: `ACCEPT_WITH_NOTES` (publication content / featured selection only).
- Machine adopted set before writeback: E2, E3, E4, E5, E6.
- Owner final adopted set: E2, E3, E4, E5, E6, E9, E11.
- Owner promotions: E9, E11.
- Owner featured set: E2, E3, E5, E9, E11.
- Rejected retained: none.
- Unresolved retained: E7, E8.
- Verified candidates retained: E10.
- Advisor ORCID decision: `unresolved`; value `None`.
- Featured selection is an Owner choice, not a citation ranking or release approval.
- Global human identity review remains pending; final website visual review is still required.
- The two incompatible ORCID values remain visible and unresolved; neither is selected.
