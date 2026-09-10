import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  FORBIDDEN_PUBLICATION_WORDING,
  PHASE2_DTO_VERSION,
  PUBLICATION_NOTICE,
  assertNoCrossAdvisorPollution,
  buildPhase2LocalReviewDto,
  defaultPhase2ReviewPaths,
  evaluatePhase2PackageGate,
  loadPhase2Package,
  loadPhase2Cohort,
  writePhase2LocalReviewDto,
} from "./local-review-phase2-advisor-dto.mjs";

const EXPECTED_IDS = [
  "chen-shuhua",
  "deng-meichun",
  "deng-suixin",
  "duan-ranhui",
  "fan-liangliang",
  "guo-yi",
  "jiang-hao",
  "li-jinchen",
];

const temporaryRoots = [];
afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function validLoaded(advisorId = "chen-shuhua") {
  return loadPhase2Package(path.join(defaultPhase2ReviewPaths.sourceRoot, advisorId), advisorId);
}

describe("Phase 2 v1.0.6 review-only adapter gate", () => {
  it("maps exactly the configured eight packages", async () => {
    const result = await buildPhase2LocalReviewDto();
    expect(result.envelope.dtoVersion).toBe(PHASE2_DTO_VERSION);
    expect(result.envelope.publicReleaseApproved).toBe(false);
    expect(result.envelope.advisorCount).toBe(8);
    expect(result.envelope.advisors.map((advisor) => advisor.id)).toEqual(EXPECTED_IDS);
    expect(new Set(result.envelope.advisors.map((advisor) => advisor.id)).size).toBe(8);
    expect(result.reports).toHaveLength(8);
  });

  it("rejects a sorted eight-person cohort if any target ID is substituted", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "phase2-review-cohort-"));
    temporaryRoots.push(root);
    const cohortFile = path.join(root, "cohort.json");
    const substituted = {
      scope: "local_review_only",
      review_id: "phase2-cohort-8-v106",
      cohort_date: "2026-09-09",
      schema_version: "1.0.6",
      public_release_approved: false,
      advisor_ids: [...EXPECTED_IDS.slice(0, 7), "z-extra-advisor"],
    };
    await writeFile(cohortFile, JSON.stringify(substituted), "utf8");
    await expect(loadPhase2Cohort(cohortFile)).rejects.toThrow("PHASE2_COHORT_EXACT_IDS_REQUIRED");
  });

  it("fails closed on wrong schema", async () => {
    const loaded = await validLoaded();
    loaded.publicAdvisor.value.schema_version = "1.0.5";
    expect(evaluatePhase2PackageGate("chen-shuhua", loaded).reasons).toContain("public_advisor_schema_not_1.0.6");
  });

  it("fails closed on verified identity with zero adopted publications", async () => {
    const loaded = await validLoaded();
    loaded.publicAdvisor.value.publication_identity_status = "verified";
    loaded.validation.value.adopted_publication_evidence_count = 0;
    const gate = evaluatePhase2PackageGate("chen-shuhua", loaded);
    expect(gate.allowed).toBe(false);
    expect(gate.reasons).toContain("verified_with_zero_adopted_publications");
  });

  it("fails closed on release eligibility true", async () => {
    const loaded = await validLoaded();
    loaded.validation.value.release_eligible = true;
    expect(evaluatePhase2PackageGate("chen-shuhua", loaded).reasons).toContain("validation_release_eligible_not_false");
  });

  it("fails closed on advisor id mismatch", async () => {
    const loaded = await validLoaded();
    loaded.identity.value.advisor_id = "another-advisor";
    expect(evaluatePhase2PackageGate("chen-shuhua", loaded).reasons).toContain("identity_advisor_id_mismatch");
  });

  it("fails closed when any of the five package files is missing", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "phase2-review-missing-"));
    temporaryRoots.push(root);
    const advisorDir = path.join(root, "chen-shuhua");
    await cp(path.join(defaultPhase2ReviewPaths.sourceRoot, "chen-shuhua"), advisorDir, { recursive: true });
    await rm(path.join(advisorDir, "public-advisor-v1.md"));
    const loaded = await loadPhase2Package(advisorDir, "chen-shuhua");
    expect(evaluatePhase2PackageGate("chen-shuhua", loaded).reasons).toContain("public-advisor-v1.md_missing");
  });

  it("rejects Evidence source URL or record reuse across advisors", async () => {
    const firstLoaded = await validLoaded("chen-shuhua");
    const secondLoaded = await validLoaded("deng-meichun");
    const firstGate = evaluatePhase2PackageGate("chen-shuhua", firstLoaded);
    const secondGate = evaluatePhase2PackageGate("deng-meichun", secondLoaded);
    secondGate.manifest.candidate_evidence[0].source_url =
      firstGate.manifest.candidate_evidence[0].source_url;
    expect(() => assertNoCrossAdvisorPollution([
      { advisorId: "chen-shuhua", gate: firstGate },
      { advisorId: "deng-meichun", gate: secondGate },
    ])).toThrow(/CROSS_ADVISOR_EVIDENCE_(URL|RECORD)_POLLUTION/);
  });
});

describe("Phase 2 isolated output", () => {
  it("writes eight enriched reports with Owner featured decisions and release gate closed", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "phase2-review-output-"));
    temporaryRoots.push(root);
    const outputFile = path.join(root, "public", "data", "advisors.json");
    const reportRoot = path.join(root, "public", "reports");
    const result = await writePhase2LocalReviewDto({ outputFile, reportRoot });
    const reportNames = (await readdir(reportRoot)).sort();
    expect(result.envelope.advisorCount).toBe(8);
    expect(reportNames).toEqual(EXPECTED_IDS.map((id) => `${id}.md`));
    for (const name of reportNames) {
      const report = await readFile(path.join(reportRoot, name), "utf8");
      expect(report).toContain(PUBLICATION_NOTICE);
      for (const wording of FORBIDDEN_PUBLICATION_WORDING) {
        expect(report.toLowerCase()).not.toContain(wording.toLowerCase());
      }
    }
    const envelope = JSON.parse(await readFile(outputFile, "utf8"));
    for (const advisor of envelope.advisors) {
      expect(advisor.releaseEligible).toBe(false);
      expect(advisor.publicationStatus).toBe("review_pending");
      expect(["verified", "partially_verified", "pending_verification"]).toContain(advisor.publicationIdentityStatus);
      expect(advisor.publicationSearchStatus).toBe("complete");
      expect(advisor.publicationCandidateCount).toBeGreaterThan(0);
      expect(advisor.adoptedPublicationCount).toBeGreaterThan(0);
      expect(advisor.ownerFeaturedPublicationCount).toBeGreaterThan(0);
      expect(advisor.ownerFeaturedPublicationIds).toHaveLength(advisor.ownerFeaturedPublicationCount);
    }
  });
});
