import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  REVIEW_PENDING_IDS,
  buildLocalReviewDto,
  defaultReviewPaths,
  validateLocalReviewDto,
  writeLocalReviewDto,
} from "./local-review-advisor-dto.mjs";

const expectedIds = [
  "chen-miao",
  "guo-hui",
  "hu-dehua",
  "hu-zhengmao",
  "li-faxiang",
  "li-jiada",
  "li-xing",
  "liu-jing",
  "su-haomiao",
  "tan-jieqiong",
  "wang-shixiang",
  "xiang-rong",
  "zhao-yuetao",
];

const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function tempCohortFile(cohort) {
  const root = await mkdtemp(path.join(os.tmpdir(), "advisor-review-cohort-"));
  temporaryRoots.push(root);
  const cohortFile = path.join(root, "cohort.json");
  await writeFile(cohortFile, JSON.stringify(cohort));
  return cohortFile;
}

describe("local review advisor DTO (13 advisor cohort)", () => {
  it("exports exactly the 13 whitelisted advisors with no duplicates", async () => {
    const result = await buildLocalReviewDto();
    expect(result.envelope.advisorCount).toBe(13);
    expect(result.envelope.advisors.map((advisor) => advisor.id)).toEqual(expectedIds);
    expect(new Set(result.envelope.advisors.map((advisor) => advisor.id)).size).toBe(13);
  });

  it("output advisor id set exactly matches the cohort config set", async () => {
    const result = await buildLocalReviewDto();
    const configIds = new Set(result.cohort.advisor_ids);
    const outputIds = new Set(result.envelope.advisors.map((advisor) => advisor.id));
    expect(outputIds).toEqual(configIds);
    expect(configIds.size).toBe(13);
  });

  it("marks the envelope as an unapproved local-only review scope", async () => {
    const result = await buildLocalReviewDto();
    expect(result.cohort.cohort_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.envelope).toMatchObject({
      schemaVersion: 1,
      dtoVersion: "1.0.4",
      source: "local-review-advisor-contract",
      scope: "local_review_only",
      publicReleaseApproved: false,
      cohortDate: result.cohort.cohort_date,
      advisorCount: 13,
    });
  });

  it("applies the approved gate to 11 advisors and the review_pending gate to guo-hui/hu-zhengmao", async () => {
    const result = await buildLocalReviewDto();
    const pendingIds = new Set(REVIEW_PENDING_IDS);
    expect(pendingIds.size).toBe(2);

    const approved = result.envelope.advisors.filter((advisor) => !pendingIds.has(advisor.id));
    expect(approved).toHaveLength(11);
    approved.forEach((advisor) => {
      expect(advisor.releaseEligible).toBe(true);
      expect(["approved", "published"]).toContain(advisor.publicationStatus);
      expect(advisor.dataStatusNote).toBeUndefined();
    });

    const pending = result.envelope.advisors.filter((advisor) => pendingIds.has(advisor.id));
    expect(pending).toHaveLength(2);
    pending.forEach((advisor) => {
      expect(advisor.releaseEligible).toBe(false);
      expect(advisor.publicationStatus).toBe("review_pending");
      expect(advisor.dataStatusNote).toBe("待项目负责人人工审核，仅用于本地预览，未经公开批准。");
    });
  });

  it("produces a report for every one of the 13 cohort advisors and no others", async () => {
    const result = await buildLocalReviewDto();
    const reportNames = result.reports.map((report) => report.name).sort();
    expect(reportNames).toEqual(expectedIds.map((id) => `${id}.md`).sort());
    result.reports.forEach((report) => {
      expect(report.content.length).toBeGreaterThan(0);
    });
  });

  it("never includes out-of-whitelist advisors even if the source root has more directories", async () => {
    const result = await buildLocalReviewDto();
    result.envelope.advisors.forEach((advisor) => {
      expect(expectedIds).toContain(advisor.id);
    });
  });

  it("never emits experience-track fields or identity-only material", async () => {
    const result = await buildLocalReviewDto();
    result.envelope.advisors.forEach((advisor) => {
      expect(advisor.hasExperienceEvidence).toBe(false);
      expect(advisor.experienceCaseCount).toBe(0);
      expect(advisor.evidenceType).toBe("academic_only");
    });
    const serialized = JSON.stringify(result.envelope);
    ["experience_case", "orcid", "identity-review", "contact", "repository_source_ref", "C:\\\\Users\\\\", "/Users/"].forEach((marker) => {
      expect(serialized).not.toContain(marker);
    });
    expect(serialized).not.toMatch(/"hasExperienceEvidence"\s*:\s*true/);
    expect(serialized).not.toMatch(new RegExp('"experienceCaseCount"\\s*:\\s*[1-9]'));
  });

  it("rejects a cohort file whose size is not exactly 13", async () => {
    const cohortFile = await tempCohortFile({
      scope: "local_review_only",
      public_release_approved: false,
      cohort_date: "2026-08-04",
      advisor_ids: expectedIds.slice(0, 12),
    });
    await expect(buildLocalReviewDto({ cohortFile })).rejects.toThrow(/REVIEW_COHORT_SIZE_MUST_BE_13/);
  });

  it("rejects a cohort file with duplicate ids", async () => {
    const cohortFile = await tempCohortFile({
      scope: "local_review_only",
      public_release_approved: false,
      cohort_date: "2026-08-04",
      advisor_ids: [...expectedIds.slice(0, 12), expectedIds[0]],
    });
    await expect(buildLocalReviewDto({ cohortFile })).rejects.toThrow(/REVIEW_COHORT_DUPLICATE_ID/);
  });

  it("rejects a cohort file whose id set does not match the approved whitelist", async () => {
    const cohortFile = await tempCohortFile({
      scope: "local_review_only",
      public_release_approved: false,
      cohort_date: "2026-08-04",
      advisor_ids: [...expectedIds.slice(0, 12), "unknown-advisor"],
    });
    await expect(buildLocalReviewDto({ cohortFile })).rejects.toThrow();
  });

  it("writes and validates only an ignored local-review artifact directory", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "advisor-review-"));
    temporaryRoots.push(root);
    const outputFile = path.join(root, "public", "data", "advisors.json");
    const reportRoot = path.join(root, "public", "reports");
    const written = await writeLocalReviewDto({ outputFile, reportRoot });
    const validated = await validateLocalReviewDto({ outputFile, reportRoot });
    expect(written.envelope.advisorCount).toBe(13);
    expect(validated.envelope.advisorCount).toBe(13);
    for (const report of written.reports) {
      const content = await readFile(path.join(reportRoot, report.name), "utf8");
      expect(content).toBe(report.content);
    }
  });

  it("keeps the formal deployable DTO scoped to the approved 11 (not 13)", async () => {
    const formalDto = JSON.parse(await readFile(path.join(process.cwd(), "public", "data", "advisors.json"), "utf8"));
    expect(formalDto.advisorCount).toBe(11);
    expect(formalDto.source).toBe("approved-public-advisor-contract");
  });

  it("uses the default review paths pointing at the ignored .local-review directory", () => {
    expect(defaultReviewPaths.outputFile.replaceAll("\\", "/")).toMatch(/\.local-review\/public\/data\/advisors\.json$/);
    expect(defaultReviewPaths.reportRoot.replaceAll("\\", "/")).toMatch(/\.local-review\/public\/reports$/);
  });
});
