# 导师画像：郭辉

## ✨ 一句话硬核总结

公开研究主线集中在孤独症及神经发育障碍（NDD）致病基因与分子机制（如应激颗粒、相分离、神经发生与突触发育）[E1, E23]，本科生基于公开论文技术栈可能从数据挖掘与细胞/小鼠表型验证切入，核心门槛在于兼具生物信息数据分析与湿实验操作能力。

## 🧬 Academic Mapping

### Identity and OpenAlex Match

- **姓名**：郭辉（Hui Guo）
- **OpenAlex display name**：Hui Guo
- **OpenAlex Author ID**：https://openalex.org/A5032060727
- **ORCID**：https://orcid.org/0000-0002-1570-2545
- **目标机构署名**：Central South University / 中南大学生命科学学院医学遗传学国家重点实验室/中南大学医学遗传中心
- **匹配度与置信度**：匹配置信度 **Medium**（经中南大学署名严格过滤后）

### Author Disambiguation Risk

- **同名作者污染风险**：**High**。OpenAlex 原始记录 A5032060727 共聚合了 65 篇作品，但包含多个非中南大学机构（如其他同名 Hui Guo 发布的非相关医学或工科文献）。
- **过滤规则与边界**：本报告严格限定为目标作者署名中明确带有 Central South University 的 23 篇作品，排除了 42 篇非中南大学署名文献，避免同名作者污染。
- **归属注意事项**：在保留的 23 篇文献中，核心主线为神经发育障碍遗传学与功能机制，极少数心血管（[E12], [E21]）和卵巢癌 radiomics（[E22]）属于跨科室或外围临床合作论文，不扩大为核心主线。

### Recent Five-Year Scope

- **检索年份范围**：2022–2026 年（近五个日历年）
- **检索作品总数**：65 篇
- **中南大学署名过滤后作品数**：23 篇
- **DOI/题名去重后论文数**：23 篇
- **重复记录 / 预印本冲突**：预印本 [E22] 保留用于体现最新进展，全部 23 篇记录均由 `evidence_manifest.json` 确定性锁定，无重复计算。

### Core Research Directions

- **核心主线**：孤独症（ASD）与神经发育障碍（NDD）致病基因鉴定、遗传图谱及神经发育/突触功能机制研究（占论文比例 > 80%）[E1-E5, E7-E8, E10-E11, E13-E20, E23]。
- **工具与算法开发**：高通量测序数据质量控制与性别鉴定工具开发（如 seGMM）[E6]。
- **外围/临床合作方向**：Axenfeld-Rieger 综合征非编码区增强子调控 [E9]、心肌病遗传变异 [E12, E21] 及妇科肿瘤影像组学 [E22]。

### Core Scientific Questions

只基于 23 篇论文可以支持的科学问题：

1. **神经发育障碍（NDD/ASD）新致病基因与 De Novo 变异鉴定**：如何通过大样本队列外显子/全基因组测序寻找 NDD/ASD 新风险基因（如 UBAP2L, CERT1, GIGYF1, KMT5B, CELF2, GSK3B, INTS6, GIGYF2 等）[E1, E3, E4, E5, E8, E10, E15, E17, E18, E19, E23]？
2. **应激颗粒（Stress Granules）与液相-液相分离（LLPS）在神经发育中的病理机制**：UBAP2L、CAPRIN1 等应激颗粒核心网络成员以及 KCTD10 相分离调控如何影响皮层神经发生与突触形成 [E1, E13]？
3. **神经发生与转录后/翻译调控**：Csde1、INTS6、Naa15、CELF2、PABPC1 等因子如何调控皮层神经元分化、细胞周期与后期发育 [E8, E11, E14, E15, E17]？
4. **特定基因突变的神经电路与多巴胺/皮层神经元表型**：如 SHANK2 突变对 ALDH1A1 阴性多巴胺神经元发育的影响 [E20]，ADGRL1/KCTD10 对小鼠突触活性与行为学的影响 [E2, E7]。

### Main Technical Routes

基于论文证据整理的反复出现的实验与计算技术：

1. **基因组学与生物信息学分析**：全外显子组测序（WES）、全基因组测序（WGS）、表达谱/单细胞 RNA-seq 数据挖掘、De Novo 变异致病性评估 [E1, E6, E16, E23]。
2. **小鼠基因敲除/杂合子模型与行为学**：Ubap2l、Adgrl1、Gigyf1、Celf2 等基因缺陷小鼠模型，社交、认知与神经发育行为学评估 [E1, E2, E4, E8]。
3. **细胞与分子生物学验证**：应激颗粒（SG）形成与免疫荧光检测、液相分离（LLPS）测定、蛋白相互作用（Co-IP/Western blot）、皮层神经元原代培养与神经发生标记 [E1, E5, E13, E14, E15, E17]。
4. **数据质控与算法开发**：基于 Massive Parallel Sequencing 数据的生物信息学工具开发（如 seGMM）[E6]。

### Research Evolution

- **2022年**：聚焦应激颗粒核心网络（UBAP2L）、ADGRL1、GIGYF1、KMT5B、PABPC1 等新基因在 NDD 中的致病机制与小鼠模型表型验证 [E1, E2, E4, E5, E11]，同时开发生物信息工具 seGMM [E6]。
- **2023-2024年**：深入探索 CERT1 鞘脂稳态 [E3]、KCTD10/KCTD13 调控 [E7]、CELF2 与 GSK3B 缺陷导致的孤独症行为与皮层神经元发育异常 [E8, E10]，拓展至 KCTD10 液相相分离（LLPS）突触机制 [E13] 及 SHANK2 多巴胺神经元表型 [E20]。
- **2025-2026年**：推进转录后调控（Csde1 [E14]）、INTS6 [E17]、Naa15 [E15]、GIGYF2 [E18]、TCF7L2 [E19] 等前沿机制研究，并在 2026 年发表中国孤独症队列稀有变异全景图谱 [E23]。
- **演化结论**：体现出从“单基因变异鉴定”向“应激颗粒/相分离/转录后调控分子机制”及“中国人群大队列基因组学”纵深发展的特征。**Confidence: High**。

### Conditional Direction Trend

基于既有论文连续性的条件式趋势（非真实未发表计划）：

- 若实验室继续深耕 NDD 分子机制，可能进一步扩展转录后调控（RNA 结合蛋白、应激颗粒、相分离）在神经元发育与突触可塑性中的作用 [E1, E13, E14, E17]；
- 若基于 2026 年大队列数据 [E23]，可能针对新发现的候选风险基因开展高通量功能筛查或小鼠/细胞模型验证。

## 🎓 Undergraduate Perspective

### Suitable Undergraduate Profile

- **兴趣匹配**：对神经遗传学、孤独症/神经发育障碍分子病理、生物信息学数据挖掘或动物模型实验有强烈的学术好奇心。
- **基础要求**：具备分子生物学、遗传学、生物信息学（Python/R/Linux 命令行基础）或神经生物学基础知识；若参与湿实验需具备细胞培养或小鼠实验的基本规范意识。

### Possible Undergraduate Tasks

1. 如果存在公开数据、任务边界与指导条件，本科生可能尝试利用已公开的测序数据或数据库进行 NDD De Novo 变异筛选、致病性预测与通路富集分析。Confidence: Medium。[E1, E16, E23]
2. 如果存在成熟 protocol、细胞系与指导条件，本科生可能辅助开展细胞水平的应激颗粒（SG）诱导、免疫荧光染色与显微成像数据整理。Confidence: Low–Medium。[E1]
3. 如果存在成熟实验体系与指导条件，本科生可能参与小鼠基因型鉴定（PCR）或基础行为学数据整理。Confidence: Low–Medium。[E1, E2, E8]

以上内容仅为根据公开论文技术栈形成的条件式任务参考，不代表课题组会向本科生提供相应任务、数据、试剂、设备、资源或指导。

### Expected Skill Development

- **论文直接支持的技术能力**：WES/WGS 数据分析流程、应激颗粒与蛋白互作检测、神经元原代培养/细胞免疫荧光、小鼠基因型鉴定与行为学分析。
- **间接推测的综合能力**：学术文献阅读与变异致病性评级（ACMG 指南）、生物信息统计图表绘制、严谨的实验对照设计。

### Long-term Advisor Fit

- **方向适配条件**：希望在医学遗传学、神经生物学与生物信息学交叉领域获得扎实的科研训练，能够适应“干湿结合”或深度湿实验节奏。
- **不适配条件**：仅寻找纯软工程/纯算法方向、不愿接触生物医学实验，或期望短期内无门槛快速出产成果者。

### Participation Path Barriers

- **文献与数据分析路径**：门槛中等，需要掌握生物信息学语言（Python/R）及 Linux 操作，理解 WES/WGS 变异过滤逻辑。
- **细胞与分子验证路径**：门槛较高，需要掌握细胞培养、转染、应激颗粒/相分离验证（Co-IP/WB/IF）等高精度实验技能。
- **湿实验/动物模型路径**：门槛高，涉及小鼠繁育、基因型鉴定、脑片切片与行为学实验，训练周期较长且时间投入大。

## 📈 Growth Path

This growth path represents a possible development scenario inferred from available evidence. It does not represent actual laboratory arrangements.

以下内容仅为基于公开学术证据构建的条件式发展情景，不代表课题组真实培养流程、任务分配或指导安排。

### 0-3 Months

- 学习 NDD/ASD 遗传学背景文献及 ACMG 变异解读指南。
- 了解基因组数据分析基础工具或细胞培养与分子实验基本规范。

### 3-6 Months

- 尝试练习处理公开变异筛选或细胞表型数据（如应激颗粒分析、蛋白表达检测）。
- 学习独立整理实验数据与生物信息分析结果。

### 6-12 Months

- 如果具备条件，可尝试特定基因/变异在细胞或小鼠表型中的单点验证学习。
- 整理文献阅读与实验/计算记录，练习撰写学术总结报告。

## ⚠️ Risk Controller

### Technical Barrier

**任务属性层面**：公开论文显示该研究路线涉及人类遗传学、生物信息学大数据以及小鼠/细胞分子生物学 [E1, E23]，完整掌握可能具有较高技术门槛。

**实验室现实安排**：Evidence insufficient. Unable to determine.

**条件式建议**：如果学生能够获得明确任务、数据、试剂和指导，可优先选择边界清晰的单项数据分析或基础分子实验。该建议不代表实验室会提供上述条件。

### Learning Cost

**任务属性层面**：生物信息分析需要掌握 R/Python/Linux 及专有基因组学软件；湿实验需要经过较长的细胞与小鼠实验操作培训。

**实验室现实安排**：Evidence insufficient. Unable to determine.

### Feedback Cycle

从任务属性看，文献整理、公开数据分析和单一结果复现通常比完整机制研究更容易划分检查节点。

但该课题组的真实反馈频率、等待时间和指导方式：
Evidence insufficient. Unable to determine.

### Expected Milestone Feasibility

**任务属性层面**：文献整理、数据库检索、公开数据复现和单项分析通常更容易形成可检查的中间材料。

**实验室现实安排**：该实验室是否提供相应任务、数据、试剂、设备、指导和反馈机制：
Evidence insufficient. Unable to determine.

### Coursework Conflict

**任务属性层面**：可异步完成的文献或公开数据任务，通常比需要连续实验时间点的小鼠/细胞实验更容易与课程并行。

**实验室现实安排**：但该课题组的实际时间要求、课程冲突和安排灵活度：
Evidence insufficient. Unable to determine.

### Risk Mitigation Strategy

- **优先建议**：选择干湿结合或偏生物信息分析的子任务作为切入点，降低前期物理时间冲突风险。
- **本科科研参与风险等级**：
  - 公开数据与生物信息分析路径：Medium。
  - 小鼠/细胞湿实验验证路径：High。
  - 综合评估本科科研参与风险等级：Medium。
- **风险判断 Evidence Confidence**：Medium。依据为公开论文显示该路线同时涉及生物信息大数据、细胞机制与小鼠模型 [E1, E2, E8, E23]，但本科生实际分工无公开证据。
- **作者身份匹配置信度**：Medium。

## 🔎 Evidence Confidence

| 关键判断 | 置信度等级 | 支持证据 | 限制与边界 |
|---|---|---|---|
| 导师身份与中南大学机构匹配 | Medium | OpenAlex A5032060727 结合中南大学署名过滤 [E1-E23] | OpenAlex 存在同名作者，需严格限定中南大学署名 |
| 核心方向为 NDD/ASD 遗传与分子机制 | High | 2022–2026 年多篇核心论文连续支持 [E1-E5, E7-E8, E10-E11, E13-E20, E23] | 不包含非中南大学署名的 42 篇作品 |
| 主要技术路线包含干湿结合（测序+小鼠/细胞） | High | 多篇论文明示 WES/WGS、小鼠模型及细胞实验 [E1, E2, E8, E13, E23] | 仅证明技术存在于课题组，不代表本科生必然安排 |
| 应激颗粒与相分离为近年重要机制切入点 | High | 2022 Sci Adv [E1] 与 2024 PNAS [E13] 直接支持 | 属于前沿机制方向，技术门槛较高 |
| 本科生实际带教频率与实验室氛围 | No Evidence | 无公开学术证据支持 | Evidence insufficient. Unable to determine. |

## 🛠️ Survival Checklist

- **必备基础**：生物化学与遗传学基础知识、Linux / Python 基础（生物信息方向）或细胞培养基础操作（湿实验方向）。
- **推荐技能**：理解 ACMG 变异分类标准、熟悉 PyMOL / IGV 等基因组与结构可视化工具、掌握基础统计学（R语言）。
- **可执行准备路线**：阅读 2022 Sci Adv [E1] 与 2026 Mol Psychiatry [E23] 综述与核心文献，理解应激颗粒与 NDD 稀有变异研究的基本逻辑。

## 🧑‍🎓 Experience Evidence

- `has_experience_evidence: false`
- `experience_case_count: 0`
- `evidence_type: academic_only`
- 当前仅包含公开学术证据，暂无经过授权的本科生经历材料。
- 真实指导频率、实验室氛围、导师责任心与学生体验均为 **Evidence insufficient. Unable to determine.**

## 🔗 Evidence Intersection

当前仅包含 Academic Evidence（基于 OpenAlex 检索与中南大学署名过滤的 23 篇公开论文），未接入 Experience Evidence，因此无法进行学术证据与经历证据的交叉验证。

## 📚 Evidence Source

| Evidence ID | 论文题名 | 发表年份 | DOI | 关联方向 |
|---|---|---|---|---|
| E1 | De novo variants in genes regulating stress granule assembly associate with neurodevelopmental disorders | 2022 | 10.1126/sciadv.abo7112 | 应激颗粒/NDD遗传学 |
| E2 | ADGRL1 haploinsufficiency causes a variable spectrum of neurodevelopmental disorders in humans and alters synaptic activity and behavior in a mouse model | 2022 | 10.1016/j.ajhg.2022.06.011 | NDD/小鼠模型与突触 |
| E3 | CERT1 mutations perturb human development by disrupting sphingolipid homeostasis | 2023 | 10.1172/jci165019 | 鞘脂稳态/NDD |
| E4 | GIGYF1 disruption associates with autism and impaired IGF-1R signaling | 2022 | 10.1172/jci159806 | 孤独症/IGF-1R通路 |
| E5 | Loss-of-function of KMT5B leads to neurodevelopmental disorder and impairs neuronal development and neurogenesis | 2022 | 10.1016/j.jgg.2022.03.004 | NDD/神经发生 |
| E6 | seGMM: A New Tool for Gender Determination From Massively Parallel Sequencing Data | 2022 | 10.3389/fgene.2022.850804 | 生信质控工具 |
| E7 | KCTD10 regulates brain development by destabilizing brain disorder–associated protein KCTD13 | 2024 | 10.1073/pnas.2315707121 | 脑发育/蛋白稳定性 |
| E8 | CELF2 Deficiency Demonstrates Autism-Like Behaviors and Interferes with Late Development of Cortical Neurons in Mice | 2024 | 10.1007/s12035-024-04250-0 | 孤独症小鼠行为与皮层神经元 |
| E9 | Intergenic sequences harboring potential enhancer elements contribute to Axenfeld-Rieger syndrome by regulating PITX2 | 2024 | 10.1172/jci.insight.177032 | 临床遗传/非编码增强子 |
| E10 | Monoallelic loss-of-function variants in GSK3B lead to autism and developmental delay | 2024 | 10.1038/s41380-024-02806-z | 孤独症/GSK3B变异 |
| E11 | De novo variants in the PABP domain of PABPC1 lead to developmental delay | 2022 | 10.1016/j.gim.2022.04.013 | 发育迟缓变异 |
| E12 | Whole-Exome Sequencing Identifies a Novel Variant (c.1538T &gt; C) of TNNI3K in Arrhythmogenic Right Ventricular Cardiomyopathy | 2022 | 10.3389/fcvm.2022.843837 | 外围临床/心肌病变异 |
| E13 | <i>KCTD10</i> p.C124W variant contributes to schizophrenia by attenuating LLPS-mediated synapse formation | 2024 | 10.1073/pnas.2400464121 | 相分离(LLPS)/突触形成 |
| E14 | Csde1 Mediates Neurogenesis via Post-transcriptional Regulation of the Cell Cycle | 2025 | 10.1007/s12264-025-01426-z | 转录后调控/神经发生 |
| E15 | <i>Naa15</i> Haploinsufficiency and De Novo Missense Variants Associate With Neurodevelopmental Disorders and Interfere With Neurogenesis and Neuron Development | 2025 | 10.1002/aur.3308 | NDD/神经发生 |
| E16 | Targeted sequencing identifies risk variants in 202 candidate genes for neurodevelopmental disorders | 2023 | 10.1016/j.gene.2023.148071 | 靶向测序/候选基因 |
| E17 | Disrupting integrator complex subunit INTS6 causes neurodevelopmental disorders and impairs neurogenesis and synapse development | 2025 | 10.1172/jci191729 | INTS6/神经发生与突触 |
| E18 | Evidence supporting the role of GIGYF2 in synapse development and autism | 2026 | 10.1038/s41380-026-03681-6 | GIGYF2/孤独症与突触 |
| E19 | Characterization of the genotypic and phenotypic spectrum of TCF7L2-related neurodevelopmental disorder (TRND) | 2026 | 10.1016/j.gim.2026.102642 | TCF7L2/NDD图谱 |
| E20 | Autism patient-derived SHANK2BY29X mutation affects the development of ALDH1A1 negative dopamine neuron | 2024 | 10.1038/s41380-024-02578-6 | SHANK2/多巴胺神经元 |
| E21 | Whole-exome sequencing revealed a novel Troponin T2 in a pediatric patient with severe isolated left ventricular noncompaction cardiomyopathy | 2023 | 10.1093/qjmed/hcad058 | 外围临床/心肌病 |
| E22 | Tumor Stroma Ratio-Based Radiomics Model for Predicting Platinum Resistance and Prognosis in Epithelial Ovarian Cancer | 2025 | 10.21203/rs.3.rs-7809452/v1 | 外围/卵巢癌影像组学 |
| E23 | Genomic landscape of rare variants in a Chinese autism cohort and discovery of novel risk genes | 2026 | 10.1038/s41380-026-03754-6 | 中国孤独症队列图谱 |

## 🧾 Boundary Statement

本报告仅基于 OpenAlex 公开学术数据及中南大学署名过滤文献生成，不使用任何未公开的个人评价或内部经历数据。本报告不评价导师个人性格、责任心、指导精力或实验室人文氛围；不推断课题组经费、设备权限或内部招生名额；不对本科生的论文发表、竞赛获奖或科研成果作任何承诺。报告中关于本科生可能参与的任务、能力提升路径、技术门槛及课业冲突风险，均为基于公开论文技术栈的条件式推断，仅供参考。
