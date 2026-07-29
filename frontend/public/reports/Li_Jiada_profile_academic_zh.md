# 导师画像：李家大

## ✨ 一句话硬核总结

公开研究主线集中在神经发育/神经精神障碍（如孤独症 ASD、ADHD、NIID、癫痫、帕金森病）与先天性促性腺激素减退症（CHH）的遗传调控、动物模型与昼夜节律分子机制 [E2, E5, E9, E10, E17, E34, E44]，本科生基于公开论文技术栈可能从小鼠行为学/基因型鉴定、分子剪接与昼夜节律基因功能验证切入，核心门槛在于兼具动物行为学/电生理与分子生物学实验能力。

## 🧬 Academic Mapping

### Identity and OpenAlex Match

- **姓名**：李家大（Jiada Li / Jia-Da Li）
- **OpenAlex display name**：Jia‐Da Li
- **OpenAlex Author ID**：https://openalex.org/A5055885693
- **ORCID**：https://orcid.org/0000-0002-4236-3518
- **目标机构署名**：Central South University / 中南大学生命科学学院医学遗传学国家重点实验室/医学遗传中心
- **匹配度与置信度**：匹配置信度 **High**（经中南大学署名严格过滤后）

### Author Disambiguation Risk

- **同名作者污染风险**：**Medium**。OpenAlex 原始记录 A5055885693 检索出 55 篇作品，其中 11 篇非中南大学署名（如部分早期外地合作或归属噪声）。
- **过滤规则与边界**：本报告严格限定为目标作者署名中明确带有 Central South University 的 44 篇作品，排除了 11 篇非目标机构作品，消除了归属噪声。
- **归属注意事项**：保留的 44 篇文献中，核心主线为神经发育障碍、昼夜节律与内分泌遗传学；少数涉及植物光敏色素 [E6]、蓝藻细胞死亡 [E32] 或急性髓系白血病 [E7, E21, E39] 的外围合作论文，不扩大为核心主线。

### Recent Five-Year Scope

- **检索年份范围**：2022–2026 年（近五个日历年）
- **检索作品总数**：55 篇
- **中南大学署名过滤后作品数**：44 篇
- **DOI/题名去重后论文数**：44 篇
- **重复记录 / 预印本冲突**：部分预印本（如 [E38, E39, E40, E41]）保留用于体现最新研究进展，全部 44 篇记录均由 `evidence_manifest.json` 锁定，无重复计算。

### Core Research Directions

- **核心主线 1：神经发育与神经精神障碍分子病理与动物模型**：孤独症（CNTNAP2, POGZ, GIGYF2, Necdin）、NIID（NOTCH2NLC GGC 重复扩增）、ADHD（Cry1Δ11, Bmal1, PKA 通路）及癫痫/帕金森小鼠模型机制 [E2, E3, E5, E9, E10, E17, E19, E22, E27, E30, E40, E44]。
- **核心主线 2：昼夜节律（Circadian Clock）与神经调控**：RNA 结合蛋白 FMRP 调控 Per1 mRNA [E36]、去泛素化酶 USP1 调控生物钟 [E4]、表观遗传机制 [E16] 以及孤独症风险基因 POGZ 与生物钟的双向调控机制 [E44]。
- **核心主线 3：先天性促性腺激素减退症（CHH/IHH）遗传学**：ANOS1, PROKR2, CHD7, FGFR1, SLIT2 剪接变异与功能验证 [E12, E34, E35, E37, E43]。
- **核心主线 4：神经退行性变与线粒体/突触/电路调控**：PINK1 调控线粒体分裂 [E1]、深部脑刺激（DBS）调控 GABA 释放 [E3, E40]、PCDH17 树突棘形态 [E14] 及 PLA2G6 损害 ER-线粒体接触 [E41]。

### Core Scientific Questions

只基于 44 篇论文可以支持的科学问题：

1. **神经发育障碍致病突变的动物模型表型与神经电路机制**：如 CNTNAP2 缺失或 γ-secretase 切割异常如何导致孤独症样行为 [E5, E9]？NOTCH2NLC GGC 重复扩增如何导致 NIID 神经退行性病变 [E2]？
2. **昼夜节律与神经发育障碍（如睡眠/ADHD）的双向互作机制**：POGZ 基因缺陷如何影响生物钟调控及睡眠/社交表型 [E44]？FMRP 如何结合 Per1 调控节律蛋白表达 [E36]？Bmal1 与 Cry1 缺陷如何通过多巴胺通路诱导 ADHD 症状 [E10, E17]？
3. **罕见内分泌疾病（CHH）的变异致病性与剪接异常**：CHD7、FGFR1、ANOS1、PROKR2 等基因剪接位点变异如何影响转录本剪接与临床表型 [E34, E35, E43]？
4. **线粒体动态与突触可塑性/帕金森电生理调控**：PINK1 如何通过 Drp1 磷酸化促进线粒体分裂 [E1]？DBS 如何通过去同步化 GABA 释放缓解帕金森运动障碍 [E3, E40]？

### Main Technical Routes

基于论文证据整理的反复出现的实验与计算技术：

1. **基因编辑动物模型与行为学**：基因敲除/转基因/点突变小鼠模型，孤独症社交、ADHD 痛觉过敏/多动、NIID 神经退行性行为评估 [E2, E5, E9, E10, E17, E27, E44]。
2. **电生理与神经电路分析**：小鼠脑片电生理记录、深部脑刺激（DBS）、GABA 神经元递送与突触可塑性测定 [E1, E3, E22, E40]。
3. **生化与分子剪接/RNA-蛋白互作**：γ-secretase 酶切检测、RNA-binding 蛋白结合测定（FMRP-Per1）、迷你基因（Minigene）剪接验证 [E5, E9, E36, E43]。
4. **线粒体与细胞器成像验证**：线粒体分裂荧光成像（Drp1）、ER-线粒体接触位点（GRP75/PLA2G6）分析 [E1, E41]。

### Research Evolution

- **2022年**：重点探讨 PINK1 线粒体分裂 [E1]、NOTCH2NLC GGC 扩增致 NIID 模型 [E2]、Na+/K+ 泵与癫痫 [E19] 及 CHH 遗传图谱 [E12, E35, E37]。
- **2023-2024年**：深入推进 FMRP [E36] 与 USP1 [E4] 的昼夜节律调控机制，拓展 CNTNAP2 酶切 [E5, E9]、PKA 通路在 ADHD 痛觉过敏中的作用 [E27] 及 DBS 帕金森神经电路调控 [E40]。
- **2025-2026年**：阐明 PLA2G6 ER-线粒体接触 [E41]、Necdin 突触调控 [E22]、CHH 剪接验证 [E43]，并在 2026 年发表 POGZ 孤独症基因与生物钟双向调控重大进展 [E44]。
- **演化结论**：体现出从“单基因动物模型建立”向“生物钟/睡眠障碍病理机制”及“突触/线粒体高精度分子病理”深入发展的特征。**Confidence: High**。

### Conditional Direction Trend

基于既有论文连续性的条件式趋势（非真实未发表计划）：

- 若课题组继续推进 NDD 昼夜节律机制，可能进一步探索生物钟基因在孤独症/ADHD 睡眠障碍中的环路与分子靶点 [E10, E17, E36, E44]；
- 若依托 CHH 变异库，可能利用 Minigene 及高通量剪接验证技术展开临床变异功能筛查 [E43]。

## 🎓 Undergraduate Perspective

### Suitable Undergraduate Profile

- **兴趣匹配**：对神经发育障碍（ASD/ADHD）、昼夜节律生物学、动物行为学、脑电路电生理或遗传病剪接机制有浓厚兴趣。
- **基础要求**：具备遗传学、神经生物学、生物化学基础；若参与动物实验需有耐心和动物实验基本规范意识。

### Possible Undergraduate Tasks

1. 如果存在质粒载体、成熟 protocol 与指导条件，本科生可能尝试协助开展 Minigene 剪接构建与 RT-PCR/qPCR 剪接产物分析。Confidence: Medium。[E12, E34, E43]
2. 如果存在细胞系、荧光表达载体与指导条件，本科生可能参与昼夜节律相关 RNA-蛋白互作或细胞水平节律荧光报道系统检测。Confidence: Medium。[E4, E36, E44]
3. 如果存在小鼠系、成熟实验规范与指导条件，本科生可能辅助参与小鼠基因型鉴定（PCR）或行为学视频数据整理。Confidence: Low–Medium。[E2, E5, E10, E27]

以上内容仅为根据公开论文技术栈形成的条件式任务参考，不代表课题组会向本科生提供相应任务、数据、试剂、设备、资源或指导。

### Expected Skill Development

- **论文直接支持的技术能力**：小鼠基因型 PCR/小鼠繁育管理、小鼠行为学分析、分子克隆与 Minigene 剪接分析、神经元/细胞免疫荧光与生化印迹（Western blot）。
- **间接推测的综合能力**：神经电路与节律实验数据处理、文献研读与实验对照设计能力。

### Long-term Advisor Fit

- **方向适配条件**：适合希望在神经生物学、生物钟调控与遗传病机制领域接受系统实验室训练，能胜任动物实验与生化实验的本科生。
- **不适配条件**：抗拒动物实验、无法投入连续物理时间，或仅寻求纯干实验/纯计算方向者。

### Participation Path Barriers

- **分子剪接与细胞节律路径**：门槛中等，需要掌握分子克隆、细胞转染与 RNA/蛋白检测技术。
- **小鼠基因型与行为学路径**：门槛较高，涉及小鼠系维护、基因型 PCR 及长时间行为学跟踪，时间成本较高。
- **电生理与线粒体动态成像路径**：门槛很高，需要较长时间的脑片电生理或高分辨显微成像培训。

## 📈 Growth Path

This growth path represents a possible development scenario inferred from available evidence. It does not represent actual laboratory arrangements.

以下内容仅为基于公开学术证据构建的条件式发展情景，不代表课题组真实培养流程、任务分配或指导安排。

### 0-3 Months

- 学习 NDD 遗传学与生物钟调控背景文献。
- 了解小鼠实验安全与规范意识，学习基础 PCR 或分子克隆基本原理。

### 3-6 Months

- 尝试练习小鼠行为学示例数据记录或 Minigene 剪接数据分析。
- 可通过公开论文阅读与模拟研究问题整理，逐步理解该方向的科学问题。公开学术证据无法证明该课题组本科生是否参加组会或 Discussion。

### 6-12 Months

- 如果具备条件，可尝试特定候选变异的剪接分析学习或节律荧光检测学习。
- 整理文献阅读与练习记录，练习撰写学术总结报告。

## ⚠️ Risk Controller

### Technical Barrier

**任务属性层面**：技术门槛较高。课题涉及神经动物模型、生物钟分子网络、剪接验证与脑电路 [E2, E4, E36, E40, E44]，需要较强的动手能力与严谨的实验态度。

**实验室现实安排**：Evidence insufficient. Unable to determine.

**条件式建议**：如果学生能够获得明确指导与实验条件，可选择分子剪接或细胞节律切入。该建议不代表实验室会提供上述条件。

### Learning Cost

**任务属性层面**：学习成本高。小鼠行为学与繁育周期较长；电生理与高分辨成像需要较长时间的学习积累。

**实验室现实安排**：Evidence insufficient. Unable to determine.

### Feedback Cycle

从任务属性看，文献整理、分子剪接分析和细胞节律检测通常比完整小鼠行为学与脑电路电生理更容易划分检查节点。

但该课题组的真实反馈频率、等待时间和指导方式：
Evidence insufficient. Unable to determine.

### Expected Milestone Feasibility

**任务属性层面**：如果任务边界清晰，并且已有数据、方法、指导和资源条件，学生可能形成文献综述、剪接测试记录或细胞节律数据图表等可检查材料。

**实验室现实安排**：是否能够形成论文、竞赛、软件著作权或其他正式成果：
Evidence insufficient. Unable to determine.

### Coursework Conflict

**任务属性层面**：可异步完成的分子剪接与数据分析任务，通常比需要固定时间采样或连续跟踪的小鼠行为学实验更容易与课程并行。

**实验室现实安排**：但该课题组的实际时间要求、课程冲突和安排灵活度：
Evidence insufficient. Unable to determine.

### Risk Mitigation Strategy

- **优先建议**：选择分子剪接或细胞节律检测等时间可控性强的切入点，降低前期物理时间冲突风险。
- **本科科研参与风险等级**：
  - 分子剪接与细胞节律路径：Medium。
  - 小鼠基因型与行为学路径：High。
  - 电生理与线粒体动态成像路径：High。
  - 综合评估本科科研参与风险等级：Medium。
- **风险判断 Evidence Confidence**：High。依据为公开论文显示该团队研究涵盖神经动物模型、生物钟分子网络、剪接验证与电生理 [E2, E4, E36, E40, E44]，技术复杂度明确。
- **作者身份匹配置信度**：High。

## 🔎 Evidence Confidence

| 关键判断 | 置信度等级 | 支持证据 | 限制与边界 |
|---|---|---|---|
| 导师身份与中南大学机构匹配 | High | OpenAlex A5055885693 结合中南大学署名过滤 [E1-E44] | 经严格机构消歧 |
| 核心主线为 NDD 动物模型与遗传机制 | High | 2022–2026 年多篇核心论文连续支持 [E2, E5, E9, E10, E27, E44] | 不包含排出的 11 篇非中南大学署名作品 |
| 昼夜节律与睡眠障碍为核心方向之一 | High | 2023 FEBS [E4]、2023 HMG [E36] 及 2026 JCI Insight [E44] | 证明技术存在，不代表本科生必然安排 |
| 包含 CHH 临床变异与剪接验证 | High | 2022–2025 年多篇 CHH 剪接论文支持 [E12, E34, E35, E37, E43] | 局限于公开论文技术栈 |
| 本科生实际带教频率与实验室氛围 | No Evidence | 无公开学术证据支持 | Evidence insufficient. Unable to determine. |

## 🛠️ Survival Checklist

- **必备基础**：遗传学与分子生物学基础、小鼠实验安全与规范意识。
- **推荐技能**：掌握分子克隆与 PCR 设计、了解生化印迹与免疫荧光成像、理解生物钟基因调控基本逻辑。
- **可执行准备路线**：阅读 2024 PKA ADHD [E27] 与 2026 POGZ 孤独症/节律 [E44] 论文，理解动物模型与节律调控的基本研究流程。

## 🧑‍🎓 Experience Evidence

- `has_experience_evidence: false`
- `experience_case_count: 0`
- `evidence_type: academic_only`
- 当前仅包含公开学术证据，暂无经过授权的本科生经历材料。
- 真实指导频率、实验室氛围、导师责任心与学生体验均为 **Evidence insufficient. Unable to determine.**

## 🔗 Evidence Intersection

当前仅包含 Academic Evidence（基于 OpenAlex 检索与中南大学署名过滤的 44 篇公开论文），未接入 Experience Evidence，因此无法进行学术证据与经历证据的交叉验证。

## 📚 Evidence Source

| Evidence ID | 论文题名 | 发表年份 | DOI | 关联方向 |
|---|---|---|---|---|
| E1 | PINK1-mediated Drp1S616 phosphorylation modulates synaptic development and plasticity via promoting mitochondrial fission | 2022 | 10.1038/s41392-022-00933-z | 线粒体分裂/突触塑性 |
| E2 | Expression of expanded GGC repeats within <i>NOTCH2NLC</i> causes behavioral deficits and neurodegeneration in a mouse model of neuronal intranuclear inclusion disease | 2022 | 10.1126/sciadv.add6391 | NIID/小鼠模型与神经退行性变 |
| E3 | Deep brain stimulation alleviates Parkinsonian motor deficits through desynchronizing GABA release in mice | 2025 | 10.1038/s41467-025-59113-6 | DBS/帕金森电生理 |
| E4 | A genome‐wide <scp>CRISPR</scp> screen identifies <scp>USP1</scp> as a novel regulator of the mammalian circadian clock | 2023 | 10.1111/febs.16990 | 昼夜节律/USP1去泛素化 |
| E5 | CNTNAP2 intracellular domain (CICD) generated by γ-secretase cleavage improves autism-related behaviors | 2023 | 10.1038/s41392-023-01431-6 | 孤独症/CNTNAP2切片与行为 |
| E6 | <i>FERONIA</i> is involved in <i>phototropin 1</i>‐mediated blue light phototropic growth in <i>Arabidopsis</i> | 2022 | 10.1111/jipb.13336 | 外围/植物光敏 |
| E7 | Targeting BMAL1 reverses drug resistance of acute myeloid leukemia cells and promotes ferroptosis through HMGB1-GPX4 signaling pathway | 2024 | 10.1007/s00432-024-05753-y | 外围/AML血液肿瘤与生物钟 |
| E8 | UBR5 Acts as an Antiviral Host Factor against MERS-CoV via Promoting Ubiquitination and Degradation of ORF4b | 2022 | 10.1128/jvi.00741-22 | 外围/宿主因子 |
| E9 | Contactin-associated protein-like 2 (CNTNAP2) mutations impair the essential α-secretase cleavages, leading to autism-like phenotypes | 2024 | 10.1038/s41392-024-01768-6 | 孤独症/γ-secretase酶切异常 |
| E10 | Cry1Δ11 mutation induces ADHD-like symptoms through hyperactive dopamine D1 receptor signaling | 2023 | 10.1172/jci.insight.170434 | ADHD/Cry1突变与多巴胺 |
| E11 | Influence of sleep disruption on protein accumulation in neurodegenerative diseases | 2022 | 10.20517/and.2021.10 | 睡眠障碍与神经退行 |
| E12 | &lt;b&gt;&lt;i&gt;SLIT2&lt;/i&gt;&lt;/b&gt; Rare Sequencing Variants Identified in Idiopathic Hypogonadotropic Hypogonadism | 2022 | 10.1159/000525769 | CHH/SLIT2变异 |
| E13 | KCTD10 regulates brain development by destabilizing brain disorder–associated protein KCTD13 | 2024 | 10.1073/pnas.2315707121 | 脑发育/蛋白稳定性 |
| E14 | PCDH17 restricts dendritic spine morphogenesis by regulating ROCK2-dependent control of the actin cytoskeleton, modulating emotional behavior | 2024 | 10.24272/j.issn.2095-8137.2024.055 | PCDH17/树突棘形态与情感行为 |
| E15 | Prenatal low-dose Bisphenol A exposure impacts cortical development via cAMP-PKA-CREB pathway in offspring | 2024 | 10.3389/fnint.2024.1419607 | 环境毒物/皮层发育 |
| E16 | Epigenetic Mechanisms in the Transcriptional Regulation of Circadian Rhythm in Mammals | 2025 | 10.3390/biology14010042 | 昼夜节律表观遗传综述 |
| E17 | Knockout of Bmal1 in dopaminergic neurons induces ADHD-like symptoms via hyperactive dopamine signaling in male mice | 2025 | 10.1186/s12993-025-00287-w | Bmal1敲除/ADHD小鼠 |
| E18 | Mutations in <scp><i>CLCN6</i></scp> as a Novel Genetic Cause of Neuronal Ceroid Lipofuscinosis in Patients and a Murine Model | 2024 | 10.1002/ana.27002 | CLCN6/神经元蜡样脂褐质沉积症 |
| E19 | Recurrent de novo single point variant on the gene encoding Na+/K+ pump results in epilepsy | 2022 | 10.1016/j.pneurobio.2022.102310 | 癫痫/钠钾泵变异 |
| E20 | <i>KCTD10</i> p.C124W variant contributes to schizophrenia by attenuating LLPS-mediated synapse formation | 2024 | 10.1073/pnas.2400464121 | 相分离/突触形成 |
| E21 | BMAL1-depletion remodels ceramide metabolism to regulate ferroptosis and sorafenib chemosensitivity in acute myeloid leukemia | 2025 | 10.1016/j.isci.2025.112054 | AML生物钟/神经酰胺代谢 |
| E22 | Loss of Necdin causes social deficit and aberrant synaptic function through destabilization of SynGAP | 2025 | 10.1038/s41380-025-03187-7 | Necdin/SynGAP稳定性与社交缺陷 |
| E23 | <i>GSN</i>gene frameshift mutations in Alzheimer’s disease | 2023 | 10.1136/jnnp-2022-330465 | GSN/阿尔茨海默病 |
| E24 | A non-coding variant in 5’ untranslated region drove up-regulation of pseudo-kinase EPHA10 and caused non-syndromic hearing loss in humans | 2022 | 10.1093/hmg/ddac223 | EPHA10/非综合征型听力损失 |
| E25 | EXTL3 and NPC1 are mammalian host factors for Autographa californica multiple nucleopolyhedrovirus infection | 2024 | 10.1038/s41467-024-52193-w | 外围/宿主因子 |
| E26 | Disrupting integrator complex subunit INTS6 causes neurodevelopmental disorders and impairs neurogenesis and synapse development | 2025 | 10.1172/jci191729 | INTS6/神经发生与突触 |
| E27 | Overactive PKA signaling underlies the hyperalgesia in an ADHD mouse model | 2024 | 10.1016/j.isci.2024.111110 | ADHD/痛觉过敏 |
| E28 | Metabonomics analysis of decidual tissue in patients with recurrent spontaneous abortion | 2024 | 10.1016/j.jri.2024.104398 | 外围/妇产代谢组 |
| E29 | Prader-Willi syndrome protein necdin regulates the nucleocytoplasmic distribution and dopaminergic neuron development | 2024 | 10.1038/s41598-024-76981-y | 多巴胺神经元/Necdin |
| E30 | Evidence supporting the role of GIGYF2 in synapse development and autism | 2026 | 10.1038/s41380-026-03681-6 | GIGYF2/孤独症 |
| E31 | TRIM28 secures skeletal stem cell fate during skeletogenesis by silencing neural gene expression and repressing GREM1/AKT/mTOR signaling axis | 2023 | 10.1016/j.celrep.2023.112012 | 外围/干细胞 |
| E32 | Regulated cell death in cyanobacteria: Evidences, classification, and significances | 2022 | 10.1016/b978-0-323-96106-6.00004-6 | 外围/蓝藻 |
| E33 | A glucose-blue light AND gate-controlled chemi-optogenetic cell-implanted therapy for treating type-1 diabetes in mice | 2023 | 10.3389/fbioe.2023.1052607 | 外围/光遗传合成生物 |
| E34 | A functional spectrum of <i>PROKR2</i> mutations identified in isolated hypogonadotropic hypogonadism | 2023 | 10.1093/hmg/ddad014 | CHH/PROKR2变异 |
| E35 | <i>ANOS1</i> variants in a large cohort of Chinese patients with congenital hypogonadotropic hypogonadism. | 2022 | 10.11817/j.issn.1672-7347.2022.220071 | CHH/ANOS1变异 |
| E36 | FMRP binds Per1 mRNA and downregulates its protein expression in mice | 2023 | 10.1186/s13041-023-01023-z | 昼夜节律/FMRP-Per1 |
| E37 | [Analysis of PROKR2 gene mutation in patients with hypogonadotropic hypogonadism]. | 2022 | 10.3760/cma.j.cn112138-20210821-00571 | CHH/PROKR2 |
| E38 | Recurrent &lt;i&gt; de novo&lt;/i&gt; Single Point Mutation on the Gene Encoding Na &lt;sup&gt;+&lt;/sup&gt;/K &lt;sup&gt;+&lt;/sup&gt; Pump Results in Epilepsy | 2022 | 10.2139/ssrn.4016079 | 癫痫/钠钾泵 |
| E39 | Targeting BMAL1 reverse drug resistance of acute myeloid leukemia cells and promoting ferroptosis through HMGB1-GPX4 signaling pathway | 2024 | 10.21203/rs.3.rs-3878236/v1 | 外围/AML生物钟 |
| E40 | Deep brain stimulation alleviates Parkinsonian motor deficits through desynchronizing GABA release | 2024 | 10.21203/rs.3.rs-5047146/v1 | DBS/帕金森电生理 |
| E41 | Mutations in PLA2G6 impair ER–mitochondria contacts and ceramide homeostasis via GRP75 in Parkinson’s disease | 2025 | 10.21203/rs.3.rs-7426255/v1 | 帕金森/ER-线粒体接触 |
| E42 | [Circadian rhythm disturbances and neurodevelopmental disorders]. | 2025 | 10.13294/j.aps.2025.0065 | 节律与NDD综述 |
| E43 | Functional Validation and Phenotypic Spectrum of Splice‐Site Variants in <scp> <i>CHD7</i> </scp> , <scp> <i>FGFR1</i> </scp> , and <scp> <i>ANOS1</i> </scp> in Congenital Hypogonadotropic Hypogonadism | 2025 | 10.1111/cge.70114 | CHH/剪接变异验证 |
| E44 | Reciprocal regulation between autism risk gene POGZ and circadian clock | 2026 | 10.1172/jci.insight.193622 | 孤独症POGZ/生物钟双向调控 |

## 🧾 Boundary Statement

本报告仅基于 OpenAlex 公开学术数据及中南大学署名过滤文献生成，不使用任何未公开的个人评价或内部经历数据。本报告不评价导师个人性格、责任心、指导精力或实验室人文氛围；不推断课题组经费、设备权限或内部招生名额；不对本科生的论文发表、竞赛获奖或科研成果作任何承诺。报告中关于本科生可能参与的任务、能力提升路径、技术门槛及课业冲突风险，均为基于公开论文技术栈的条件式推断，仅供参考。
