# Proposed Public Diff — Phase 2 Cohort 8

This is an authorization-stage path diff, not an executed production write.

## Expected production effect

- Introduce exactly eight advisor records/pages: Chen Shuhua, Deng Meichun, Deng Suixin, Duan Ranhui, Fan Liangliang, Guo Yi, Jiang Hao, and Jinchen Li.
- Preserve the existing 12 public advisor records and package bytes, including Hu Zhengmao.
- Keep the existing `guo-hui` review-only directory record outside the public DTO.
- Increase projected public advisor count from 12 to 20.
- Add 24 public package artifacts: three files for each new advisor.
- Update directory data and public DTO membership.
- Update T02 data/template presentation only as needed for v1.0.6 featured ordering, publication-year fallback, evidence-lane wording, and safe handling of unresolved/excluded records.
- Do not change navigation architecture or deploy workflow.

## Exact path classes

See `PROPOSED_PUBLIC_FILES.csv`. It lists 29 expected production paths: 5 modifications and 24 additions. No removals are expected.

The five expected modifications are:

1. `site-src/academic/directory/assets/data.js`
2. `site-src/academic/profile/data/public-dto.json`
3. `site-src/t02-src/data.js`
4. `site-src/t02-src/template.js`
5. `site-src/t02-src/template.css`

The isolated preview also has a preview-only `app.js` gate adapter and banner. Those bytes are not proposed production bytes and must not be copied into `site-src`.

## Important activation boundary

The frozen packages remain `publication_status=review_pending` and `release_eligible=false`. This task does not authorize changing those values. Therefore the final release operation must first receive explicit Owner authorization and then perform a separately reviewed release-eligibility projection. Until then, the current production fail-closed gate correctly refuses these packages.

The path set is exact; the final activation bytes are intentionally not manufactured in advance. Any final authorized diff outside the 29 listed paths is a blocker and requires a new review.

## Risk-state preservation

- Chen Shuhua: E21/E22 excluded; E23 unresolved.
- Guo Yi: E7 unresolved; E11 excluded.
- Jiang Hao: E5/E11 unresolved; E8/E9/E10 excluded; advisor ORCID unresolved; no tumor–nerve publication trajectory claim.
- Jinchen Li: E7/E8 unresolved; conflicting ORCIDs remain unresolved; no advisor ORCID selected.
- Fan Liangliang: single-record ORCID remains advisor-level unresolved.
- No unresolved or excluded paper is adopted or featured.

## Unchanged surfaces

- Existing 12 public advisor package bytes.
- Hu Zhengmao profile/package.
- General site navigation and non-advisor public content.
- `frontend/public/` in this worktree.
- Deploy workflow.
