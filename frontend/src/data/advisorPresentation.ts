import type {
  Advisor,
  AdvisorContact,
  AdvisorFreshness,
  EvidenceStatus,
  ResearchTermExplanation,
  UndergraduateTask,
} from "../types/advisor";

export const MISSING_PUBLIC_INFO = "暂无公开信息";
export const PENDING_VERIFICATION = "待核验";
export const NO_RELIABLE_PUBLIC_EVIDENCE = "暂无可靠公开证据";

const termGlossary: Record<string, string> = {
  疾病遗传: "研究遗传变异与疾病发生、表现差异之间的关系。",
  分子机制: "追踪基因、RNA、蛋白质或细胞过程如何共同造成某种现象。",
  生物信息: "使用计算工具整理和分析测序、表达或临床数据。",
  细胞与动物实验: "借助细胞或动物模型验证生物学问题，观察整体与局部变化。",
  造血调控: "研究血细胞如何产生、分化并维持正常功能。",
  血液肿瘤: "研究发生在血液及造血系统中的肿瘤及其生物学机制。",
  单细胞: "在单个细胞尺度观察不同细胞的状态和差异。",
  结构生物学: "研究蛋白质等生物分子的三维结构以及结构与功能的关系。",
  蛋白质: "关注蛋白质的表达、结构、相互作用与生物学功能。",
  "Cryo-EM": "冷冻电子显微镜技术，用于观察生物大分子的三维结构。",
  抗噬菌体系统: "研究细菌抵抗噬菌体感染的分子防御机制。",
  神经发育障碍: "研究神经系统发育过程异常及其与疾病表现的联系。",
  孤独症: "围绕孤独症相关遗传因素、神经发育和生物学机制开展研究。",
  应激颗粒: "细胞受到压力时形成的RNA与蛋白质聚集结构。",
  相分离: "研究生物分子在细胞内形成不同凝聚状态的过程。",
  基因组学: "从全基因组尺度研究遗传变异、基因表达及其关联。",
  健康信息行为: "研究人们如何寻找、理解和使用健康信息。",
  框架效应: "研究同一信息的不同表达方式如何影响理解和决策。",
  公共卫生信息化: "使用数字系统和数据方法支持公共卫生管理与研究。",
  舆情分析: "分析公开文本中的主题、情绪和传播变化。",
  医学数据挖掘: "从医疗或健康数据中寻找可验证的模式与关联。",
  高度近视: "研究高度近视的遗传基础、分子机制与相关眼部表型。",
  眼科遗传学: "研究遗传变异与眼科疾病之间的关系。",
  三代长读长测序: "使用较长的DNA读段识别复杂结构和遗传变异。",
  "Minigene剪接": "用简化基因载体验证遗传变异是否影响RNA剪接。",
  昼夜节律: "研究生物体接近24小时的周期性调控过程。",
  动物模型: "使用动物中的可控模型研究疾病或生理机制。",
  "CHH遗传学": "研究先天性低促性腺激素性性腺功能减退的遗传基础。",
  电生理与突触: "通过电信号记录研究神经元活动和突触功能。",
};

export function getAdvisorContact(advisor?: Advisor): AdvisorContact {
  return {
    officialEmail: advisor?.contact?.officialEmail ?? null,
    officialPhone: advisor?.contact?.officialPhone ?? null,
    officialHomepage: advisor?.contact?.officialHomepage ?? null,
    laboratoryAddress: advisor?.contact?.laboratoryAddress ?? null,
    sourceUrl: advisor?.contact?.sourceUrl ?? null,
  };
}

export function getAdvisorFreshness(advisor: Advisor): AdvisorFreshness {
  return {
    lastVerifiedAt: advisor.lastUpdated,
    dataStatus: advisor.lastUpdated ? "已核验" : "部分信息待补充",
    opportunityStatus: PENDING_VERIFICATION,
  };
}

function taskEvidenceStatus(value: string): EvidenceStatus {
  if (value.includes("Confidence: High")) return "High";
  if (
    value.includes("Confidence: Medium") ||
    value.includes("Confidence: Low–Medium") ||
    value.includes("Confidence: Low-Medium")
  ) {
    return "Medium";
  }
  return "No Evidence";
}

export function getPublicUndergraduateTasks(
  advisor: Advisor,
): UndergraduateTask[] {
  // The two legacy reports mix academic analysis and individual experience in
  // the same generated summary. The 1.0 public layer therefore exposes no task
  // items from those mixed summaries; source data and reports remain untouched.
  if (advisor.hasExperienceEvidence) return [];

  return advisor.quickSummary.undergraduatePaths.map((description, index) => ({
    id: `${advisor.id}-task-${index + 1}`,
    title: `可能任务线索 ${index + 1}`,
    description,
    background: "该线索来自现有审核报告中的公开学术证据整理。",
    whyItMatters: "用于帮助本科生理解研究问题，不代表实验室的固定安排。",
    methods: [],
    expectedOutput: PENDING_VERIFICATION,
    evidenceStatus: taskEvidenceStatus(description),
    evidenceLane: "ai_summary",
  }));
}

export function getResearchTermExplanations(
  advisor: Advisor,
): ResearchTermExplanation[] {
  return advisor.tags.slice(0, 5).map((term) => ({
    term,
    plainLanguage:
      termGlossary[term] ??
      "这是公开资料中的研究方向标签，具体研究范围需结合完整报告理解。",
    undergraduateMeaning:
      "可用来判断自己是否愿意进一步学习相关基础；实际课题、方法和参与方式仍需联系导师核验。",
  }));
}

export function publicEvidenceLabel() {
  return "公开学术证据 + AI整理";
}
