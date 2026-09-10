# Advisor Production v1.0.7 Review

## Task contract

Goal: replace the v1.0.6 all-ORCID release blocker with a narrow optional-identifier policy, represent the Owner's actual scoped review truthfully, and generate an isolated 29-path Cohort 8 production projection.

Acceptance: v1.0.5/v1.0.6 remain byte-unchanged; all adopted/featured publication identity gates remain strict; canonical Cohort 8 v1.0.6 freeze remains 73/73; v1.0.7 makes only independently closed packages eligible; unresolved ORCIDs never appear as canonical public identifiers; tests and independent review pass; no push or deploy.

Checkpoint: branch `release/phase-2-cohort-8-2026-09-10`, integrated RC `5d0059b1245fca4d4ab6685bfe60751f52bedb5e`; production `site-src/` remains untouched. Generated projection is ignored under `frontend/.release-projection-phase2-cohort8-v107/`.

Authority order: current task → scoped Owner review artifact → Owner publication decisions → frozen package/evidence state → v1.0.7 contract → implementation/tests.

Read next:

1. `V106_BLOCKER_ANALYSIS.md`
2. `V107_SEMANTIC_DELTA.md`
3. `RELEASE_ELIGIBILITY_TRUTH_TABLE.md`
4. `ORCID_OPTIONAL_IDENTIFIER_POLICY.md`
5. `OWNER_SCOPED_REVIEW_POLICY.md`
6. `V107_TEST_REPORT.md`
7. `V107_INDEPENDENT_REVIEW.md`

This work authorizes neither remote push nor deployment.
