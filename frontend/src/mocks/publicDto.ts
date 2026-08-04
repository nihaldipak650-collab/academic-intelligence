import type { PublicAdvisorDtoEnvelope } from "../types/advisor";

const E1 = "E1";
const SYNTHETIC_DOI = "10.9999/synthetic-approved-with-a-deliberately-long-layout-suffix";

export const syntheticPublicDto: PublicAdvisorDtoEnvelope = {
  schemaVersion: 1,
  dtoVersion: "1.0.4",
  source: "approved-public-advisor-contract",
  advisorCount: 1,
  advisors: [{
    dtoVersion: "1.0.4",
    id: "synthetic-approved",
    nameZh: "合成批准导师",
    nameEn: "Synthetic Approved Advisor",
    institution: "合成大学",
    schoolOrDepartment: "生命科学合成学院",
    position: "合成教师",
    publicRoles: ["合成研究导师"],
    summary: { text: "这是一条只用于前端安全 DTO 回归的合成研究摘要。", evidenceIds: [E1] },
    researchDirections: [{ text: "合成公开研究方向。", evidenceIds: [E1] }],
    researchDirectionsPlain: [{ term: "合成方向", explanation: "仅用于回归测试的公开解释。", undergraduateMeaning: "可从公开证据复核开始。", evidenceIds: [E1] }],
    researchQuestions: [{ text: "合成科学问题如何被公开证据支持？", evidenceIds: [E1] }],
    mainTechniques: [{ text: "合成公开数据整理技术。", evidenceIds: [E1] }],
    researchWorkflow: [{ text: "提出问题并复核公开 Evidence。", evidenceIds: [E1] }],
    possibleUndergraduateTasks: [{ task: "公开证据整理", context: "合成公开论文", purpose: "训练可追溯整理", methods: ["文献阅读"], output: "公开证据表", uncertaintyNote: "不代表真实实验室安排。", evidenceIds: [E1] }],
    prerequisiteSkills: [{ text: "基础文献阅读。", evidenceIds: [E1] }],
    learningCost: { text: "学习成本取决于公开任务边界。", evidenceIds: [E1] },
    genericGrowthPath: [{ stage: "foundation", possibleActivities: ["阅读公开论文"], possibleOutputs: ["文献笔记"], uncertaintyNote: "仅为通用学习场景。", evidenceIds: [E1] }],
    tags: ["公开学术"],
    searchKeywords: ["合成关键词", "证据整理"],
    publicEvidence: [{ evidenceId: E1, title: "一项用于验证超长公开 Evidence 题名在窄屏容器中完整换行且不会静默截断的完全合成记录", year: 2025, doi: SYNTHETIC_DOI, sourceUrl: `https://doi.org/${SYNTHETIC_DOI}` }],
    boundaryStatement: "仅展示合成的公开学术证据，不推断实验室内部情况。",
    lastUpdated: "2026-08-03",
    publicationStatus: "approved",
    releaseEligible: true,
    schemaVersion: "1.0.4",
    evidenceType: "academic_only",
    hasExperienceEvidence: false,
    experienceCaseCount: 0,
  }],
};
