import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import advisorJson from "../../public/data/advisors.json";
import {
  filterAdvisors,
  getTagCounts,
} from "../data/advisorData";
import {
  getAdvisorContact,
  getAdvisorFreshness,
  getPublicUndergraduateTasks,
  MISSING_PUBLIC_INFO,
  NO_RELIABLE_PUBLIC_EVIDENCE,
  PENDING_VERIFICATION,
} from "../data/advisorPresentation";
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
    expect(filterAdvisors(data.advisors, "正茂", [])[0]?.id).toBe(
      "hu-zhengmao",
    );
  });

  it("搜索英文姓名且不区分大小写", () => {
    expect(filterAdvisors(data.advisors, "DEHUA HU", "")[0]?.id).toBe(
      "hu-dehua",
    );
  });

  it("搜索技术手段 Cryo-EM 能找到李发祥", () => {
    expect(
      filterAdvisors(data.advisors, "Cryo-EM", "")[0]?.id,
    ).toBe("li-faxiang");
  });

  it("搜索本科路径中的 Minigene 能找到胡正茂和李家大", () => {
    expect(
      filterAdvisors(data.advisors, "Minigene", []).map(
        (advisor) => advisor.id,
      ),
    ).toEqual(["hu-zhengmao", "li-jiada"]);
  });

  it("技术搜索与标签之间继续使用 AND", () => {
    expect(
      filterAdvisors(data.advisors, "Minigene", ["孤独症"]).map(
        (advisor) => advisor.id,
      ),
    ).toEqual(["hu-zhengmao"]);
  });

  it("搜索和标签筛选可组合", () => {
    expect(
      filterAdvisors(data.advisors, "孤独症", "应激颗粒").map(
        (advisor) => advisor.id,
      ),
    ).toEqual(["guo-hui"]);
  });

  it("同类别多标签使用 OR，并与姓名搜索使用 AND", () => {
    expect(
      filterAdvisors(data.advisors, "", ["孤独症", "结构生物学"]).map(
        (advisor) => advisor.id,
      ),
    ).toEqual(["li-faxiang", "guo-hui", "hu-zhengmao"]);
    expect(
      filterAdvisors(data.advisors, "郭", ["孤独症", "结构生物学"]).map(
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

  it("公开展示适配层不暴露混合摘要中的学生经历", () => {
    for (const id of ["liu-jing", "li-faxiang"]) {
      const advisor = data.advisors.find((item) => item.id === id);
      expect(advisor).toBeDefined();
      expect(getPublicUndergraduateTasks(advisor!)).toEqual([]);
    }
  });

  it("联系方式、动态状态和分析缺失文案使用统一规则", () => {
    const advisor = data.advisors.find((item) => item.id === "xiang-rong")!;
    expect(getAdvisorContact(advisor)).toEqual({
      officialEmail: null,
      officialPhone: null,
      officialHomepage: null,
      laboratoryAddress: null,
      sourceUrl: null,
    });
    expect(getAdvisorFreshness(advisor).opportunityStatus).toBe(
      PENDING_VERIFICATION,
    );
    expect(MISSING_PUBLIC_INFO).toBe("暂无公开信息");
    expect(NO_RELIABLE_PUBLIC_EVIDENCE).toBe("暂无可靠公开证据");
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
