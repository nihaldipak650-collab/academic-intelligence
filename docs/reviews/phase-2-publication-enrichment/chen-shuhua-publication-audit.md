# Chen Shuhua Publication Enrichment Pilot Audit

## Executive result

The Pilot discovered 22 publication candidates. Six have been adopted as
identity-verified Evidence, thirteen are identity-verified but remain only
candidates, two are rejected same-name records, and one remains unresolved.
The package passes the current v1.0.6 Validator while remaining
`review_pending`, human-review pending, featured-selection pending, and
`release_eligible=false`.

This is not an Owner approval or release decision.

## A. Identity seed

| Field | Seed |
| --- | --- |
| Chinese name | 陈淑华 |
| English-name variants | Shuhua Chen; Shu-Hua Chen; Shu-hua Chen |
| Institution | Central South University |
| Unit | School of Life Sciences, Department of Biochemistry / Biochemistry and Molecular Biology |
| Position / role | Professor; master's supervisor |
| Official email | shuhuachen@csu.edu.cn |
| Candidate ORCID | 0000-0003-2373-3402 |
| Official direction | Inflammation and vascular-disease mechanisms; cell biology; biochemistry and molecular biology; bioinformatics; clinical medicine |
| Official profile | https://life.csu.edu.cn/info/1042/2536.htm |

The seed was used for retrieval only. It was not treated as a publication
identity conclusion.

## B. Candidate author identities

Eight reasonable OpenAlex name candidates were retained during discovery:

| Candidate | Assessment | Why it may be right | Why it may be wrong |
| --- | --- | --- | --- |
| A5049887337 / ORCID 0000-0003-2373-3402 | Most likely target entity | Exact ORCID and CSU affiliation | Only two works; incomplete fragment |
| A5101886751 / ORCID 0000-0002-9178-5020 | Rejected as authority | Name match | 285 works, unrelated institutions and ORCID; polluted merge |
| A5071349910 / ORCID 0000-0001-5929-1074 | Other person | Name variant | Mackay/UC affiliation and unrelated network |
| A5100561776 | Ambiguous mixed entity | Name and some plausible topics | Multiple unrelated institutions; likely merged |
| A5132699813 | Fragment candidate | Name/CSU clue | One-work fragment, no ORCID |
| A5135724467 | Fragment candidate | Name/CSU clue | Four-work fragment, no ORCID |
| A5134809246 | Fragment candidate | Name/CSU clue | Two-work fragment, no ORCID |
| A5125652357 | Fragment candidate | Name/CSU clue | One-work fragment, no ORCID |

A further zero/near-zero-work fragment appeared during discovery but provided
no usable identity evidence. OpenAlex work retrieval subsequently returned rate
limits. No OpenAlex author entity was used alone to grant `verified`.

## C. Candidate publications

The broad PubMed query `Shuhua Chen[Author] AND Central South
University[Affiliation]` returned 43 records. The Pilot retained 22 auditable
records spanning positive, negative, and unresolved outcomes. Each DOI-bearing
record was checked against its own PubMed ArticleId and then resolved through
Crossref; all 21 DOI/title pairs matched. E23 has no DOI in the reviewed record
and uses its PubMed landing page as the canonical source.

The machine-readable row set, including rejected and unresolved rows, is in
`publication_identity_ledger.csv`.

## D. Identity verification evidence

The adopted identity chain does not rely on name or topic alone:

- E2-E6 are explicitly listed on the official CSU profile as representative
  publications, then closed to DOI and PubMed author metadata.
- E2 and E7 independently carry ORCID `0000-0003-2373-3402` for
  Shuhua/Shu-Hua Chen and record the current CSU School of Life Sciences
  affiliation.
- E8 carries the exact official email `shuhuachen@csu.edu.cn`; it remains a
  candidate rather than being adopted.
- E9-E20 combine the exact current department with a coherent longitudinal
  topic/coauthor network. They are identity-verified candidates but were not
  adopted merely to increase counts.

Author position and corresponding-author status are distinct. Position was
recorded from the author list. `is_corresponding` remains null because the Pilot
did not close that role consistently for every paper.

## E. Rejected and ambiguous papers

| Evidence | Decision | Reason |
| --- | --- | --- |
| E21, 10.1212/wnl.0000000000214260 | rejected / conflict | Same-name author is at Beijing Children's Hospital / Capital Medical University in neurology, with a different field and network. |
| E22, 10.1038/s12276-020-0428-7 | rejected / conflict | Same-name author is in otolaryngology at the Second People's Hospital of Foshan. |
| E23, PMID 16951497 | unresolved / identity_pending | Cardiovascular topic and record-level CSU context are plausible, but target-author affiliation, email and ORCID do not close. |

No rejected or unresolved record is adopted or used in public synthesis.

## F. Adopted publications

| Evidence | Year | DOI | Adoption basis |
| --- | ---: | --- | --- |
| E2 | 2022 | 10.1111/jcmm.17356 | Official representative list + DOI/PubMed + ORCID/current affiliation |
| E3 | 2022 | 10.1177/14791641221102513 | Official representative list + DOI/PubMed/current affiliation |
| E4 | 2019 | 10.1111/jcmm.13975 | Official representative list + DOI/PubMed/current/historical CSU units |
| E5 | 2019 | 10.1186/s12882-019-1323-0 | Official representative list + DOI/PubMed/current/historical CSU units |
| E6 | 2017 | 10.1189/jlb.3a0716-333r | Official representative list + DOI/PubMed + CSU/Pittsburgh career context |
| E7 | 2026 | 10.1142/s0192415x26500229 | Exact ORCID + current CSU unit + topic/coauthor continuity |

Candidate does not mean adopted, adopted does not mean featured, and neither
means released.

## G. ORCID status

Advisor-level ORCID is mechanically `verified` under v1.0.6 using E2 and E7:
both publication records carry the same candidate ORCID, both identities are
verified, and the chain closes to the current institution. The public ORCID
record exposed a name but did not expose a complete public work/employment list
during this run, so it was not used as a single-source conclusion.

Human identity review remains pending.

## H. FEATURED_CANDIDATE_SHORTLIST

This is an Owner shortlist, not a final featured selection.

| Evidence | Category | Why shortlisted | Possible bias |
| --- | --- | --- | --- |
| E2 | direction / review | Summarizes EndMT in diabetic kidney disease and carries ORCID | Review paper may overrepresent one direction |
| E3 | mechanism / method | Connects glucolipotoxicity, autophagy flow and endothelial dysfunction | Large author list; contribution role needs Owner judgment |
| E4 | method / mechanism | Mitochondrial fission and endothelial dysfunction | 2019 work may not represent current priorities |
| E6 | classic / inflammation | First-author trauma/hemorrhagic-shock inflammation study | Historical international-career context differs from current lab focus |
| E7 | recent / direction | Recent PACS2/ferroptosis vascular work with exact ORCID | Recentness does not itself establish representativeness |

`featured_publication_evidence_ids` remains empty and
`featured_selection_status=pending_manual_review`.

## I. Research enrichment delta

### PUBLIC FACT

- Official identity, position, supervisor role, email, and original research
  direction come from E1.
- Publication titles, years, author positions, publication-time affiliations,
  DOI identities and per-paper adoption states come from E2-E23 as recorded.

### Publication-supported facts

- The adopted set directly covers EndMT, endothelial dysfunction, autophagy,
  mitochondrial fission, S1PR2/ROCK1, trauma-associated inflammation and
  PACS2/ferroptosis.
- It does not prove that every topic is an active current project.

### AI SYNTHESIS

- The cross-paper research questions, method grouping, workflow description,
  and possible undergraduate evidence-matrix task are conditional syntheses.
- They are not claims about current recruitment, assigned student work,
  teaching style, laboratory atmosphere, efficacy or outcomes.

## J. Remaining uncertainties and Pilot risks

1. OpenAlex contains both polluted merges and fragmented author entities for
   this name; database entity assignment is unsafe as a standalone identity
   signal.
2. Broad PubMed affiliation search includes same-name people at other
   institutions; record-level affiliation must be inspected.
3. ORCID's public record was sparse in this run; the ORCID conclusion depends
   on two publication records, not a complete ORCID profile.
4. E23 remains unresolved because historical author-level identity does not
   close.
5. Corresponding-author roles remain null unless directly closed.
6. A first-pass XML script initially selected DOI values from cited references
   via an overly broad XPath. No such value entered the package; the parser was
   corrected to each article's own `PubmedData/ArticleIdList`, and all retained
   DOI/title pairs were independently rechecked in Crossref.
7. OpenAlex works retrieval was rate-limited. Exa was unavailable in the
   environment, and a Jina extraction attempt returned no usable page content.
   These sources are recorded as `ACCESS_FAILED`, not silently treated as
   accessed.

## K. Contract sufficiency

v1.0.6 is sufficient for this Pilot. It can retain adopted, candidate,
excluded, identity-pending, verified, conflict and unresolved states; it also
keeps featured selection and release gates separate. No schema or Validator
change was needed.

The exact author-entity candidate inventory and featured shortlist live in this
audit because the current package schemas intentionally model publication
Evidence and identity decisions rather than arbitrary discovery-provider
entities. No ambiguity was discarded.

## Owner decision

- Decision: `ACCEPT_WITH_NOTES` (publication content / featured selection only).
- Machine adopted set before writeback: E2, E3, E4, E5, E6, E7.
- Owner final adopted set: E2, E3, E4, E5, E6, E7.
- Owner promotions: none.
- Owner featured set: E2, E3, E5, E7.
- Rejected retained: E21, E22.
- Unresolved retained: E23.
- Verified candidates retained: E8, E9, E10, E11, E12, E13, E14, E15, E16, E17, E18, E19, E20.
- Advisor ORCID decision: `verified`; value `0000-0003-2373-3402`.
- Featured selection is an Owner choice, not a citation ranking or release approval.
- Global human identity review remains pending; final website visual review is still required.
