import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { LEGACY_REPORT_NAMES, scanPublicContent } from "./public-content-scan.mjs";

const roots = [];

function publishedAdvisor(overrides = {}) {
  return {
    id: "future-safe-advisor",
    nameZh: "未来测试导师",
    schemaVersion: "1.0.4",
    publicationStatus: "approved",
    releaseEligible: true,
    hasExperienceEvidence: false,
    experienceCaseCount: 0,
    evidenceType: "academic_only",
    reportPath: "reports/future-safe-advisor.md",
    ...overrides,
  };
}

async function makeTree() {
  const root = await mkdtemp(path.join(os.tmpdir(), "p0-scan-"));
  roots.push(root);
  const publicRoot = path.join(root, "public");
  const artifactRoot = path.join(root, "dist");
  const sourceReportRoot = path.join(root, "web", "reports");
  const sourceAdvisorFile = path.join(root, "web", "advisors.json");
  const validationRoot = path.join(root, "data", "advisors-v1");
  for (const tree of [publicRoot, artifactRoot]) {
    await mkdir(path.join(tree, "data"), { recursive: true });
    await mkdir(path.join(tree, "reports"), { recursive: true });
    await mkdir(path.join(tree, "assets"), { recursive: true });
    await writeFile(
      path.join(tree, "data", "advisors.json"),
      '{"schemaVersion":1,"source":"approved-public-advisor-contract","advisorCount":0,"advisors":[]}\n',
    );
    await writeFile(path.join(tree, "data", "site-config.json"), '{"feedbackUrl":""}\n');
    await writeFile(path.join(tree, "index.html"), "<!doctype html><title>safe</title>");
    await writeFile(path.join(tree, "assets", "index.js"), 'const label = "Experience Evidence";');
    await writeFile(path.join(tree, "assets", "index.css"), "body { color: black; }");
  }
  await mkdir(sourceReportRoot, { recursive: true });
  await mkdir(validationRoot, { recursive: true });
  await writeFile(sourceAdvisorFile, "[]\n");
  return { publicRoot, artifactRoot, sourceReportRoot, sourceAdvisorFile, validationRoot };
}

async function writeGeneratedTree(root, advisors, reports = {}) {
  await writeFile(
    path.join(root, "data", "advisors.json"),
    JSON.stringify({ schemaVersion: 1, advisorCount: advisors.length, advisors }),
  );
  for (const [name, content] of Object.entries(reports)) {
    await writeFile(path.join(root, "reports", name), content);
  }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("reusable public content allowlist scanner", () => {
  it("接受当前空集合的 public 和 artifact", async () => {
    const paths = await makeTree();
    for (const mode of ["public", "artifact"]) {
      await expect(scanPublicContent({ mode, ...paths })).resolves.toEqual(
        expect.objectContaining({
          publicAdvisorRecords: 0,
          trackedOrArtifactReports: 0,
          sensitiveNames: 0,
        }),
      );
    }
  });

  it("prebuild 基于 data/advisors-v1 正式门禁，拒绝空生产包", async () => {
    const paths = await makeTree();
    await expect(scanPublicContent({ mode: "prebuild", ...paths })).rejects.toThrow(/正式公开门禁结果为空/);
  });

  it("prebuild 接受获批生产包，并校验 formal DTO 与空 legacy reports", async () => {
    const paths = await makeTree();
    const advisor = publishedAdvisor();
    await mkdir(path.join(paths.validationRoot, advisor.id), { recursive: true });
    await writeFile(
      path.join(paths.validationRoot, advisor.id, "validation-report-v1.json"),
      JSON.stringify({
        valid: true,
        release_eligible: true,
        effective_publication_status: "approved",
      }),
    );
    await writeFile(
      path.join(paths.publicRoot, "data", "advisors.json"),
      JSON.stringify({ schemaVersion: 1, advisorCount: 1, advisors: [advisor] }),
    );
    await expect(
      scanPublicContent({
        mode: "prebuild",
        ...paths,
        buildPublicAdvisorDto: async () => ({
          envelope: { schemaVersion: 1, advisorCount: 1, advisors: [advisor] },
          reports: [{ name: "future-safe-advisor.md", content: "# 未来测试导师\n\n公开内容。\n" }],
          sourceAdvisorCount: 1,
          rejections: [],
        }),
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        sourceAllowedRecords: 1,
        publicAdvisorRecords: 1,
        trackedOrArtifactReports: 1,
        sourceRejectedRecords: 0,
      }),
    );
  });

  it("prebuild 拒绝 legacy web/reports 回潮", async () => {
    const paths = await makeTree();
    const advisor = publishedAdvisor();
    await mkdir(path.join(paths.validationRoot, advisor.id), { recursive: true });
    await writeFile(
      path.join(paths.validationRoot, advisor.id, "validation-report-v1.json"),
      JSON.stringify({
        valid: true,
        release_eligible: true,
        effective_publication_status: "approved",
      }),
    );
    await writeFile(
      path.join(paths.publicRoot, "data", "advisors.json"),
      JSON.stringify({ schemaVersion: 1, advisorCount: 1, advisors: [advisor] }),
    );
    await writeFile(path.join(paths.sourceReportRoot, "leak.md"), "synthetic");
    await expect(
      scanPublicContent({
        mode: "prebuild",
        ...paths,
        buildPublicAdvisorDto: async () => ({
          envelope: { schemaVersion: 1, advisorCount: 1, advisors: [advisor] },
          reports: [{ name: "future-safe-advisor.md", content: "# ok\n" }],
          sourceAdvisorCount: 1,
          rejections: [],
        }),
      }),
    ).rejects.toThrow(/legacy web\/reports 必须为空/);
  });

  it("prebuild 拒绝 formal DTO 与生产包不一致", async () => {
    const paths = await makeTree();
    const advisor = publishedAdvisor();
    await mkdir(path.join(paths.validationRoot, advisor.id), { recursive: true });
    await writeFile(
      path.join(paths.validationRoot, advisor.id, "validation-report-v1.json"),
      JSON.stringify({
        valid: true,
        release_eligible: true,
        effective_publication_status: "approved",
      }),
    );
    await writeFile(
      path.join(paths.publicRoot, "data", "advisors.json"),
      JSON.stringify({ schemaVersion: 1, advisorCount: 0, advisors: [] }),
    );
    await expect(
      scanPublicContent({
        mode: "prebuild",
        ...paths,
        buildPublicAdvisorDto: async () => ({
          envelope: { schemaVersion: 1, advisorCount: 1, advisors: [advisor] },
          reports: [{ name: "future-safe-advisor.md", content: "# ok\n" }],
          sourceAdvisorCount: 1,
          rejections: [],
        }),
      }),
    ).rejects.toThrow(/与生产包门禁结果不一致/);
  });

  it("允许未来显式获批记录及其唯一白名单报告通过 public/artifact", async () => {
    const paths = await makeTree();
    for (const [mode, root] of [["public", paths.publicRoot], ["artifact", paths.artifactRoot]]) {
      await writeGeneratedTree(root, [publishedAdvisor()], {
        "future-safe-advisor.md": "# 未来测试导师\n\n## 公开学术事实\n\n合成公开内容。\n",
      });
      await expect(scanPublicContent({ mode, ...paths })).resolves.toEqual(
        expect.objectContaining({ publicAdvisorRecords: 1, trackedOrArtifactReports: 1 }),
      );
    }
  });

  it("拒绝 generated 目录中缺失、多余或含 Experience 标记的报告", async () => {
    const paths = await makeTree();
    await writeGeneratedTree(paths.artifactRoot, [publishedAdvisor()], {
      "extra.md": "## Experience Evidence\n",
    });
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(
      /白名单外|缺少报告|Experience/,
    );
  });

  it("允许 UI 代码中的通用隔离标签，但不把它当作导师内容", async () => {
    const paths = await makeTree();
    await expect(scanPublicContent({ mode: "artifact", ...paths })).resolves.toEqual(
      expect.objectContaining({ experienceContentFiles: 0 }),
    );
  });


  it("允许已通过公开门禁的历史敏感姓名出现在其白名单 DTO 与报告中", async () => {
    const paths = await makeTree();
    const advisor = publishedAdvisor({
      id: "xiang-rong",
      nameZh: "项荣",
      reportPath: "reports/xiang-rong.md",
    });
    for (const [mode, root] of [["public", paths.publicRoot], ["artifact", paths.artifactRoot]]) {
      await writeGeneratedTree(root, [advisor], {
        "xiang-rong.md": "# 项荣\n\n## 公开学术事实\n\n项荣的合成公开内容。\n",
      });
      await expect(scanPublicContent({ mode, ...paths })).resolves.toEqual(
        expect.objectContaining({
          publicAdvisorRecords: 1,
          trackedOrArtifactReports: 1,
          sensitiveNames: 0,
        }),
      );
    }
  });

  it("拒绝用错误 advisor_id 冒用已获批历史姓名", async () => {
    const paths = await makeTree();
    await writeGeneratedTree(paths.artifactRoot, [publishedAdvisor({ nameZh: "项荣" })], {
      "future-safe-advisor.md": "# 项荣\n\n合成公开内容。\n",
    });
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/敏感姓名/);
  });

  it("仍拒绝未列入获批 DTO 的其他历史敏感姓名", async () => {
    const paths = await makeTree();
    await writeGeneratedTree(paths.artifactRoot, [publishedAdvisor()], {
      "future-safe-advisor.md": "# 未来测试导师\n\n郭辉尚未获批。\n",
    });
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/敏感姓名/);
  });

  it.each(["刘静", "李发祥"])("拒绝 index.html 中的受阻敏感姓名 %s", async (name) => {
    const paths = await makeTree();
    await writeFile(path.join(paths.artifactRoot, "index.html"), `<!doctype html>${name}`);
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/敏感姓名/);
  });

  it("拒绝 index.html 中的 Experience 正文标记", async () => {
    const paths = await makeTree();
    await writeFile(
      path.join(paths.artifactRoot, "index.html"),
      "<!doctype html><p>本科生科研经历 学生个案</p>",
    );
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/Experience/);
  });

  it("拒绝任意额外 identity review 文件", async () => {
    const paths = await makeTree();
    await writeFile(path.join(paths.artifactRoot, "identity-review-v1.json"), "{}\n");
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/禁止路径|白名单外/);
  });

  it("拒绝 reports 下未由 advisors 明确列出的 TXT", async () => {
    const paths = await makeTree();
    await writeFile(path.join(paths.artifactRoot, "reports", "leak.txt"), "synthetic leak\n");
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/白名单外/);
  });

  it("拒绝任意白名单外 extra.json", async () => {
    const paths = await makeTree();
    await writeFile(path.join(paths.artifactRoot, "extra.json"), "{}\n");
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/白名单外/);
  });

  it.each([
    ["assets/index.js", 'const local = "C:\\\\Users\\\\person\\\\private.txt";', /本地绝对路径/],
    ["index.html", "<!doctype html><p>Token: abcdefghijklmnop</p>", /Token 或密钥/],
    ["assets/index.css", "/* -----BEGIN PRIVATE KEY----- */", /Token 或密钥/],
  ])("拒绝 artifact 中的本地路径、Token 或密钥 %#", async (relativePath, content, error) => {
    const paths = await makeTree();
    await writeFile(path.join(paths.artifactRoot, ...relativePath.split("/")), content);
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(error);
  });

  it("拒绝 generated 数据中的 review_pending、release_eligible=false 和未知状态", async () => {
    const paths = await makeTree();
    await writeGeneratedTree(paths.artifactRoot, [publishedAdvisor({
      publicationStatus: "review_pending",
      releaseEligible: false,
    })]);
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/门禁违规/);
  });

  it("拒绝封禁旧报告文件名在 artifact 中重新出现", async () => {
    const paths = await makeTree();
    const legacyName = [...LEGACY_REPORT_NAMES][0];
    await writeFile(path.join(paths.artifactRoot, "index.html"), legacyName);
    await expect(scanPublicContent({ mode: "artifact", ...paths })).rejects.toThrow(/封禁旧报告/);
  });
});
