import type { Advisor } from "../types/advisor";

export const advisors: Advisor[] = [
  {
    id: "xiang-rong",
    name: "项荣",
    englishName: "Rong Xiang",
    initials: "项",
    summary: "从人类疾病候选变异出发，连接遗传学证据、功能验证与分子通路机制。",
    confidence: "高",
    confidenceNote: "公开论文与机构信息可支持稳定的研究主线判断。",
    directions: ["疾病遗传", "分子机制", "生物信息", "功能验证"],
    methods: ["公共数据库检索", "候选变异筛选", "细胞实验", "动物模型"],
    researchQuestion: "遗传变异如何通过具体分子通路影响疾病发生与发展？",
    timeline: [
      {
        period: "0–3 个月",
        title: "补齐基础与复现分析",
        tasks: ["阅读核心论文并绘制证据链", "学习基础遗传统计与公开数据库", "复现一个小型变异注释流程"],
      },
      {
        period: "3–6 个月",
        title: "进入可验证的问题",
        tasks: ["缩小候选基因或变异范围", "设计初步功能验证", "形成周报与可复用分析记录"],
      },
      {
        period: "6–12 个月",
        title: "完成一段独立证据链",
        tasks: ["完成关键实验或计算分析", "对照替代解释与失败结果", "整理本科生项目报告或海报"],
      },
    ],
    risks: ["需要同时理解计算分析与湿实验语言，前期学习跨度较大。", "候选变异不一定能获得清晰的功能验证结果。"],
    papers: [
      {
        title: "Representative work on human disease variants and functional mechanisms",
        journal: "公开论文索引示例",
        year: 2024,
        doi: "待人工核验后补充",
      },
    ],
    experiences: [],
    boundary: "本页仅整理公开学术证据，不代表导师承诺接收本科生，也不用于评价导师风格、实验室氛围或指导质量。",
    updatedAt: "2026-07-23",
  },
  {
    id: "liu-jing",
    name: "刘静",
    englishName: "Jing Liu",
    initials: "刘",
    summary: "聚焦造血调控、血液恶性肿瘤机制及潜在治疗靶点。",
    confidence: "中",
    confidenceNote: "研究方向有多项公开证据支持，但部分项目边界仍需进一步核验。",
    directions: ["造血调控", "血液肿瘤", "单细胞", "分子机制"],
    methods: ["单细胞组学", "细胞谱系分析", "分子生物学实验", "疾病模型"],
    researchQuestion: "造血细胞命运失衡如何推动血液恶性肿瘤，并形成可干预靶点？",
    timeline: [
      {
        period: "0–3 个月",
        title: "建立造血系统知识框架",
        tasks: ["学习细胞谱系与常用标记", "精读代表性论文", "完成基础数据可视化练习"],
      },
      {
        period: "3–6 个月",
        title: "参与子问题分析",
        tasks: ["清理一个公开单细胞数据集", "比较关键细胞群差异", "提出可检验的机制假设"],
      },
      {
        period: "6–12 个月",
        title: "连接组学与验证",
        tasks: ["完成候选通路分析", "协助设计验证实验", "形成结构化项目总结"],
      },
    ],
    risks: ["单细胞分析对统计与编程基础有一定要求。", "公开数据结论不能直接替代实验验证。"],
    papers: [
      {
        title: "Representative work on hematopoietic regulation",
        journal: "公开论文索引示例",
        year: 2023,
        doi: "待人工核验后补充",
      },
    ],
    experiences: ["公开材料中出现本科生参与数据整理与组会汇报的个案；仅作为经历线索，不推断普遍培养安排。"],
    boundary: "经历材料与学术事实分开呈现。单个学生经历不能推广为实验室固定制度，也不构成导师评价。",
    updatedAt: "2026-07-23",
  },
  {
    id: "li-faxiang",
    name: "李发祥",
    englishName: "Faxiang Li",
    initials: "李",
    summary: "以结构生物学解析蛋白复合物、抗噬菌体系统与蛋白互作机制。",
    confidence: "高",
    confidenceNote: "多篇核心论文可相互印证研究对象、技术路线与持续性。",
    directions: ["结构生物学", "蛋白质", "Cryo-EM", "抗噬菌体系统"],
    methods: ["蛋白表达纯化", "冷冻电镜", "结构建模", "生化功能实验"],
    researchQuestion: "关键蛋白复合物如何组装，并通过结构变化实现生物学功能？",
    timeline: [
      {
        period: "0–3 个月",
        title: "理解结构与实验流程",
        tasks: ["学习蛋白结构基础", "跟读一篇冷冻电镜论文", "熟悉蛋白纯化与质控概念"],
      },
      {
        period: "3–6 个月",
        title: "完成基础操作闭环",
        tasks: ["参与样品制备记录", "练习结构可视化", "解释结构与功能的对应关系"],
      },
      {
        period: "6–12 个月",
        title: "承担明确的实验模块",
        tasks: ["优化一个表达或纯化条件", "分析突变体或复合物差异", "汇总可复现实验记录"],
      },
    ],
    risks: ["样品制备和仪器流程周期长，失败原因可能较难定位。", "结构结果需要结合生化证据，避免只做图像层面的解释。"],
    papers: [
      {
        title: "Representative work on protein complexes and anti-phage systems",
        journal: "公开论文索引示例",
        year: 2025,
        doi: "待人工核验后补充",
      },
    ],
    experiences: ["公开展示材料中存在本科生参与蛋白实验的经历描述；具体职责与持续时间尚无充分证据。"],
    boundary: "页面展示的是公开证据能支持的研究信息。未公开内容统一标记为未知，不据此推断招生名额、指导方式或实验室文化。",
    updatedAt: "2026-07-23",
  },
];

export const allDirections = Array.from(
  new Set(advisors.flatMap((advisor) => advisor.directions)),
);

