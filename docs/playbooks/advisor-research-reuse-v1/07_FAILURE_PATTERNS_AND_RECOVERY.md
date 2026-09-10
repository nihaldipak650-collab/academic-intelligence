# Failure Patterns and Recovery

| Failure | Detection | Recovery |
| --- | --- | --- |
| Official-profile-only package looks complete | search state absent or zero candidates without explicit wording | mark `SEARCH_NOT_RUN`; run enrichment or render incompleteness |
| OpenAlex merge/fragment trusted | identity rests on author entity alone | retain clusters; verify article records |
| PubMed same-name false positive | name/university only | inspect author-level unit, email, ORCID, topic, network |
| Reference DOI captured | DOI title mismatches article title | use article-local ID block and independent title check |
| Single ORCID auto-promoted | only one clean ORCID-bearing paper | keep advisor ORCID unresolved |
| Conflicting ORCIDs simplified | one value disappears without evidence | retain both; candidate ORCID null |
| Official title treated as full identity | author-level metadata does not close | keep unresolved; targeted follow-up |
| Topic fit treated as identity | reasoning says “perfect fit” | require identity evidence; Guo Yi E7 is the warning |
| Historical affiliation rejected | paper predates current job | verify timeline and historical institution |
| Preprint/formal double counted | title/version group duplicates | canonical formal record plus version relation |
| Shortlist auto-featured | featured mirrors first/newest list | require explicit Owner decision |
| Generic lab task invented | no task-specific source | use uncertainty wording and ask the advisor |
| Old builder overwrites decisions | post-Owner counts regress | make old builders fail closed; verify decision hash |

If the schema cannot express the true state, stop and report a minimal defect. Never “repair” evidence by upgrading uncertainty.
