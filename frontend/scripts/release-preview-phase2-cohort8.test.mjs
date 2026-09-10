import { readFile } from "node:fs/promises";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  EXISTING_PUBLIC_IDS,
  EXPECTED_TOTALS,
  RELEASE_PREVIEW_ROOT,
  buildReleasePreview,
  verifyReleasePreview,
} from "./release-preview-phase2-cohort8.mjs";
import { PHASE2_ADVISOR_IDS } from "./local-review-phase2-advisor-dto.mjs";

describe("Phase 2 cohort 8 isolated release preview", () => {
  beforeAll(async () => {
    await buildReleasePreview();
  }, 30000);

  it("contains the current 12 plus exactly the proposed 8", async () => {
    const result = await verifyReleasePreview();
    expect(result.current_public_advisor_ids).toEqual(EXISTING_PUBLIC_IDS);
    expect(result.proposed_added_advisor_ids).toEqual(PHASE2_ADVISOR_IDS);
    expect(result.projected_public_count).toBe(20);
  });

  it("preserves exact frozen cohort totals", async () => {
    const result = await verifyReleasePreview();
    expect(result.cohort_totals).toEqual(EXPECTED_TOTALS);
  });

  it("keeps canonical release authorization false", async () => {
    const result = await verifyReleasePreview();
    expect(result.public_release_authorized).toBe(false);
    expect(result.canonical_package_state).toEqual({ publication_status: "review_pending", release_eligible: false });
  });

  it("uses a release-candidate label rather than claiming a live release", async () => {
    const template = await readFile(path.join(RELEASE_PREVIEW_ROOT, "academic", "profile", "template.js"), "utf8");
    expect(template).toContain("RELEASE CANDIDATE PREVIEW");
    expect(template).not.toContain("LOCAL REVIEW ONLY");
  });
});
