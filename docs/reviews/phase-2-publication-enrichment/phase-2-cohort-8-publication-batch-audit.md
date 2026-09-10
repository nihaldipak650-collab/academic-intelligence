# Phase 2 Cohort 8 Publication Batch Audit

## Gate history

- Chen Shuhua Pilot: `INDEPENDENT_REVIEWER_PASS`.
- Pilot findings that changed execution discipline: OpenAlex same-name entity
  pollution/fragmentation, broad PubMed-query false positives, a caught local
  XPath DOI extraction error, and exact ORCID/affiliation source closure.
- The remaining seven were processed only after the Pilot pass, one advisor at
  a time with a fresh render and Validator run after each package write.

## Result matrix

| Advisor ID | Official profiles | Candidates | Adopted | Verified candidates | Rejected | Unresolved | ORCID | Validator | Release |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| chen-shuhua | 1 | 22 | 6 | 13 | 2 | 1 | verified | valid | false |
| deng-meichun | 1 | 10 | 5 | 5 | 0 | 0 | verified | valid | false |
| deng-suixin | 1 | 8 | 5 | 3 | 0 | 0 | verified | valid | false |
| duan-ranhui | 1 | 10 | 5 | 5 | 0 | 0 | verified | valid | false |
| fan-liangliang | 1 | 10 | 5 | 5 | 0 | 0 | unresolved | valid | false |
| guo-yi | 1 | 10 | 5 | 3 | 1 | 1 | verified | valid | false |
| jiang-hao | 1 | 10 | 4 | 1 | 3 | 2 | unresolved | valid | false |
| li-jinchen | 1 | 10 | 5 | 3 | 0 | 2 | unresolved | valid | false |
| **Total** | **8** | **90** | **40** | **38** | **6** | **6** | — | **8 valid** | **8 false** |

## Author identity basis by advisor

- Chen Shuhua: five official-list titles plus DOI/PubMed; E2/E7 exact ORCID
  chain; E8 official-email candidate; explicit Beijing/Foshan same-name
  negatives.
- Meichun Deng: official-list titles; current CSU department/email; MD Anderson
  historical affiliation; E8/E11 exact ORCID chain.
- Suixin Deng: official-list titles; current CSU email/affiliation; Fudan and
  Beijing Normal historical affiliations; multi-paper ORCID chain.
- Ranhui Duan: official-list titles; current CSU email/affiliation; E2/E3 exact
  ORCID; Drosophila and repeat-expansion network continuity.
- Liang-Liang Fan: official-list titles; first/last-author positions, CSU cell
  biology and official email; only one ORCID-bearing record, so advisor ORCID
  remains unresolved.
- Yi Guo: official-list titles; exact biomedical/medical-information unit and
  online-health network; E4/E5 exact ORCID; dermatology same-name record
  rejected.
- Hao Jiang: official-list tumor papers and exact biomedical-informatics unit;
  one ORCID/email record; three clear other-person clusters rejected. The Nano
  Research record and a mismatched-email record remain unresolved.
- Jinchen Li: official-list bioinformatics/genetics papers, multi-unit CSU
  affiliations and official email. Two incompatible ORCIDs occur across
  plausible records, so neither is selected.

## Deduplication and versions

- DOI values are unique across all 90 retained cohort records.
- No publication is multiplied merely because PubMed, Europe PMC, Crossref or
  an official profile also lists it.
- One formal/preprint relation was identified: Ranhui Duan's Eg5 UFMylation
  article uses formal DOI `10.1038/s41419-024-06934-w`; Research Square
  `10.21203/rs.3.rs-3754446/v1` is recorded only as a version relation and is
  not counted as another candidate.
- Cross-advisor DOI duplication: none.

## Source failures and limits

- Exa was unavailable in the environment.
- One Jina extraction of the Chen Shuhua official page returned no usable
  content; direct official access succeeded.
- OpenAlex author search exposed merged and fragmented entities; later work
  retrieval was rate-limited. It was not used as a single-point identity
  authority.
- A first PubMed XML extraction used an overly broad XPath and surfaced
  reference-list DOIs. Those values were discarded before package writing;
  article-local IDs and Crossref title checks replaced them.
- Current/future-indexed 2026 metadata was accepted only where the DOI and
  publication record were available on the task date; it does not imply
  release approval.

## Manual review queue

- 40 adopted publication decisions.
- 38 identity-verified candidate decisions not yet adopted.
- 6 rejected same-name records.
- 6 unresolved records.
- 39 shortlist entries; all remain non-featured until Owner action.
- Fan Liangliang and Hao Jiang advisor-level ORCID uncertainty.
- Jinchen Li two-ORCID conflict.
- Corresponding-author roles remain null unless independently closed.

## Contract and defect result

v1.0.6 accepted valid states and failed closed on unresolved/conflicting states.
No new contract-level or Validator-level bypass was found. One regression-test
fixture assumed Chen Shuhua would permanently remain a zero-publication package;
it was replaced with a synthetic zero-publication fixture. This was test
isolation repair, not a production-contract change.

Public production files, schemas, contract semantics, deployment workflow,
`frontend/public/`, and `site-src/` were not modified by this task.

## Final deterministic verification and web review

- Fresh package checks: all eight packages contain exactly five canonical
  files; all eight Validators return `valid=true`, `release_eligible=false`,
  `review_pending`, human review `pending`, and zero featured publications.
- Fresh Renderer equality and cross-package identity/DOI checks are covered by
  `tests/test_phase2_publication_enrichment.py` and passed for all eight.
- Full Python regression after the audit-inventory repair: 137 tests passed.
- Review UI regression: 17 tests passed across the DTO gate, latest-surface
  builder/routes, and the retained historical React technical artifact.
- Latest-surface builder check returned
  `READY_FOR_OWNER_PUBLICATION_WEB_REVIEW` for exactly eight advisors.
- Browser QA inspected the latest C01 directory, Chen Shuhua's 22/6 page, and
  Jinchen Li's 10/5 page. Non-zero counts, adopted-not-featured wording,
  unresolved counts, release closure, and advisor-level ORCID status were
  visible. Jinchen Li's two-ORCID conflict basis is surfaced in review mode.
- `git diff --check` passed. `git diff --quiet` returned zero for
  `frontend/public/`, `site-src/`, and deployment-related paths. The npm test
  pre-hook refreshed public artifact mtimes, but the content has no Git diff;
  no public or deploy content change remains.
- Local review URL: `http://127.0.0.1:43126/academic/`.

## Cohort independent review repair round

- First cohort reviewer verdict: `INDEPENDENT_REVIEWER_FAIL` (P1 audit
  reconstructability, not a publication-safety failure).
- Finding: the seven post-Pilot audits summarized the primary name/affiliation
  cluster but did not enumerate candidate-author source IDs, affiliations,
  ORCID, works-count status, network/topics, metadata URL, supporting reasons,
  and counterevidence in a reconstructable table.
- Repair: each of the seven audits now includes a candidate-author inventory.
  Record-level sources that expose no stable author-entity ID or trustworthy
  total-work count are explicitly marked `NOT_AVAILABLE` / `NOT_ACCESSED`;
  coauthor lists not retained during discovery are marked `NOT_EXTRACTED`.
  Same-name, affiliation, email, and two-ORCID conflict clusters remain
  separate rather than being collapsed into the target identity.
- Regression lock: a new test requires every post-Pilot audit to retain all
  inventory columns and requires the known Guo Yi, Hao Jiang, and Jinchen Li
  alternate clusters to remain present.
- Post-repair full Python regression: 137 tests passed.
- Second fresh reviewer verdict: `INDEPENDENT_REVIEWER_PASS`. It confirmed
  the seven repaired inventories, all 40 adopted identity closures, ledger
  closure (90 = 40 adopted + 38 verified candidates + 6 rejected + 6
  unresolved), DOI and cross-advisor isolation, fail-closed ORCID states,
  featured/human/release gates, Renderer equality, and latest-surface status.
  No P0/P1 publication-safety defect remains.

## Owner publication decision writeback — 2026-09-10

- The exact Owner decision artifact is preserved in
  `OWNER_PUBLICATION_DECISIONS_2026-09-10.json` and its human-readable mirror.
- Final ledger closure is `90 = 54 adopted + 24 verified candidates + 6
  rejected + 6 unresolved`; 14 previously verified candidates were promoted.
- Exact Owner featured selection totals 39 publications: four for Chen Shuhua
  and five for each of the other seven advisors.
- Featured selection is recorded as Owner-reviewed publication content only.
  Advisor identity human review remains `pending`, every package remains
  `publication_status=review_pending`, and every Validator remains
  `release_eligible=false`.
- Guo Yi E7, Hao Jiang E5/E11, and Jinchen Li E7/E8 remain unresolved. Guo Yi
  E11 and Hao Jiang E8/E9/E10 remain rejected. No unresolved or rejected row
  was promoted or featured.
- Fan Liangliang and Hao Jiang retain unresolved single-record ORCID states;
  Jinchen Li retains both conflicting ORCID records with no candidate selected.
- The isolated latest-surface review adapter displays Owner-selected featured
  papers separately from other adopted evidence and does not weaken public
  production gates.
- Historical pre-Owner builders now fail closed when the Owner decision artifact
  exists, preventing accidental regression to the pre-decision package state.
- Final deterministic verification: 139 Python tests and 107 frontend tests
  passed; the latest-surface builder check returned
  `OWNER_PUBLICATION_DECISIONS_APPLIED_READY_FOR_FINAL_WEB_REVIEW`.
- `git diff --check` passed. Content-level `git diff --quiet` returned zero for
  `frontend/public/`, `site-src/`, and `.github`/`site-builder`.
- Final browser QA used a cache-busted 43126 review URL and confirmed the exact
  eight-card directory plus Fan Liangliang, Guo Yi, Hao Jiang, and Jinchen Li
  detail pages. Each page shows the exact Owner featured IDs, `LOCAL REVIEW
  ONLY`, `review_pending`, `release_eligible=false`, and the advisor-specific
  unresolved/rejected/ORCID limitations. Hao Jiang explicitly warns that the
  adopted evidence does not support a tumor-nerve publication trajectory.
- Fresh final reviewer verdict: `INDEPENDENT_REVIEWER_PASS`; P0/P1 findings:
  none. The reviewer independently reproduced the exact eight Owner
  partitions, all 14 promotion identity prerequisites, all 39 featured choices,
  ledger closure, fail-closed ORCID/exception states, package release gates,
  latest-site status, historical-builder guards, tests, and protected-path
  content checks.
