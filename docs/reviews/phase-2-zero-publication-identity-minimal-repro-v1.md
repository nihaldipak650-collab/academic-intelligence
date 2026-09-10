# Phase 2 Minimal Repro — Zero-publication identity semantic defect

## Status

`COMMON_LAYER_DEFECT_CONFIRMED_COHORT_STOPPED`

## Minimal input state

Use any v1.0.5 package with:

- one adopted `official_profile` Evidence record (`E1`);
- zero `publication` Evidence records;
- `adopted_public_evidence_ids=["E1"]`;
- `identity-review-v1.json.publication_identity=[]`;
- advisor ORCID `unresolved` and candidate ORCID `null`;
- `publication_identity_status="verified"`.

Concrete fixture: `data/advisors-v1/chen-shuhua/`.

## Actual behavior

1. Fresh Validator returns `valid=true`, with no error for the zero-publication/`verified` combination.
2. Fresh Renderer outputs “导师论文归属：已核验”.
3. The same Markdown states that a complete candidate-evidence set is preserved internally, although the manifest has zero publication candidates and only E1 official-profile Evidence.

## Expected fail-closed behavior

- Zero adopted/candidate publication Evidence must not be presented as a positive verification of advisor publication identity.
- The public representation should say “无已采用论文证据” or “论文身份未核验”, while keeping release ineligible.
- Renderer text must not claim that a complete publication-candidate evidence set exists when the manifest contains none.
- Contract, schema/Validator state rules, display mapping and Renderer must agree on one explicit zero-publication state.

## Suggested regression assertions

1. A zero-publication fixture cannot render “论文归属：已核验”.
2. A zero-publication fixture cannot render “完整候选证据已保存”.
3. Validator either rejects `publication_identity_status=verified` for zero publications or the contract introduces an explicit `not_assessed`/`no_publication_evidence` state that Renderer maps conservatively.
4. Existing v1.0.4 and v1.0.5 publication-bearing fixtures remain unchanged.

## Scope boundary

No common-layer code, contract, schema, mapping or test was modified after this defect was found. The cohort stopped immediately; no push, merge, rebase, deploy or publication occurred.
