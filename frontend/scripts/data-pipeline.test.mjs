import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildAdvisorData,
  evaluatePublicationGate,
  syncAdvisorData,
  validateGeneratedData,
} from "./data-pipeline.mjs";

const tempRoots = [];

async function fixturePaths(advisors, reports = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "p0-pipeline-"));
  tempRoots.push(root);
  const sourceReportDir = path.join(root, "web", "reports");
  const validationRoot = path.join(root, "data", "advisors-v1");
  const publicDataDir = path.join(root, "frontend", "public", "data");
  const publicReportDir = path.join(root, "frontend", "public", "reports");
  await Promise.all([
    mkdir(sourceReportDir, { recursive: true }),
    mkdir(validationRoot, { recursive: true }),
    mkdir(publicDataDir, { recursive: true }),
    mkdir(publicReportDir, { recursive: true }),
  ]);
  const sourceAdvisorFile = path.join(root, "web", "advisors.json");
  const sourceSiteConfigFile = path.join(root, "web", "site-config.json");
  const generatedAdvisorFile = path.join(publicDataDir, "advisors.json");
  const generatedSiteConfigFile = path.join(publicDataDir, "site-config.json");
  await writeFile(sourceAdvisorFile, `${JSON.stringify(advisors)}\n`);
  await writeFile(sourceSiteConfigFile, '{"feedback_url":""}\n');
  for (const [name, content] of Object.entries(reports)) {
    await writeFile(path.join(sourceReportDir, name), content);
  }
  for (const advisor of advisors) {
    if (evaluatePublicationGate(advisor).allowed) {
      const validationDir = path.join(validationRoot, advisor.id);
      await mkdir(validationDir, { recursive: true });
      await writeFile(
        path.join(validationDir, "validation-report-v1.json"),
        JSON.stringify({
          valid: true,
          release_eligible: true,
          requested_publication_status: advisor.publication_status,
          effective_publication_status: advisor.publication_status,
        }),
      );
    }
  }
  return {
    sourceAdvisorFile,
    sourceReportDir,
    validationRoot,
    sourceSiteConfigFile,
    publicDataDir,
    publicReportDir,
    generatedAdvisorFile,
    generatedSiteConfigFile,
  };
}

function approvedRecord(overrides = {}) {
  return {
    id: "synthetic-advisor",
    name: "测试导师",
    summary: "合成公开学术摘要。",
    tags: ["合成标签"],
    report: "synthetic-public.md",
    schema_version: "1.0.4",
    release_eligible: true,
    publication_status: "approved",
    has_experience_evidence: false,
    experience_case_count: 0,
    evidence_type: "academic_only",
    author_match_confidence: "High",
    ...overrides,
  };
}

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("fail-closed publication gate", () => {
  it.each([
    [{ schema_version: undefined }, "schema_version_not_1.0.4"],
    [{ schema_version: "1.0.3" }, "schema_version_not_1.0.4"],
    [{ release_eligible: false }, "release_eligible_not_true"],
    [{ publication_status: "review_pending" }, "publication_status_not_allowed"],
    [{ publication_status: "beta" }, "publication_status_not_allowed"],
    [{ publication_status: "unknown" }, "publication_status_not_allowed"],
    [{ publication_status: undefined }, "publication_status_not_allowed"],
    [{ has_experience_evidence: true }, "experience_not_false"],
    [{ experience_case_count: 1 }, "experience_count_not_zero"],
    [{ evidence_type: "academic_and_experience" }, "evidence_type_not_academic_only"],
    [{ summary: "" }, "missing_summary"],
    [{ report: "../synthetic-public.md" }, "invalid_report"],
    [{ report: "nested/synthetic-public.md" }, "invalid_report"],
  ])("拒绝不安全记录 %#", (overrides, reason) => {
    expect(evaluatePublicationGate(approvedRecord(overrides))).toEqual(
      expect.objectContaining({ allowed: false, reasons: expect.arrayContaining([reason]) }),
    );
  });

  it("仅允许完整的 1.0.4 Academic-only 获批记录", () => {
    expect(evaluatePublicationGate(approvedRecord())).toEqual({ allowed: true, reasons: [] });
    expect(evaluatePublicationGate(approvedRecord({ publication_status: "published" })).allowed).toBe(true);
  });

  it("先门禁后读报告，拒绝记录不要求报告文件存在", async () => {
    const paths = await fixturePaths([
      approvedRecord({ release_eligible: false, report: "does-not-exist.md" }),
    ]);
    const result = await syncAdvisorData(paths);
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.reports).toEqual([]);
    expect(result.rejections).toHaveLength(1);
    expect(JSON.parse(await readFile(paths.generatedAdvisorFile, "utf8")).advisors).toEqual([]);
  });

  it("同步与校验仅复制显式获批的安全报告并清理残留", async () => {
    const paths = await fixturePaths(
      [approvedRecord()],
      { "synthetic-public.md": "# 测试导师\n\n## 公开学术事实\n\n合成公开内容。\n" },
    );
    await writeFile(path.join(paths.publicReportDir, "stale.md"), "stale");
    const synced = await syncAdvisorData(paths);
    expect(synced.envelope.advisorCount).toBe(1);
    expect(await readFile(path.join(paths.publicReportDir, "synthetic-public.md"), "utf8")).toContain("公开学术事实");
    await expect(readFile(path.join(paths.publicReportDir, "stale.md"), "utf8")).rejects.toThrow();
    await expect(validateGeneratedData(paths)).resolves.toEqual(expect.objectContaining({ reports: expect.any(Array) }));
  });

  it("Roster 的 release_eligible=true 不能绕过生产 validation report", async () => {
    const paths = await fixturePaths(
      [approvedRecord()],
      { "synthetic-public.md": "# 测试导师\n\n## 公开学术事实\n\n合成公开内容。\n" },
    );
    await writeFile(
      path.join(paths.validationRoot, "synthetic-advisor", "validation-report-v1.json"),
      JSON.stringify({
        valid: true,
        release_eligible: false,
        requested_publication_status: "review_pending",
        effective_publication_status: "review_pending",
      }),
    );
    const result = await syncAdvisorData(paths);
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.rejections[0].reasons).toContain("validation_release_eligible_not_true");
  });

  it.each([
    [{ valid: false }, "validation_not_valid"],
    [
      { effective_publication_status: "review_pending" },
      "validation_effective_status_not_allowed",
    ],
  ])("正式 validation report 的无效或未获批状态拒绝导出", async (override, reason) => {
    const paths = await fixturePaths([approvedRecord()]);
    const validationFile = path.join(
      paths.validationRoot,
      "synthetic-advisor",
      "validation-report-v1.json",
    );
    const validation = JSON.parse(await readFile(validationFile, "utf8"));
    await writeFile(validationFile, JSON.stringify({ ...validation, ...override }), "utf8");

    const result = await buildAdvisorData(paths);

    expect(result.envelope.advisors).toHaveLength(0);
    expect(result.rejections[0].reasons).toContain(reason);
  });

  it("正式 validation report 可使用 publication_status 合同字段", async () => {
    const paths = await fixturePaths(
      [approvedRecord()],
      { "synthetic-public.md": "# 测试导师\n\n## 公开学术事实\n\n合成公开内容。\n" },
    );
    const validationFile = path.join(
      paths.validationRoot,
      "synthetic-advisor",
      "validation-report-v1.json",
    );
    const validation = JSON.parse(await readFile(validationFile, "utf8"));
    delete validation.effective_publication_status;
    validation.publication_status = "approved";
    await writeFile(validationFile, JSON.stringify(validation), "utf8");

    const result = await buildAdvisorData(paths);

    expect(result.envelope.advisors).toHaveLength(1);
  });

  it("获批元数据不能绕过报告内容扫描", async () => {
    const paths = await fixturePaths(
      [approvedRecord()],
      { "synthetic-public.md": "# 测试导师\n\n## Experience Evidence\n\nsynthetic blocked content\n" },
    );
    await expect(buildAdvisorData(paths)).rejects.toThrow(/Experience 内容标记/);
  });
});
