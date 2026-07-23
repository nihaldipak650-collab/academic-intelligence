import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import advisorJson from "../../public/data/advisors.json";
import {
  filterAdvisors,
  getTagCounts,
} from "../data/advisorData";
import type { AdvisorDataEnvelope } from "../types/advisor";

const data = advisorJson as AdvisorDataEnvelope;
const frontendRoot = process.cwd();
const repoRoot = path.resolve(frontendRoot, "..");

describe("真实导师数据", () => {
  it("加载恰好 7 位当前公开导师", () => {
    expect(data.advisorCount).toBe(7);
    expect(data.advisors).toHaveLength(7);
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

  it("搜索中文姓名", () => {
    expect(filterAdvisors(data.advisors, "  郭辉  ", "")).toHaveLength(1);
  });

  it("搜索英文姓名且不区分大小写", () => {
    expect(filterAdvisors(data.advisors, "DEHUA HU", "")[0]?.id).toBe(
      "hu-dehua",
    );
  });

  it("搜索研究标签", () => {
    expect(
      filterAdvisors(data.advisors, "Cryo-EM", "")[0]?.id,
    ).toBe("li-faxiang");
  });

  it("搜索和标签筛选可组合", () => {
    expect(
      filterAdvisors(data.advisors, "孤独症", "应激颗粒").map(
        (advisor) => advisor.id,
      ),
    ).toEqual(["guo-hui"]);
  });

  it("动态标签计数来源于真实数据", () => {
    const counts = new Map(getTagCounts(data.advisors));
    expect(counts.get("神经发育障碍")).toBe(2);
    expect(counts.get("结构生物学")).toBe(1);
  });

  it("Academic-only 与单案例 Experience 状态正确", () => {
    const academicOnly = data.advisors.filter(
      (advisor) => advisor.evidenceType === "academic_only",
    );
    expect(academicOnly).toHaveLength(5);
    academicOnly.forEach((advisor) => {
      expect(advisor.hasExperienceEvidence).toBe(false);
      expect(advisor.experienceCaseCount).toBe(0);
    });
    for (const id of ["liu-jing", "li-faxiang"]) {
      const advisor = data.advisors.find((item) => item.id === id);
      expect(advisor?.hasExperienceEvidence).toBe(true);
      expect(advisor?.experienceCaseCount).toBe(1);
    }
  });

  it("网页报告副本与 web 源报告逐字节一致", () => {
    data.advisors.forEach((advisor) => {
      const name = advisor.reportPath.replace("reports/", "");
      const publicReport = readFileSync(
        path.join(frontendRoot, "public", "reports", name),
        "utf8",
      );
      const sourceReport = readFileSync(
        path.join(repoRoot, "web", "reports", name),
        "utf8",
      );
      expect(publicReport).toBe(sourceReport);
    });
  });

  it("生产数据中没有禁止的占位字符串", () => {
    const productionData = JSON.stringify(data);
    expect(productionData).not.toMatch(
      /placeholder|example\.com|10\.0000\/|lorem ipsum|mock advisor|待人工核验后补充|demo doi/i,
    );
  });

  it("使用 Hash Router 和相对 Vite base", () => {
    const app = readFileSync(path.join(frontendRoot, "src", "App.tsx"), "utf8");
    const vite = readFileSync(path.join(frontendRoot, "vite.config.ts"), "utf8");
    expect(app).toContain("HashRouter");
    expect(vite).toContain('base: "./"');
  });
});
