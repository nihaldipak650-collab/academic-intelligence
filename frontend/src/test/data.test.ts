import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { describe, expect, it } from "vitest";
import advisorJson from "../../public/data/advisors.json";
import { filterAdvisors } from "../data/advisorData";
import type { Advisor } from "../types/advisor";

interface DtoAdvisor {
  id: string;
  nameZh: string;
  nameEn?: string;
  summary: unknown;
  tags: string[];
  position?: string;
  institution?: string;
  quickSummary?: {
    mainTechniques?: unknown[];
    undergraduatePaths?: unknown[];
    coreDirections?: unknown[];
  };
  reportPath: string;
  reportSha256?: string;
  releaseEligible: boolean;
  publicationStatus: string;
  evidenceType: string;
  hasExperienceEvidence: boolean;
  experienceCaseCount: number;
}

const data = advisorJson as unknown as {
  schemaVersion: number;
  advisorCount: number;
  advisors: DtoAdvisor[];
};
const frontendRoot = process.cwd();
const asAdvisors = (list: DtoAdvisor[]): Advisor[] =>
  list as unknown as Advisor[];

describe("真实导师数据（public DTO · 11 位公开导师）", () => {
  it("公开导师数量为 11，且 envelope 有效", () => {
    expect(data.schemaVersion).toBe(1);
    expect(data.advisorCount).toBe(11);
    expect(data.advisors).toHaveLength(11);
    expect(data.advisorCount).toBe(data.advisors.length);
  });

  it("导师 ID 唯一", () => {
    const ids = data.advisors.map((advisor) => advisor.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("报告路径唯一且使用相对 URL", () => {
    const paths = data.advisors.map((advisor) => advisor.reportPath);
    expect(new Set(paths).size).toBe(paths.length);
    paths.forEach((reportPath) => {
      expect(reportPath).toMatch(/^reports\/.+\.md$/);
      expect(reportPath).not.toMatch(/^[a-z]:\\/i);
    });
  });

  it("全部为安全公开 DTO：releaseEligible / 非 review_pending / academic-only / 无学生经历", () => {
    for (const advisor of data.advisors) {
      expect(advisor.releaseEligible).toBe(true);
      expect(advisor.publicationStatus).not.toBe("review_pending");
      expect(advisor.evidenceType).toBe("academic_only");
      expect(advisor.hasExperienceEvidence).toBe(false);
      expect(advisor.experienceCaseCount).toBe(0);
    }
  });

  it("公开报告与 DTO 记录的报告哈希一致", () => {
    for (const advisor of data.advisors) {
      const name = advisor.reportPath.replace("reports/", "");
      const publicReport = readFileSync(
        path.join(frontendRoot, "public", "reports", name),
        "utf8",
      );
      const hash = createHash("sha256").update(publicReport).digest("hex");
      expect(hash).toBe(advisor.reportSha256);
    }
  });

  it("搜索中文姓名能找到公开导师", () => {
    expect(filterAdvisors(asAdvisors(data.advisors), "李家大", "")[0]?.id).toBe(
      "li-jiada",
    );
  });

  it("搜索技术手段（冷冻电镜）能找到李发祥", () => {
    expect(
      filterAdvisors(asAdvisors(data.advisors), "冷冻电镜", "").some(
        (advisor) => advisor.id === "li-faxiang",
      ),
    ).toBe(true);
  });

  it("生产数据中没有禁止的占位字符串", () => {
    const productionData = JSON.stringify(data);
    expect(productionData).not.toMatch(
      /placeholder|example\.com|10\.0000\/|lorem ipsum|mock advisor|待人工核验后补充|demo doi/i,
    );
  });

  it("使用 Hash Router 和相对 Vite base", () => {
    const app = readFileSync(path.join(frontendRoot, "src", "App.tsx"), "utf8");
    const vite = readFileSync(
      path.join(frontendRoot, "vite.config.ts"),
      "utf8",
    );
    expect(app).toContain("HashRouter");
    expect(app).toContain("PlatformHomePage");
    expect(vite).toContain('base: "./"');
  });
});
