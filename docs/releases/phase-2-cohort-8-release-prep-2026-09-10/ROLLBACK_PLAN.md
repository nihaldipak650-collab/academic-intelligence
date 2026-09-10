# Rollback Plan — Phase 2 Cohort 8

Do not execute this plan during release preparation.

## Anchors

- Locally known pre-release deployed/source baseline: `fed26decc26a709379b0f087be8d68c1b50f2642` (`Publish Hu Zhengmao advisor profile`).
- Local release-candidate commit: resolve as the commit containing this file; record its SHA in the release authorization record before any remote action.
- Frozen source snapshot and Owner decisions must remain retained even if public deployment is rolled back.

Before an authorized deployment, verify the actual remote/deployed commit again. The local `origin/main` ref was not fetched during preparation and may be stale.

## Expected public change set

The only allowed production paths are the 29 rows in `PROPOSED_PUBLIC_FILES.csv`: directory data, public DTO, three T02 presentation files, and three package artifacts for each of eight advisors. There are no expected removals.

## Restore procedure after a deployment problem

1. Stop further deploy attempts and record the failing deployed commit and observed symptom.
2. Preserve logs, the freeze snapshot, Owner decisions, reuse pack, and all unresolved/excluded evidence records.
3. Create a normal Git revert of the authorized release commit; do not rewrite history and do not force-push.
4. Review the revert diff. It must restore the pre-release public tree and must not remove source/audit/freeze materials.
5. Run the full Python and frontend suites, public-content scan, site build in an isolated output, and the freeze checker.
6. Only after separate authorization, push the revert and redeploy the restored public tree.
7. Confirm the public directory returns to the prior 12 public advisors and Hu Zhengmao remains available.

Example command to prepare, but not execute blindly:

```powershell
git revert <AUTHORIZED_RELEASE_COMMIT_SHA>
```

If deployment copies generated files outside Git, restore only the 29 allowlisted paths from the verified pre-release deployed commit, then rebuild through the normal workflow. Never delete or overwrite the frozen source packages, freeze manifest, Owner decisions, publication ledger, or reuse pack.
