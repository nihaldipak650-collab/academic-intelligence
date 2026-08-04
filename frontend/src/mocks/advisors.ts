import type { PublicationStatus, V104Candidate } from "../types/advisor";

const source = (value: string | null, valueEn: string | null = null) => ({
  value,
  value_en: valueEn,
  source_url: null,
  last_verified_at: "2026-08-02",
  missing_status: value ? "available" : "no_public_information",
});

const fact = (text: string, ids = ["E1"]) => ({
  text,
  evidence_status: "verified",
  confidence: "High",
  source_urls: [],
  evidence_ids: ids,
  evidence_lane: "public_fact",
  no_evidence_reason: null,
});

const synthesis = (text: string, ids = ["E1"]) => ({
  text,
  evidence_status: "partially_verified",
  confidence: "Medium",
  source_urls: [],
  evidence_ids: ids,
  evidence_lane: "ai_synthesis",
  no_evidence_reason: null,
});

interface DemoRecordOptions {
  id: string;
  name: string;
  nameEn: string;
  position: string | null;
  publicRole: string;
  summary: string;
  tags: string[];
  techniques: string[];
  longEvidence?: boolean;
  emptyEvidence?: boolean;
  publicationStatus?: PublicationStatus | "unrecognized";
  includePublicationStatus?: boolean;
  releaseEligible: boolean;
}

function demoCandidate(options: DemoRecordOptions): V104Candidate {
  const publicationStatus = options.publicationStatus ?? "approved";
  const linkedIds = (index = 0) => options.emptyEvidence ? [] : [`E${(index % 2) + 1}`];
  const record: Record<string, unknown> = {
    schema_version: "1.0.4",
    advisor_id: options.id,
    name_zh: source(options.name, options.nameEn),
    institution: source("示例大学"),
    school_or_department: source("生命科学示例学院"),
    position: source(options.position),
    public_roles: [source(options.publicRole)],
    summary: synthesis(options.summary, linkedIds()),
    tags: options.tags,
    search_keywords: [...options.tags, ...options.techniques, options.publicRole],
    research_directions_original: options.tags.map((tag, index) =>
      fact(`围绕${tag}建立可复核的公开研究问题。`, linkedIds(index)),
    ),
    research_directions_plain_language: options.tags.map((tag, index) => ({
      term_original: tag,
      explanation_zh: `这是用于解释${tag}的完全合成说明。`,
      undergraduate_meaning: "可从公开资料的术语与证据对应关系开始理解。",
      evidence_ids: linkedIds(index),
    })),
    research_questions: [
      synthesis("哪些可观测信号能够解释复杂生物过程中的差异？", linkedIds()),
      synthesis("如何通过多层证据验证候选机制并说明其局限？", options.emptyEvidence ? [] : ["E1", "E2"]),
    ],
    main_techniques: options.techniques.map((item, index) =>
      synthesis(item, linkedIds(index)),
    ),
    research_workflow: [
      synthesis("先定义公开问题，再整理证据并记录不确定性。", linkedIds()),
    ],
    featured_public_evidence: options.emptyEvidence
      ? []
      : [
          {
            id: "E1",
            title: options.longEvidence
              ? "一项用于验证超长论文标题、连续英文技术术语与复杂标识符在窄屏容器内安全换行能力的完全合成公开证据示例"
              : "合成公开证据示例：从问题定义到可复核结果",
            year: "2025",
            source_label: "完全合成的本地演示记录",
            source_url: null,
            doi: "10.9999/synthetic-e1",
            confidence: "High",
          },
          {
            id: "E2",
            title: "合成公开证据示例：多方法交叉验证与不确定性说明",
            year: "2024",
            source_label: "完全合成的本地演示记录",
            source_url: null,
            doi: "10.9999/synthetic-e2-with-a-deliberately-long-suffix-for-layout-testing",
            confidence: "Medium",
          },
        ],
    possible_undergraduate_tasks: [
      {
        task: "构建小型文献证据矩阵",
        task_context: "围绕一个边界清楚的公开科学问题整理术语、方法与证据。",
        task_purpose: "练习区分公开事实、分析性归纳和仍需核验的信息。",
        possible_methods: ["文献检索", "字段化记录", "交叉核对"],
        possible_output: "可复核的文献矩阵与局限说明",
        evidence_ids: linkedIds(),
        confidence: "Medium",
        evidence_lane: "ai_synthesis",
        uncertainty_note: "这是合成场景，不代表任何真实课题或安排。",
      },
      {
        task: "复现一个边界明确的数据处理步骤",
        task_context: "使用公开的合成输入完成清洗、可视化和结果检查。",
        task_purpose: "建立可复现工作习惯并理解方法假设。",
        possible_methods: ["数据清洗", "脚本记录", "结果复核"],
        possible_output: "带运行说明的小型复现记录",
        evidence_ids: linkedIds(1),
        confidence: "Medium",
        evidence_lane: "ai_synthesis",
        uncertainty_note: "具体方法、投入和指导方式必须另行核验。",
      },
    ],
    prerequisite_skills: [
      synthesis("能够阅读基础英文摘要并记录不理解的术语。", linkedIds()),
      synthesis("具备基础数据整理、版本记录和研究诚信意识。", linkedIds(1)),
    ],
    learning_cost: synthesis("学习成本取决于公开任务的范围与方法基础。", linkedIds()),
    generic_growth_path: [
      {
        stage: "foundation",
        possible_activities: ["建立术语表", "练习文献记录", "理解数据安全规范"],
        possible_outputs: ["阅读笔记", "问题清单"],
        evidence_ids: linkedIds(),
        confidence: "Medium",
        evidence_lane: "ai_synthesis",
        uncertainty_note: "通用参考，不是培养承诺。",
      },
      {
        stage: "bounded_task",
        possible_activities: ["完成边界任务", "按检查点修订", "记录失败原因"],
        possible_outputs: ["可复核的小型结果"],
        evidence_ids: linkedIds(1),
        confidence: "Medium",
        evidence_lane: "ai_synthesis",
        uncertainty_note: "通用参考，不是培养承诺。",
      },
      {
        stage: "independent_module",
        possible_activities: ["提出小问题", "比较方法", "说明结论边界"],
        possible_outputs: ["结构化汇报", "可复现附件"],
        evidence_ids: linkedIds(),
        confidence: "Medium",
        evidence_lane: "ai_synthesis",
        uncertainty_note: "通用参考，不是培养承诺。",
      },
    ],
    boundary_statement:
      "本页面仅用于演示公开证据的组织方式。所有人物、机构、研究内容与记录均为合成信息，不对应现实主体，也不构成评价、推荐或招募承诺。",
    updated_at: "2026-08-02",
  };
  if (options.includePublicationStatus !== false) record.publication_status = publicationStatus;
  return {
    record,
    validation: {
      release_eligible: options.releaseEligible,
      effective_publication_status: publicationStatus,
    },
  };
}

export const mockCandidates: V104Candidate[] = [
  demoCandidate({ id: "demo-cell-map", name: "示例导师甲", nameEn: "Demo Advisor Alpha", position: "示例教授", publicRole: "合成研究导师角色", summary: "使用合成的细胞图谱与成像场景，演示如何从公开证据理解研究问题。", tags: ["细胞图谱", "成像分析", "发育机制"], techniques: ["显微成像", "细胞标记", "定量图像分析"], releaseEligible: true, publicationStatus: "approved" }),
  demoCandidate({ id: "demo-compute", name: "示例导师乙", nameEn: "Demo Advisor Beta", position: "示例副教授", publicRole: "合成研究导师角色", summary: "以完全合成的数据分析任务展示计算研究中的假设、复现和证据边界。", tags: ["计算生物学", "网络分析", "数据可视化"], techniques: ["统计建模", "可复现分析", "网络推断", "敏感性分析"], releaseEligible: true, publicationStatus: "published", emptyEvidence: true }),
  demoCandidate({ id: "demo-long-record", name: "示例导师丙（超长姓名与跨学科方向布局验证）", nameEn: "Demo Advisor Gamma With A Deliberately Long Display Name", position: null, publicRole: "合成交叉研究导师角色", summary: "通过合成的多尺度生物材料、机器学习与动态系统场景，验证长文本在桌面和移动端的可读性，不表示现实研究主体。", tags: ["跨尺度建模", "合成生物材料", "动态系统", "机器学习辅助分析"], techniques: ["超长技术名称：多尺度时空特征提取与不确定性传播分析", "结构化证据矩阵", "模型对照实验", "可解释性检查"], releaseEligible: true, publicationStatus: "approved", longEvidence: true }),
  demoCandidate({ id: "demo-review", name: "示例审核中记录", nameEn: "Demo Pending Record", position: "示例职位", publicRole: "合成研究导师角色", summary: "此记录用于验证审核中状态不会进入任何公开视图。", tags: ["门禁测试"], techniques: ["拒绝路径"], releaseEligible: false, publicationStatus: "review_pending" }),
  demoCandidate({ id: "demo-ineligible", name: "示例不可发布记录", nameEn: "Demo Ineligible Record", position: "示例职位", publicRole: "合成研究导师角色", summary: "此记录用于验证发布资格为否时不可见。", tags: ["门禁测试"], techniques: ["拒绝路径"], releaseEligible: false, publicationStatus: "approved" }),
  demoCandidate({ id: "demo-missing-status", name: "示例缺失状态记录", nameEn: "Demo Missing Status Record", position: "示例职位", publicRole: "合成研究导师角色", summary: "此记录用于验证缺失发布状态时默认拒绝。", tags: ["门禁测试"], techniques: ["拒绝路径"], releaseEligible: true, includePublicationStatus: false }),
  demoCandidate({ id: "demo-unknown-status", name: "示例未知状态记录", nameEn: "Demo Unknown Status Record", position: "示例职位", publicRole: "合成研究导师角色", summary: "此记录用于验证未知发布状态时默认拒绝。", tags: ["门禁测试"], techniques: ["拒绝路径"], releaseEligible: true, publicationStatus: "unrecognized" }),
];

export const blockedMockIds = ["demo-review", "demo-ineligible", "demo-missing-status", "demo-unknown-status"];
