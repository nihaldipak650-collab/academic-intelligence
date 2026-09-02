/**
 * 生命科学学院保研 — Prototype A/B 共享数据
 * 来源：《生命科学学院保研证据交接包 v0.2》
 * 不得在此文件编造政策事实；UNRESOLVED 保持原样。
 */

export type UserSourceLabel =
  | "官方政策"
  | "老师确认"
  | "学长学姐经验"
  | "经验文章"
  | "AI整理";

export type AnswerStatus = "VERIFIED" | "PARTIAL" | "EXPERIENCE" | "PENDING" | "UNRESOLVED";

/** 内部审核字段，不在公共 UI 展示 */
export type CrystalReview = "PASS" | "待二审" | null;

export type SourceAvailability = "full" | "referenced" | "title-confirmed";

export interface OfficialSource {
  id: string;
  title: string;
  citationShort: string;
  publisher: string;
  publishedDate: string;
  cohort: string;
  url: string | null;
  overviewBullets?: string[];
  localPdfPath?: string | null;
  archiveNote?: string;
  availability: SourceAvailability;
  crystalReview: CrystalReview;
  humanVerification: "待完成" | "已完成";
}

export type QuickFactVariant = "quota" | "special" | "entry" | "retake";

export interface QuickFactItem {
  id: string;
  label: string;
  value: string;
  unit?: string;
  meaning: string;
  variant: QuickFactVariant;
  sourceIds: string[];
}

export interface EvidenceExcerpt {
  sourceId: string;
  sectionTitle?: string;
  originalText: string;
  highlightedText?: string;
  plainLanguage: string;
  pending?: boolean;
}

export interface QuestionAnswer {
  id: string;
  question: string;
  shortAnswer: string;
  detail: string;
  evidenceExcerpt: EvidenceExcerpt;
  cautions?: string[];
  editorNote?: string;
  answerStatus: AnswerStatus;
  sourceIds: string[];
  userSourceLabel: UserSourceLabel;
}

export interface PagePrimarySource {
  order: string;
  sourceId: string;
  publisherLabel: string;
  documentTitle: string;
  roleLabel: string;
}

export interface TocItem {
  id: string;
  label: string;
}

export interface TocSection {
  id: string;
  label: string;
  children?: TocItem[];
}

export interface SourceArchiveEntry {
  sourceId: string;
  usageTags: string[];
}

export interface SourceArchiveGroup {
  id: string;
  label: string;
  countLabel: string;
  entries: SourceArchiveEntry[];
  defaultOpen?: boolean;
  gapNote?: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  status: string;
}

export interface YearRecord {
  cohort: string;
  year: number;
  status: "resolved" | "unresolved" | "partial";
  ordinaryQuota?: { bioScience?: number; bioinformatics?: number };
  otherQuota?: Record<string, number | string | string[]>;
  publicResultCount?: number | null;
  execution?: {
    bioScience?: string[];
    bioinformatics?: string[];
    general?: string[];
  };
  notes: string;
  sourceIds: string[];
}

export interface GrowthStage {
  id: string;
  grade: string;
  title: string;
  shouldKnow: string[];
  canStart: string[];
  misconceptions: string[];
  relatedPolicies: string[];
  editorNote?: string;
  experienceStatus: "available" | "pending";
  answerStatus: AnswerStatus;
}

export interface NavEntry {
  id: string;
  number: string;
  title: string;
  description: string;
  sectionId: string;
}

export const SOURCE_AVAILABILITY_LABEL: Record<SourceAvailability, string> = {
  full: "完整官方原文",
  referenced: "官方文件转引",
  "title-confirmed": "标题已确认，正文待恢复",
};

export const BAOYAN_META = {
  college: "中南大学生命科学学院",
  moduleTitle: "保研导航",
  cohortFocus: "2026届",
  heroTitle: "查政策、看往年、找经验，都从这里进。",
  heroSubtitle:
    "绩点、科研、竞赛、历年名单、学长学姐经验等，原本散落在官网、文件和不同经验来源里的内容，现在可以先从这里找到入口。",
  heroBoundary: "这里只帮你把信息找齐，不替你做决定。",
  statusItems: [
    { label: "2020–2026 历年资料持续补齐" },
    { label: "官方原文与出处已标注" },
  ],
};

export const BAOYAN_TOC: TocSection[] = [
  {
    id: "section-eligibility",
    label: "保研条件",
    children: [
      { id: "qa-retake", label: "补考" },
      { id: "qa-fail", label: "挂科" },
      { id: "qa-entry-bio", label: "生科排名" },
      { id: "qa-entry-info", label: "生信排名" },
      { id: "qa-english", label: "四六级" },
    ],
  },
  {
    id: "section-growth",
    label: "现在能做什么",
    children: [
      { id: "grade-grade-1", label: "大一" },
      { id: "grade-grade-2", label: "大二" },
      { id: "grade-grade-3", label: "大三" },
      { id: "grade-grade-4", label: "大四" },
    ],
  },
  {
    id: "section-evaluation",
    label: "科研 / 竞赛 / 论文",
    children: [
      { id: "qa-score-structure", label: "保研总成绩" },
      { id: "qa-paper", label: "论文" },
      { id: "qa-project", label: "大创 / 科研项目" },
      { id: "qa-competition", label: "竞赛" },
      { id: "qa-patent", label: "专利" },
      { id: "qa-sci-required", label: "SCI" },
    ],
  },
  {
    id: "section-history",
    label: "往年情况",
    children: [
      { id: "history-years", label: "历年名额" },
      { id: "history-execution", label: "增补 / 放弃 / 递补" },
      { id: "history-tabs", label: "2020–2026" },
    ],
  },
  {
    id: "section-roadmap",
    label: "后续补充",
  },
];

export const SOURCE_ARCHIVE_GROUPS: SourceArchiveGroup[] = [
  {
    id: "archive-2026",
    label: "2026 当前规则",
    countLabel: "3 份",
    defaultOpen: true,
    entries: [
      {
        sourceId: "A-2026-LIFE-RULES",
        usageTags: [
          "2026 届入围线（生科 60% / 生信 35%）",
          "补考 / 重修按 60 分计",
          "推免遴选总成绩与专项评价",
          "论文 / 课题 / 竞赛 / 专利加分",
        ],
      },
      {
        sourceId: "A-2026-SCHOOL-NOTICE",
        usageTags: [
          "2026 届各专业推免指标分配",
          "生科 20 / 生信 5 / 工程硕博 2",
          "补考 / 重修按 60 分计（校级依据）",
        ],
      },
      {
        sourceId: "A-2021-107",
        usageTags: ["推免资格上位框架", "专项评价指导意见（学院细则转引）", "四六级 / 竞赛等上位原则"],
      },
    ],
  },
  {
    id: "archive-2025",
    label: "2025 历年执行",
    countLabel: "2 份",
    entries: [
      {
        sourceId: "A-2025-LIFE-RULES",
        usageTags: ["2025 届普通指标：生科 17 / 生信 4", "当年推免规则对照样本"],
      },
      {
        sourceId: "A-2025-LIFE-RANKING",
        usageTags: [
          "生科普通指标 17",
          "第 15 名放弃，普通拟推荐递至第 18 名",
          "生信普通拟推荐第 1–4 名",
          "第 7 名为军科院补偿指标",
        ],
      },
    ],
  },
  {
    id: "archive-2023",
    label: "2023 历年执行",
    countLabel: "3 份",
    entries: [
      {
        sourceId: "A-2023-LIFE-RULES",
        usageTags: ["2023 届推免实施办法", "遴选总成绩构成"],
      },
      {
        sourceId: "A-2023-LIFE-LIST",
        usageTags: ["初始拟推荐 21 人", "排名不分先后"],
      },
      {
        sourceId: "A-2023-LIFE-SUPPLEMENT",
        usageTags: ["学校增补 2 人", "支持学科 / 专业建设", "升学率奖励增补"],
      },
    ],
  },
  {
    id: "archive-2021",
    label: "2021",
    countLabel: "2 份",
    entries: [
      {
        sourceId: "A-2021-LIFE-LIST",
        usageTags: ["首批公示 15 人", "含学科竞赛专项与基地班类型"],
      },
      {
        sourceId: "A-2021-LIFE-SUPPLEMENT",
        usageTags: ["补充公示（标题已确认）"],
      },
    ],
  },
  {
    id: "archive-2020",
    label: "2020",
    countLabel: "2 份",
    entries: [
      {
        sourceId: "A-2020-LIFE-RULES",
        usageTags: ["2020 届普通指标：生科 7 / 生信 3", "补考 / 重修按 60 分计"],
      },
      {
        sourceId: "A-2020-LIFE-LIST",
        usageTags: ["公示 12 人", "含基地班与学科竞赛专项"],
      },
    ],
  },
  {
    id: "archive-gaps",
    label: "公开档案缺口",
    countLabel: "2 届",
    gapNote:
      "2022 届、2024 届：生命科学学院普通推免年度细则 / 执行名单的公开档案暂未定位；不代表当年未公示。2021 届另有补充公示正文与人数尚未恢复。107 号文件全文 PDF 本包未持有，仅通过学院细则转引。",
    entries: [],
  },
];

export const BAOYAN_ROADMAP: RoadmapItem[] = [
  { id: "roadmap-interviews", title: "学长学姐真实保研经历", status: "采访中" },
  { id: "roadmap-timeline", title: "从大一到推免的完整时间线", status: "整理中" },
  { id: "roadmap-camp", title: "夏令营 / 预推免准备清单", status: "待补充" },
  { id: "roadmap-materials", title: "申请材料与常见证明", status: "待补充" },
  { id: "roadmap-archives", title: "更多历年推免档案", status: "持续补齐" },
];

export const NAV_ENTRIES: NavEntry[] = [
  {
    id: "entry-eligibility",
    number: "01",
    title: "我能不能保研？",
    description: "先看看成绩、排名、挂科、补考这些基本条件",
    sectionId: "section-eligibility",
  },
  {
    id: "entry-prepare",
    number: "02",
    title: "我现在能做什么？",
    description: "大一 / 大二 / 大三，分别可以先做哪些准备",
    sectionId: "section-growth",
  },
  {
    id: "entry-evaluation",
    number: "03",
    title: "科研、竞赛、论文怎么算？",
    description: "看看学院怎么评价，哪些能加分，官方依据在哪里",
    sectionId: "section-evaluation",
  },
  {
    id: "entry-history",
    number: "04",
    title: "往年保研是什么情况？",
    description: "看看历年名额、名单，以及实际出现过的变化",
    sectionId: "section-history",
  },
];

export const OFFICIAL_SOURCES: Record<string, OfficialSource> = {
  "A-2026-SCHOOL-NOTICE": {
    id: "A-2026-SCHOOL-NOTICE",
    title: "关于做好2026届优秀应届本科毕业生免试攻读硕士学位研究生推荐工作的通知",
    citationShort: "中南大学《关于做好2026届优秀应届本科毕业生免试攻读硕士学位研究生推荐工作的通知》",
    publisher: "中南大学本科生院",
    publishedDate: "2025-09-12",
    cohort: "2026届",
    url: null,
    localPdfPath: "/baoyan/sources/2026-school-notice.pdf",
    overviewBullets: [
      "各专业推免指标分配（含工程硕博等类型）",
      "补考、重修合格课程按 60 分计入学业成绩加权平均",
      "推荐结果公示不少于 7 日",
      "校级推免工作流程与时间安排",
    ],
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2026-LIFE-RULES": {
    id: "A-2026-LIFE-RULES",
    title: "生命科学学院2026届优秀应届本科毕业生免试攻读硕士学位研究生推荐工作实施办法",
    citationShort: "生命科学学院《2026届推免工作实施办法》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2025-09-14",
    cohort: "2026届",
    url: "https://life.csu.edu.cn/info/1034/3403.htm",
    overviewBullets: [
      "推免资格与入围条件（含挂科、违纪等限制）",
      "学业成绩加权平均计算办法",
      "推免遴选总成绩构成（学业 + 专项）",
      "论文、科研课题、学科竞赛、专利等专项评价办法",
      "学院评价加分（含德育）上限",
      "公示监督与材料提交要求",
    ],
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2025-LIFE-RULES": {
    id: "A-2025-LIFE-RULES",
    title: "生命科学学院2025届优秀应届本科毕业生免试攻读硕士学位研究生推荐工作实施办法",
    citationShort: "生命科学学院《2025届推免工作实施办法》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2024-09-17",
    cohort: "2025届",
    url: "https://life.csu.edu.cn/info/1034/3378.htm",
    overviewBullets: [
      "2025 届推免资格与入围条件",
      "学业成绩与专项评价计算办法",
      "各类加分材料审核要求",
    ],
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2025-LIFE-RANKING": {
    id: "A-2025-LIFE-RANKING",
    title: "生命科学学院2025届优秀应届本科毕业生免试攻读硕士学位研究生综合排名公示",
    citationShort: "生命科学学院《2025届推免综合排名公示》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2024-09-20",
    cohort: "2025届",
    url: "https://life.csu.edu.cn/info/1034/3380.htm",
    overviewBullets: [
      "2025 届综合排名公示名单",
      "各学生学业与专项成绩明细（公开样本）",
    ],
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2023-LIFE-SUPPLEMENT": {
    id: "A-2023-LIFE-SUPPLEMENT",
    title: "增补名单：中南大学生命科学学院2023届优秀应届本科毕业生免试攻读硕士学位研究生拟推荐名单公示",
    citationShort: "生命科学学院《2023届推免增补名单公示》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2022-09-14",
    cohort: "2023届",
    url: "https://life.csu.edu.cn/info/1034/3318.htm",
    overviewBullets: [
      "学校增补推免名额的执行情况",
      "增补后的拟推荐名单",
    ],
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2021-107": {
    id: "A-2021-107",
    title: "中南大学推荐优秀应届本科毕业生免试攻读硕士学位研究生资格的管理办法（试行）",
    citationShort: "中南大学《推免资格管理办法（试行）》（107号）",
    publisher: "中南大学（本科生院）",
    publishedDate: "2021",
    cohort: "上位依据",
    url: "https://csuspa.csu.edu.cn/info/1003/7232.htm",
    archiveNote: "本包未持有 107 号全文 PDF；页面链接为附件引用入口，学院细则中转引其上位框架。",
    overviewBullets: [
      "推免资格基本条件（校级上位框架）",
      "专项评价指导意见",
      "学科竞赛等项目加分的总体原则",
    ],
    crystalReview: null,
    humanVerification: "待完成",
    availability: "referenced",
  },
  "A-2023-LIFE-RULES": {
    id: "A-2023-LIFE-RULES",
    title: "生命科学学院2023届优秀应届本科毕业生免试攻读硕士学位研究生推荐工作实施办法",
    citationShort: "生命科学学院《2023届推免工作实施办法》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2022-04-22",
    cohort: "2023届",
    url: "https://life.csu.edu.cn/info/1034/3316.htm",
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2023-LIFE-LIST": {
    id: "A-2023-LIFE-LIST",
    title: "生命科学学院2023届优秀应届本科毕业生免试攻读硕士学位研究生拟推荐名单",
    citationShort: "生命科学学院《2023届推免拟推荐名单》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2022-09-14",
    cohort: "2023届",
    url: "https://life.csu.edu.cn/info/1034/3317.htm",
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2021-LIFE-LIST": {
    id: "A-2021-LIFE-LIST",
    title: "生命科学学院2021年优秀应届本科毕业生免试攻读硕士学位研究生拟推荐名单公示",
    citationShort: "生命科学学院《2021届推免拟推荐名单》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2020-09-25",
    cohort: "2021届",
    url: "https://life.csu.edu.cn/info/1034/3237.htm",
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2021-LIFE-SUPPLEMENT": {
    id: "A-2021-LIFE-SUPPLEMENT",
    title: "关于补充生命科学学院2021年优秀应届本科毕业生免试攻读硕士学位研究生拟推荐名单公示",
    citationShort: "生命科学学院《2021届推免补充名单公示》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2020-09-28",
    cohort: "2021届",
    url: null,
    archiveNote: "补充公示标题已确认；正文与补充人数尚未从公开档案恢复。",
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "title-confirmed",
  },
  "A-2020-LIFE-RULES": {
    id: "A-2020-LIFE-RULES",
    title: "生命科学学院2020年优秀应届本科毕业生免试攻读硕士学位研究生推荐工作实施办法",
    citationShort: "生命科学学院《2020届推免工作实施办法》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2019-09-10",
    cohort: "2020届",
    url: "https://life.csu.edu.cn/info/1034/3221.htm",
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
  "A-2020-LIFE-LIST": {
    id: "A-2020-LIFE-LIST",
    title: "生命科学学院2020年优秀应届本科毕业生免试攻读硕士学位研究生名单公示",
    citationShort: "生命科学学院《2020届推免名单公示》",
    publisher: "中南大学生命科学学院",
    publishedDate: "2019-09-11",
    cohort: "2020届",
    url: "https://life.csu.edu.cn/info/1034/3222.htm",
    crystalReview: "PASS",
    humanVerification: "待完成",
    availability: "full",
  },
};

export const QUICK_FACTS_2026: QuickFactItem[] = [
  {
    id: "qf-bio-quota",
    label: "生物科学",
    value: "20",
    unit: "普通推免名额",
    meaning: "2026 届生科，普通推免一共 20 个名额。",
    variant: "quota",
    sourceIds: ["A-2026-SCHOOL-NOTICE", "A-2026-LIFE-RULES"],
  },
  {
    id: "qf-info-quota",
    label: "生物信息学",
    value: "5",
    unit: "普通推免名额",
    meaning: "2026 届生信，普通推免一共 5 个名额。",
    variant: "quota",
    sourceIds: ["A-2026-SCHOOL-NOTICE", "A-2026-LIFE-RULES"],
  },
  {
    id: "qf-eng-quota",
    label: "工程硕博",
    value: "2",
    unit: "专项名额",
    meaning: "这 2 个单独计算，不和普通推免名额混在一起。",
    variant: "special",
    sourceIds: ["A-2026-SCHOOL-NOTICE", "A-2026-LIFE-RULES"],
  },
  {
    id: "qf-entry",
    label: "入围范围",
    value: "生科前 60%\n生信前 35%",
    meaning: "这是参加学院推免遴选的「入场范围」，不是最后保研到第几名。",
    variant: "entry",
    sourceIds: ["A-2026-LIFE-RULES"],
  },
  {
    id: "qf-retake",
    label: "补考 / 重修",
    value: "60 分",
    unit: "计入推免排名",
    meaning: "补考或重修合格后，推免排名这门课按 60 分算。",
    variant: "retake",
    sourceIds: ["A-2026-SCHOOL-NOTICE", "A-2026-LIFE-RULES"],
  },
];

export const ELIGIBILITY_QUESTIONS: QuestionAnswer[] = [
  {
    id: "qa-retake",
    question: "补考会影响保研吗？",
    shortAnswer: "会",
    detail: "补考或重修合格课程，在推免排名时按 60 分计算。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "（二）学业成绩入围条件",
      originalText:
        "推免生的成绩根据在校学习期间文化课（含全校性选修课）加权平均裸分（不含各类政策性加分）成绩按专业进行排名，补考和重修合格的课程成绩按60分计算。",
      highlightedText: "补考和重修合格的课程成绩按60分计算",
      plainLanguage:
        "简单说，补考或重修后来哪怕考到更高分，在推免排名这套计算里，这门课还是按 60 分算。",
    },
    cautions: [
      "补考合格不等于一定失去推免资格，但它可能明显拉低你的学业排名。",
      "入围线不等于最终推免线，最终按综合排名与当年指标从高到低入选。",
    ],
    answerStatus: "VERIFIED",
    sourceIds: ["A-2026-SCHOOL-NOTICE", "A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-fail",
    question: "挂科了还能保研吗？",
    shortAnswer: "一般不能",
    detail:
      "有不及格课程者不得推荐。全校性选修课已达到 6 个学分且及格的，不影响其推免资格。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "（二）学业成绩入围条件",
      originalText:
        "有不及格课程者不得推荐（全校性选修课已达到 6个学分且及格的，不影响其推免资格）。",
      highlightedText: "有不及格课程者不得推荐",
      plainLanguage:
        "有一门必修课不及格，一般就不能获得推免推荐资格；全校性选修课凑够 6 学分且都及格的情况，文件里单独说明不影响。",
    },
    cautions: ["具体课程认定以教务系统记录为准，有疑问先核对成绩单。"],
    answerStatus: "VERIFIED",
    sourceIds: ["A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-entry-bio",
    question: "生科排到多少，才能进入候选范围？",
    shortAnswer: "前 60%",
    detail: "学业成绩加权排名前 60% 为入围条件，不等于最终获得推免资格。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "（二）学业成绩入围条件",
      originalText: "学生学业成绩入围条件：生物科学加权排名前60%，生物信息学加权排名前35%。",
      highlightedText: "生物科学加权排名前60%",
      plainLanguage:
        "生科专业要排到年级前 60%，才有资格进入学院后续的推免遴选范围；这不等于已经拿到推免名额。",
    },
    cautions: ["入围只是第一步，最终能否获得推免资格还要看综合排名和当年指标。"],
    answerStatus: "VERIFIED",
    sourceIds: ["A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-entry-info",
    question: "生信排到多少，才能进入候选范围？",
    shortAnswer: "前 35%",
    detail: "学业成绩加权排名前 35% 为入围条件。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "（二）学业成绩入围条件",
      originalText: "学生学业成绩入围条件：生物科学加权排名前60%，生物信息学加权排名前35%。",
      highlightedText: "生物信息学加权排名前35%",
      plainLanguage:
        "生信专业要排到年级前 35%，才有资格进入学院后续的推免遴选范围；这不等于已经拿到推免名额。",
    },
    answerStatus: "VERIFIED",
    sourceIds: ["A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-english",
    question: "四级 / 六级有硬性分数线吗？",
    shortAnswer: "细则未写具体分数",
    detail:
      "2026 届学院细则要求外语能力达到学校授予学士学位要求，未规定六级具体分数。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "（一）必备条件",
      originalText: "外语能力达到学校授予学士学位要求。",
      plainLanguage:
        "学院只要求满足学士学位的外语条件，没有另设统一的四六级高分门槛。",
    },
    editorNote:
      "如果准备申请外校，英语成绩通常越高越有优势。学院推免资格要求和目标院校申请竞争力是两件不同的事。",
    cautions: ["申请外校时，目标院校可能有各自的英语要求，需单独查阅。"],
    answerStatus: "PARTIAL",
    sourceIds: ["A-2026-LIFE-RULES", "A-2021-107"],
    userSourceLabel: "官方政策",
  },
];

export const EVALUATION_QUESTIONS: QuestionAnswer[] = [
  {
    id: "qa-score-structure",
    question: "保研总成绩怎么算？",
    shortAnswer: "学业 + 专项",
    detail:
      "学院正式文件中的「推免遴选总成绩」由学业成绩与专项评价成绩相加组成。学业成绩满分 100 分。专项评价各类型累计不超过 10 分（退役复学学生除外），学院评价加分（含德育）不超过 2.5 分。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "五、合理确定遴选总成绩",
      originalText:
        "推免生遴选总成绩由学业成绩和专项评价成绩相加组成。学业成绩为最基础的遴选指标，满分100分。[…] 各类型专项评价加分累计不超过10分（不含退役复学学生），其中学院评价加分（含德育分）不超过2.5分，德育分最高不超过1分。",
      highlightedText: "推免生遴选总成绩由学业成绩和专项评价成绩相加组成",
      plainLanguage:
        "正式文件里叫「推免遴选总成绩」：先把学业成绩算满 100 分打底，再叠加竞赛、论文、课题等专项加分，但专项加分有上限。",
    },
    answerStatus: "VERIFIED",
    sourceIds: ["A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-paper",
    question: "论文能加分吗？",
    shortAnswer: "可以",
    detail:
      "已公开发表（见刊）的论文可按期刊层级与作者顺序计学院评价分；需接受专家审核、查重与答辩。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "3.论文",
      originalText:
        "在校学习期间，公开发表（见刊）高水平学术论文和学术作品，经专家审核小组鉴定，按如下等级加分：[…] （1）SCI论文第一或通讯作者加0.5分/篇，共同第一作者加0.5分/人数，第二、三、四作者分别加0.2、0.15、0.1分；",
      highlightedText: "公开发表（见刊）高水平学术论文和学术作品，经专家审核小组鉴定",
      plainLanguage:
        "见刊论文可以按期刊层级和作者顺位加分，但必须先过专家审核小组鉴定，还要查重和本人答辩。",
    },
    cautions: ["未通过审核鉴定的论文不得纳入综合成绩。"],
    answerStatus: "PARTIAL",
    sourceIds: ["A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-project",
    question: "大创 / 科研项目能加分吗？",
    shortAnswer: "可以",
    detail:
      "主持国家级 0.5、省级 0.3、校级 0.1；参与者按对应项 80% 加分；未结题者须通过中期检查。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "2.课题",
      originalText:
        "以主持人身份获得大学生创新创业训练项目、自由探索计划项目、研究性学习和创新性实验计划项目以及其他由政府机构设置的科研资助立项者（未结题者须通过中期检查）。[…] 国家级 0.5 […] 省级 0.3 […] 所有类别课题和大创等项目参与者按照对应项的80%加分，同一项目取最高等级",
      highlightedText:
        "以主持人身份获得大学生创新创业训练项目、自由探索计划项目、研究性学习和创新性实验计划项目",
      plainLanguage:
        "大创、科研课题等可以加分：主持人按国家级 / 省级 / 校级对应分值，参与者按 80% 计，同一项目只取最高等级；没结题的得先过中期检查。",
    },
    answerStatus: "VERIFIED",
    sourceIds: ["A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-competition",
    question: "竞赛能加分吗？",
    shortAnswer: "可以",
    detail: "学科竞赛由本科生院审核公示；学院细则另有学院评价加分表。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "1.学科竞赛",
      originalText:
        "学科竞赛获奖奖项由本科生院审核公示；[…] 在校学习期间，在学科竞赛（含“挑战杯”）、体育竞赛、文艺竞赛中获奖者学院评价加分：",
      highlightedText: "在学科竞赛（含“挑战杯”）、体育竞赛、文艺竞赛中获奖者学院评价加分",
      plainLanguage:
        "学科竞赛可以加分，但奖项要先经本科生院审核公示；学院细则里按竞赛级别有对应分值表。",
    },
    cautions: [
      "107 号文件对部分竞赛项目规定「每年最多四人加分」，具体执行口径建议向学院老师确认。",
    ],
    answerStatus: "PARTIAL",
    sourceIds: ["A-2026-LIFE-RULES", "A-2021-107"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-patent",
    question: "专利能加分吗？",
    shortAnswer: "可以",
    detail:
      "发明专利 0.4、实用新型 0.3、外观设计 0.2；按作者排序设置权重系数，前三名依次 1、0.6、0.4，第四名及以后 0.2。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "4.专利",
      originalText:
        "在校学习期间，由国家知识产权局颁发的各类型专利。[…] 发明专利 0.4 […] 实用新型专利 0.3 […] 外观设计专利 0.2 […] 依照作者排序前3名权重系数依次为1、0.6、0.4，第四名及以后权重系数均为0.2。",
      highlightedText: "由国家知识产权局颁发的各类型专利",
      plainLanguage:
        "国家知识产权局颁发的专利可以加分，不同类型专利基础分值不同，还要按你在作者名单里的顺位乘权重。",
    },
    answerStatus: "VERIFIED",
    sourceIds: ["A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
  {
    id: "qa-sci-required",
    question: "SCI 是保研的硬性要求吗？",
    shortAnswer: "在目前核到的 2026 届必备条件中，没有看到 SCI 被列为硬性必备条件。",
    detail:
      "2026 届学院细则的必备条件未要求发表 SCI；论文属于后续专项评价中的可选加分项，且有严格审核要求。",
    evidenceExcerpt: {
      sourceId: "A-2026-LIFE-RULES",
      sectionTitle: "（一）必备条件",
      originalText:
        "4.刻苦学习，成绩优秀，学术研究兴趣浓厚，有较强的创新精神和创新意识，须完成所在专业培养方案前3年所有教学环节并取得合格成绩。",
      plainLanguage:
        "SCI 不是 2026 届推免资格的硬性入门条件，但论文可以作为后续专项评价的一部分。",
    },
    answerStatus: "VERIFIED",
    sourceIds: ["A-2026-LIFE-RULES"],
    userSourceLabel: "官方政策",
  },
];

export const YEAR_HISTORY: YearRecord[] = [
  {
    cohort: "2020届",
    year: 2020,
    status: "resolved",
    ordinaryQuota: { bioScience: 7, bioinformatics: 3 },
    otherQuota: { competition: 1, national_life_science_base: 1 },
    publicResultCount: 12,
    notes: "名单包含普通、基地班、学科竞赛类型，不能把总人数当作纯普通指标。",
    sourceIds: ["A-2020-LIFE-RULES", "A-2020-LIFE-LIST"],
  },
  {
    cohort: "2021届",
    year: 2021,
    status: "partial",
    publicResultCount: 15,
    notes: "首批 15 人已确认；另有补充公示存在，正文和补充人数尚未恢复。",
    sourceIds: ["A-2021-LIFE-LIST", "A-2021-LIFE-SUPPLEMENT"],
  },
  {
    cohort: "2022届",
    year: 2022,
    status: "unresolved",
    notes: "公开档案暂未定位到生命科学学院普通推免年度细则/执行名单；不代表当年未公示。",
    sourceIds: [],
  },
  {
    cohort: "2023届",
    year: 2023,
    status: "resolved",
    otherQuota: { school_increment: 2 },
    publicResultCount: 23,
    execution: {
      general: [
        "初始拟推荐 21 人",
        "学校增补 2 人：1 个支持学科/专业建设，1 个因上一年度学院升学率居全校前六",
      ],
    },
    notes: "初始名单明确「排名不分先后」，不可推导最低综合排名。",
    sourceIds: ["A-2023-LIFE-RULES", "A-2023-LIFE-LIST", "A-2023-LIFE-SUPPLEMENT"],
  },
  {
    cohort: "2024届",
    year: 2024,
    status: "unresolved",
    notes: "公开档案暂未定位；不代表当年未公示。",
    sourceIds: [],
  },
  {
    cohort: "2025届",
    year: 2025,
    status: "resolved",
    ordinaryQuota: { bioScience: 17, bioinformatics: 4 },
    publicResultCount: 23,
    execution: {
      bioScience: ["第 15 名放弃", "普通拟推荐递至第 18 名"],
      bioinformatics: ["普通拟推荐第 1–4 名", "第 7 名为军科院补偿指标"],
    },
    notes: "2025 届是目前最适合做「规则与实际执行」对照的公开样本。",
    sourceIds: ["A-2025-LIFE-RULES", "A-2025-LIFE-RANKING"],
  },
  {
    cohort: "2026届",
    year: 2026,
    status: "partial",
    ordinaryQuota: { bioScience: 20, bioinformatics: 5 },
    otherQuota: { engineering_master_phd: 2 },
    publicResultCount: null,
    notes: "规则已齐；最终普通综合排名/拟推荐公示公开档案暂未定位。",
    sourceIds: ["A-2026-SCHOOL-NOTICE", "A-2026-LIFE-RULES"],
  },
];

export const GROWTH_STAGES: GrowthStage[] = [
  {
    id: "grade-1",
    grade: "大一",
    title: "先摸清专业",
    shouldKnow: [
      "本专业培养方案与学分结构是什么",
      "科研、竞赛、推免这些词分别指什么",
      "学院通知公告通常在哪里发布",
    ],
    canStart: [
      "养成稳定的学习习惯，把基础课学扎实",
      "了解学院官网和教务系统的基本用法",
      "如果有兴趣，可以先旁听了解课题组在做什么",
    ],
    relatedPolicies: ["完成培养方案前 3 年教学环节，是后续推免申请的必备条件之一"],
    misconceptions: ["大一不用关心推免——但学业记录从入学起就在累积"],
    editorNote:
      "大一更重要的是先探索自己。先把专业、课程、科研到底是什么弄明白，不需要第一天就决定未来一定走保研。",
    experienceStatus: "pending",
    answerStatus: "PENDING",
  },
  {
    id: "grade-2",
    grade: "大二",
    title: "认真试一试",
    shouldKnow: [
      "加权平均裸分（含全校性选修）是推免最基础的指标",
      "挂科会直接影响推免资格",
      "自己到底有没有兴趣继续走科研 / 保研这条路",
    ],
    canStart: [
      "认真看自己的专业排名位置",
      "接触真实科研，参加一些竞赛或项目",
      "阅读学院当年推免实施办法，知道规则大概长什么样",
    ],
    relatedPolicies: ["补考 / 重修合格课程，在推免排名时按 60 分计算"],
    misconceptions: ["竞赛、论文可以临时突击——审核看真实贡献与材料"],
    editorNote:
      "比起为了简历堆项目，更重要的是参加过之后知道自己到底喜不喜欢。",
    experienceStatus: "pending",
    answerStatus: "PENDING",
  },
  {
    id: "grade-3",
    grade: "大三",
    title: "进入申请准备",
    shouldKnow: [
      "2026 届成绩审核以 9 月 11 日教务系统排名为准",
      "加分材料有明确截止时间（见当年细则）",
      "入围前 60% / 35% 不等于已经拿到推免名额",
    ],
    canStart: [
      "核对加权平均分与专业排名",
      "整理竞赛、论文、课题等加分材料",
      "关注英语成绩与夏令营 / 预推免信息",
      "开始想清楚目标院校与材料清单",
    ],
    relatedPolicies: ["2026 届学院推免工作实施办法", "推免遴选总成绩计算与专项评价办法"],
    misconceptions: ["入围前 60% / 35% 就等于拿到推免名额"],
    experienceStatus: "pending",
    answerStatus: "PARTIAL",
  },
  {
    id: "grade-4",
    grade: "大四",
    title: "完成推免流程",
    shouldKnow: [
      "获得学院推免推荐资格后，须在推免服务系统填报志愿",
      "学院与校级公示期均为 7 天",
      "接收学校的确认流程与学院资格认定是前后两步",
    ],
    canStart: [
      "关注学院公示与本科生院同步公示",
      "准备成绩单等系统上传材料",
      "跟进接收学校的确认与录取结果",
    ],
    relatedPolicies: ["2026 届校级推免工作通知", "2026 届学院推免工作实施办法"],
    misconceptions: ["拿到学院资格就等于专业录取——接收学校确认是另一环节"],
    experienceStatus: "pending",
    answerStatus: "PARTIAL",
  },
];

export function getSourcesByIds(ids: string[]): OfficialSource[] {
  return ids.map((id) => OFFICIAL_SOURCES[id]).filter(Boolean);
}

export function countUniqueSources(ids: string[]): number {
  return new Set(ids).size;
}
