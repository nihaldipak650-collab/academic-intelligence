import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildPublicAdvisorDto,
  validatePublicAdvisorDto,
  writePublicAdvisorDto,
} from "./public-advisor-dto.mjs";
import { scanPublicContent } from "./public-content-scan.mjs";

const roots = [];
const E1_URL = "https://doi.org/10.1000/synthetic-approved";
const E2_URL = "https://doi.org/10.1000/synthetic-approved-2";

function sourced(value) {
  return { value };
}

function approvedPublicAdvisor() {
  return {
    schema_version: "1.0.4",
    advisor_id: "synthetic-approved",
    record_created_at: "2026-08-01",
    name_zh: sourced("合成批准导师"),
    name_en: sourced("Synthetic Approved Advisor"),
    institution: sourced("合成大学"),
    school_or_department: sourced("生命科学学院"),
    position: sourced("教授"),
    public_roles: [sourced("研究生导师")],
    research_directions_original: [
      { text: "合成公开研究方向。", evidence_ids: ["E1"], source_urls: [E1_URL] },
    ],
    research_directions_plain_language: [
      {
        term_original: "合成方向",
        explanation_zh: "仅用于回归测试的公开解释。",
        undergraduate_meaning: "可从公开论文复核开始。",
        evidence_ids: ["E1"],
      },
    ],
    research_questions: [{ text: "合成科学问题？", evidence_ids: ["E1"] }],
    main_techniques: [{ text: "公开数据整理。", evidence_ids: ["E1"] }],
    research_workflow: [{ text: "提出问题并复核公开证据。", evidence_ids: ["E1"] }],
    adopted_public_evidence_ids: ["E1"],
    possible_undergraduate_tasks: [
      {
        task: "公开证据整理",
        task_context: "合成公开论文",
        task_purpose: "训练可追溯整理",
        possible_methods: ["文献阅读"],
        possible_output: "公开证据表",
        evidence_ids: ["E1"],
        uncertainty_note: "不代表真实实验室安排。",
      },
    ],
    prerequisite_skills: [{ text: "基础文献阅读。", evidence_ids: ["E1"] }],
    learning_cost: { text: "学习成本取决于公开任务边界。", evidence_ids: ["E1"] },
    generic_growth_path: [
      {
        stage: "foundation",
        possible_activities: ["阅读公开论文"],
        possible_outputs: ["文献笔记"],
        evidence_ids: ["E1"],
        uncertainty_note: "仅为通用学习场景。",
      },
    ],
    boundary_statement: "仅展示已批准的公开学术证据，不推断实验室内部情况。",
    summary: { text: "合成批准导师的公开研究摘要。", evidence_ids: ["E1"], source_urls: [E1_URL] },
    search_keywords: ["合成关键词"],
    tags: ["公开学术"],
    publication_status: "approved",
    report_path: "reports/synthetic-approved.md",
  };
}

function adoptedEvidence(overrides = {}) {
  return {
    evidence_id: "E1",
    evidence_type: "publication",
    source_url: E1_URL,
    candidate_statuses: ["adopted"],
    title: "Synthetic public evidence",
    publication_year: 2025,
    doi: "10.1000/synthetic-approved",
    ...overrides,
  };
}

function secondAdoptedEvidence() {
  return adoptedEvidence({
    evidence_id: "E2",
    source_url: E2_URL,
    title: "Second synthetic public evidence",
    doi: "10.1000/synthetic-approved-2",
  });
}

function approvedManifest() {
  return {
    schema_version: "1.0.4",
    advisor_id: "synthetic-approved",
    candidate_evidence: [adoptedEvidence()],
  };
}

function approvedValidation() {
  return {
    schema_version: "1.0.4",
    advisor_id: "synthetic-approved",
    valid: true,
    release_eligible: true,
    effective_publication_status: "approved",
  };
}

async function makeFixture({ publicAdvisor, manifest, validation, identity = true } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "public-dto-"));
  roots.push(root);
  const sourceRoot = path.join(root, "data", "advisors-v1");
  const advisorDir = path.join(sourceRoot, "synthetic-approved");
  const publicRoot = path.join(root, "frontend", "public");
  const outputFile = path.join(publicRoot, "data", "advisors.json");
  const reportRoot = path.join(publicRoot, "reports");
  await Promise.all([
    mkdir(advisorDir, { recursive: true }),
    mkdir(path.dirname(outputFile), { recursive: true }),
    mkdir(reportRoot, { recursive: true }),
  ]);
  await writeFile(
    path.join(advisorDir, "public-advisor-v1.json"),
    JSON.stringify(publicAdvisor ?? approvedPublicAdvisor()),
  );
  await writeFile(
    path.join(advisorDir, "evidence-manifest-v1.json"),
    JSON.stringify(manifest ?? approvedManifest()),
  );
  if (validation !== null) {
    await writeFile(
      path.join(advisorDir, "validation-report-v1.json"),
      JSON.stringify(validation ?? approvedValidation()),
    );
  }
  if (identity) {
    await writeFile(
      path.join(advisorDir, "identity-review-v1.json"),
      JSON.stringify({ internal_identity_marker: "MUST_NOT_ENTER_DTO", orcid_status: "pending" }),
    );
  }
  return { root, sourceRoot, publicRoot, outputFile, reportRoot };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("fail-closed public advisor DTO exporter", () => {
  it("当前本地 13 位白名单导出 11 位公开候选", async () => {
    const result = await buildPublicAdvisorDto();
    expect(result.sourceAdvisorCount).toBe(13);
    expect(result.envelope.advisorCount).toBe(11);
    expect(result.envelope.advisors.map((advisor) => advisor.id)).toEqual([
      "chen-miao",
      "hu-dehua",
      "li-faxiang",
      "li-jiada",
      "li-xing",
      "liu-jing",
      "su-haomiao",
      "tan-jieqiong",
      "wang-shixiang",
      "xiang-rong",
      "zhao-yuetao",
    ]);
    expect(result.rejections.map((item) => item.advisorId).sort()).toEqual(["guo-hui", "hu-zhengmao"]);
  });

  it("合成合法批准导师导出 1 位且只含显式公开 DTO", async () => {
    const paths = await makeFixture();
    const result = await buildPublicAdvisorDto(paths);
    expect(result.envelope.advisorCount).toBe(1);
    expect(result.envelope.advisors[0]).toEqual(
      expect.objectContaining({
        dtoVersion: "1.0.4",
        id: "synthetic-approved",
        publicationStatus: "approved",
        releaseEligible: true,
        publicEvidence: [
          {
            evidenceId: "E1",
            title: "Synthetic public evidence",
            year: 2025,
            doi: "10.1000/synthetic-approved",
            sourceUrl: E1_URL,
          },
        ],
      }),
    );
    const serialized = JSON.stringify(result.envelope);
    expect(serialized).not.toMatch(/MUST_NOT_ENTER_DTO|orcid|notes|repository_source_ref|contact/i);
    const advisor = result.envelope.advisors[0];
    const traceableContent = [
      advisor.summary,
      ...advisor.researchDirections,
      ...advisor.researchDirectionsPlain,
      ...advisor.researchQuestions,
      ...advisor.mainTechniques,
      ...advisor.researchWorkflow,
      ...advisor.possibleUndergraduateTasks,
      ...advisor.prerequisiteSkills,
      advisor.learningCost,
      ...advisor.genericGrowthPath,
    ];
    const publicEvidenceIds = new Set(advisor.publicEvidence.map((item) => item.evidenceId));
    expect(traceableContent).toHaveLength(10);
    for (const item of traceableContent) {
      expect(item.evidenceIds).toEqual(["E1"]);
      expect(item.evidenceIds.every((evidenceId) => publicEvidenceIds.has(evidenceId))).toBe(true);
    }
  });

  it("review_pending 被拒绝", async () => {
    const publicAdvisor = approvedPublicAdvisor();
    publicAdvisor.publication_status = "review_pending";
    const validation = { ...approvedValidation(), effective_publication_status: "review_pending" };
    const result = await buildPublicAdvisorDto(await makeFixture({ publicAdvisor, validation }));
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.rejections[0].reasons).toContain("public_advisor_status_not_allowed");
  });

  it("release_eligible=false 被拒绝", async () => {
    const validation = { ...approvedValidation(), release_eligible: false };
    const result = await buildPublicAdvisorDto(await makeFixture({ validation }));
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.rejections[0].reasons).toContain("validation_release_eligible_not_true");
  });

  it("缺失 Validation Report 被拒绝", async () => {
    const result = await buildPublicAdvisorDto(await makeFixture({ validation: null }));
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.rejections[0].reasons).toContain("validation-report-v1.json_missing");
  });

  it("Validation Report 解析失败被拒绝", async () => {
    const paths = await makeFixture();
    await writeFile(
      path.join(paths.sourceRoot, "synthetic-approved", "validation-report-v1.json"),
      "{invalid-json",
    );
    const result = await buildPublicAdvisorDto(paths);
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.rejections[0].reasons).toContain("validation-report-v1.json_parse_failed");
  });

  it("valid=false 被拒绝", async () => {
    const validation = { ...approvedValidation(), valid: false };
    const result = await buildPublicAdvisorDto(await makeFixture({ validation }));
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.rejections[0].reasons).toContain("validation_not_valid");
  });

  it("Public Advisor 与 Validation 状态冲突被拒绝", async () => {
    const validation = { ...approvedValidation(), effective_publication_status: "published" };
    const result = await buildPublicAdvisorDto(await makeFixture({ validation }));
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.rejections[0].reasons).toContain("publication_status_mismatch");
  });

  it("未知 Schema 被拒绝", async () => {
    const publicAdvisor = { ...approvedPublicAdvisor(), schema_version: "1.0.5" };
    const result = await buildPublicAdvisorDto(await makeFixture({ publicAdvisor }));
    expect(result.envelope.advisorCount).toBe(0);
    expect(result.rejections[0].reasons).toContain("public_advisor_schema_not_1.0.4");
  });

  it("Identity Review 文件内容不进入 DTO", async () => {
    const result = await buildPublicAdvisorDto(await makeFixture());
    expect(JSON.stringify(result.envelope)).not.toMatch(/MUST_NOT_ENTER_DTO|orcid_status/i);
  });

  it("未被 Public Advisor 引用的 Manifest Evidence 不进入 DTO", async () => {
    const manifest = approvedManifest();
    manifest.candidate_evidence.push(
      adoptedEvidence({
        evidence_id: "E2",
        source_url: "https://doi.org/10.1000/unreferenced",
        doi: "10.1000/unreferenced",
        title: "Unreferenced evidence",
      }),
    );
    const result = await buildPublicAdvisorDto(await makeFixture({ manifest }));
    expect(result.envelope.advisors[0].publicEvidence.map((item) => item.evidenceId)).toEqual(["E1"]);
  });

  it("被引用但非 adopted 的 Evidence 使导出失败", async () => {
    const manifest = approvedManifest();
    manifest.candidate_evidence[0].candidate_statuses = ["candidate"];
    await expect(buildPublicAdvisorDto(await makeFixture({ manifest }))).rejects.toThrow(/不是 adopted/);
  });

  it.each([
    ["Evidence ID", () => {
      const manifest = approvedManifest();
      manifest.candidate_evidence[0].evidence_id = "E9";
      return { manifest };
    }, /Manifest 不存在/],
    ["DOI", () => {
      const manifest = approvedManifest();
      manifest.candidate_evidence[0].doi = "10.1000/wrong-doi";
      return { manifest };
    }, /DOI 与 URL 错绑/],
    ["URL", () => {
      const publicAdvisor = approvedPublicAdvisor();
      publicAdvisor.summary.source_urls = ["https://doi.org/10.1000/wrong-url"];
      return { publicAdvisor };
    }, /URL 错绑/],
  ])("%s 错绑使导出失败", async (_label, mutate, error) => {
    await expect(buildPublicAdvisorDto(await makeFixture(mutate()))).rejects.toThrow(error);
  });

  it("evidence_ids 与 source_urls 交换顺序时严格拒绝", async () => {
    const publicAdvisor = approvedPublicAdvisor();
    publicAdvisor.adopted_public_evidence_ids = ["E1", "E2"];
    publicAdvisor.summary.evidence_ids = ["E1", "E2"];
    publicAdvisor.summary.source_urls = [E2_URL, E1_URL];
    const manifest = approvedManifest();
    manifest.candidate_evidence.push(secondAdoptedEvidence());
    await expect(buildPublicAdvisorDto(await makeFixture({ publicAdvisor, manifest }))).rejects.toThrow(/URL 错绑/);
  });

  it("evidence_ids 与 source_urls 数量不一致时严格拒绝", async () => {
    const publicAdvisor = approvedPublicAdvisor();
    publicAdvisor.adopted_public_evidence_ids = ["E1", "E2"];
    publicAdvisor.summary.evidence_ids = ["E1", "E2"];
    publicAdvisor.summary.source_urls = [E1_URL];
    const manifest = approvedManifest();
    manifest.candidate_evidence.push(secondAdoptedEvidence());
    await expect(buildPublicAdvisorDto(await makeFixture({ publicAdvisor, manifest }))).rejects.toThrow(/数量不一致/);
  });

  it("evidence_ids 与 source_urls 正确同序绑定时通过", async () => {
    const publicAdvisor = approvedPublicAdvisor();
    publicAdvisor.adopted_public_evidence_ids = ["E1", "E2"];
    publicAdvisor.summary.evidence_ids = ["E1", "E2"];
    publicAdvisor.summary.source_urls = [E1_URL, E2_URL];
    const manifest = approvedManifest();
    manifest.candidate_evidence.push(secondAdoptedEvidence());
    const result = await buildPublicAdvisorDto(await makeFixture({ publicAdvisor, manifest }));
    expect(result.envelope.advisors[0].summary).toEqual({ text: publicAdvisor.summary.text, evidenceIds: ["E1", "E2"] });
    expect(result.envelope.advisors[0].publicEvidence.map((item) => item.evidenceId)).toEqual(["E1", "E2"]);
  });

  it("相同输入产生逐字节相同 DTO 和报告", async () => {
    const paths = await makeFixture();
    await writePublicAdvisorDto(paths);
    const firstDto = await readFile(paths.outputFile, "utf8");
    const firstReport = await readFile(path.join(paths.reportRoot, "synthetic-approved.md"), "utf8");
    await writePublicAdvisorDto(paths);
    expect(await readFile(paths.outputFile, "utf8")).toBe(firstDto);
    expect(await readFile(path.join(paths.reportRoot, "synthetic-approved.md"), "utf8")).toBe(firstReport);
    await expect(validatePublicAdvisorDto(paths)).resolves.toEqual(
      expect.objectContaining({ sourceAdvisorCount: 1 }),
    );
  });

  it("正常 DTO、报告和 P0 public allowlist 扫描可共同通过", async () => {
    const paths = await makeFixture();
    await writeFile(path.join(paths.publicRoot, "data", "site-config.json"), '{"feedbackUrl":""}\n');
    await writePublicAdvisorDto(paths);
    await expect(scanPublicContent({ mode: "public", publicRoot: paths.publicRoot })).resolves.toEqual(
      expect.objectContaining({ publicAdvisorRecords: 1, trackedOrArtifactReports: 1 }),
    );
  });
});
