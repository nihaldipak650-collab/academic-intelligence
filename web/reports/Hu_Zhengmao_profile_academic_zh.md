# 导师画像：胡正茂

## ✨ 一句话硬核总结

公开研究主线集中在高度近视（High Myopia）与孤独症（ASD）等人类遗传性疾病的致病基因鉴定及分子功能机制（如胶原修饰/ECM 平衡、有丝分裂、长读长串联重复变异及线粒体融合）[E18, E25, E30, E31, E32, E33]，本科生基于公开论文技术栈可能从眼科/神经遗传测序数据挖掘（长/短读长 WGS）、Minigene 剪接验证或胶原/线粒体细胞表型实验切入，核心门槛在于兼具人类遗传学数据分析与细胞/分子生物学验证能力。

## 🧬 Academic Mapping

### Identity and OpenAlex Match

- **姓名**：胡正茂（Zhengmao Hu）
- **OpenAlex display name**：Zhengmao Hu
- **OpenAlex Author ID**：https://openalex.org/A5023140496
- **ORCID**：https://orcid.org/0000-0002-3921-8205
- **目标机构署名**：Central South University / 中南大学生命科学学院医学遗传学国家重点实验室/医学遗传中心
- **匹配度与置信度**：匹配置信度 **High**（经中南大学署名严格过滤后）

### Author Disambiguation Risk

- **同名作者污染风险**：**Low**。OpenAlex 原始记录 A5023140496 检索出 34 篇作品，经机构过滤后 33 篇明确为中南大学署名，同名归属污染风险低。
- **过滤规则与边界**：本报告严格限定为目标作者署名中明确带有 Central South University 的 33 篇作品，排除了 1 篇非中南大学署名作品及 1 篇预印本重复记录，确保证据纯净。
- **归属注意事项**：保留的 33 篇文献中，双核心主线明确集中于高度近视遗传学与孤独症/神经遗传病；少数牙发育 [E27] 或肿瘤耐药 [E21] 为跨科室合作，不扩大为核心主线。

### Recent Five-Year Scope

- **检索年份范围**：2022–2026 年（近五个日历年）
- **检索作品总数**：34 篇
- **中南大学署名过滤后作品数**：33 篇
- **DOI/题名去重后论文数**：33 篇
- **重复记录 / 预印本冲突**：预印本记录已去重合并，全部 33 篇记录均具备有效 DOI，由 `evidence_manifest.json` 锁定，无重复计算。

### Core Research Directions

- **核心主线 1：高度近视（High Myopia）与眼科遗传学**：高度近视新致病基因（GLRA2, CCDC66, P4HA2, CHST5）鉴定、胶原蛋白翻译后修饰、细胞外基质（ECM）平衡及细胞有丝分裂调控 [E5, E25, E30, E32]；OPA1 突变致视神经萎缩 [E18]；NOTCH2NLC 重复扩增致视网膜神经变性小鼠模型 [E29]；CRYGC 先天性白内障 [E24]。
- **核心主线 2：孤独症（ASD）与神经发育障碍基因组学**：中国孤独症队列罕见变异图谱 [E33]、长读长测序（Long-read WGS）揭示串联重复变异（Tandem-repeat）亲本效应 [E31]、核编码线粒体基因变异 [E26]、Rafiq 综合征 (MAN1B1) [E19] 及 INTS6/GIGYF2 神经机制 [E20, E22]。
- **核心主线 3：神经肌肉病与运动神经元疾病**：TRMT2B 变异与青少年型肌萎缩侧索硬化症（JALS）[E16]、THAP11 脊髓小脑性共济失调 [E3] 及 Charcot-Marie-Tooth 病 [E7, E12]、遗传性感觉神经病（HSN）家族遗传表型 [E28]。
- **外围/临床合作**：MYO5B 胆汁淤积内含子保留 [E17]、NF1 胫骨假关节 [E23]、PAX9 先天缺牙 [E27] 及 CSDE1 肿瘤耐药 [E21]。对于部分多中心/课题组交叉论文 [E1, E2, E4, E6, E8, E9, E10, E11, E13, E14, E15]，保留在证据列表中但不扩大为主线。

### Core Scientific Questions

只基于 33 篇论文可以支持的科学问题：

1. **高度近视（HM）新致病基因与细胞外基质（ECM）分子调控**：CCDC66 如何通过影响细胞有丝分裂导致高度近视 [E25]？P4HA2 与 CHST5 突变如何破坏胶原蛋白翻译后修饰与胶原纤维组织 [E30, E32]？GLRA2 基因突变如何导致高度近视 [E5]？
2. **孤独症（ASD）与神经发育障碍中的结构变异与串联重复**：长读长三代测序如何解析 ASD 患者基因组中的串联重复变异及其亲本起源效应 [E31]？中国 ASD 大队列中罕见变异的遗传图谱为何 [E33]？
3. **线粒体动力学与眼/神经病理**：OPA1 结构域特异性突变如何影响线粒体融合与视神经细胞凋亡 [E18]？NOTCH2NLC GGC 重复扩增如何诱发视网膜神经元变性 [E29]？
4. **单基因罕见病变异的剪接与表达致病验证**：MYO5B [E17]、PAX9 [E27]、MAN1B1 [E19] 等致病变异如何导致内含子保留或蛋白质功能缺失？

### Main Technical Routes

基于论文证据整理的反复出现的实验与计算技术：

1. **长读长与短读长基因组学**：全外显子组测序（WES）、全基因组测序（WGS）、单倍型解析三代长读长测序（Long-read WGS）、串联重复变异（TRV）算法 [E25, E31, E33]。
2. **胶原修饰、细胞外基质与有丝分裂检测**：胶原蛋白电镜/荧光染色、P4HA2 脯氨酸羟化酶活性检测、细胞周期与有丝分裂荧光显微成像 [E25, E30, E32]。
3. **线粒体融合/裂变与细胞凋亡验证**：OPA1 突变体转染、线粒体形态高分辨成像、流式细胞术检测细胞凋亡 [E18]。
4. **迷你基因（Minigene）与 RNA 剪接分析**：体外 Minigene 构建、RT-PCR/qPCR 剪接产物分析、Western blot 蛋白表达验证 [E17, E19, E24, E27]。

### Research Evolution

- **2022年**：聚焦神经遗传病变异鉴定（UBAP2L, KMT5B）[E2, E6]、GLRA2 高度近视 [E5]、MYO5B 内含子保留 [E17] 及 CRYGC 先天性白内障 [E24]。
- **2023-2024年**：突破 CCDC66 高度近视新基因 [E25]、JALS 风险基因 TRMT2B [E16]、PAX9 缺牙机制 [E27] 及核编码线粒体基因在 ASD 中的作用 [E26]。
- **2025-2026年**：在眼科遗传学取得重大突破（P4HA2 [E30]、CHST5 [E32] 高度近视胶原机制，OPA1 视神经萎缩 [E18]，NOTCH2NLC 视网膜变性 [E29]），同时在 ASD 大队列与长读长测序领域发表重磅成果 [E31, E33]。
- **演化结论**：体现出从“常规外显子变异筛查”向“高度近视胶原/ECM 深入机制”及“三代长读长基因组学”纵深发展的特征。**Confidence: High**。

### Conditional Direction Trend

基于既有论文连续性的条件式趋势（非真实未发表计划）：

- 若课题组继续深耕高度近视，可能围绕 P4HA2/CHST5/CCDC66 等基因开展高通量筛查与巩膜/脉络膜细胞 ECM 修复干预 [E25, E30, E32]；
- 若依托长读长测序技术 [E31]，可能针对更多未解神经/眼科罕见病开展非编码区及复杂重复序列深度解析。

## 🎓 Undergraduate Perspective

### Suitable Undergraduate Profile

- **兴趣匹配**：对眼科遗传学（高度近视/白内障）、孤独症基因组学、三代长读长测序数据分析、胶原/线粒体细胞生物学感兴趣。
- **基础要求**：具备遗传学、生物信息学（Python/Linux）或分子/细胞生物学基础；有较强的文献阅读与基因组变异解读能力。

### Possible Undergraduate Tasks

1. 如果存在测序数据、任务边界与指导条件，本科生可能尝试利用生物信息学工具分析高度近视或 ASD 患者的外显子/长读长测序数据，筛选候选突变。Confidence: Medium。[E25, E31, E33]
2. 如果存在质粒载体、成熟 protocol 与指导条件，本科生可能辅助参与 Minigene 质粒构建、转染及 RT-PCR 验证罕见变异的剪接影响。Confidence: Low–Medium。[E17, E27]
3. 如果存在成熟实验体系与指导条件，本科生可能协助开展细胞水平的线粒体形态染色（OPA1）或胶原分泌检测。Confidence: Low–Medium。[E18, E30]

以上内容仅为根据公开论文技术栈形成的条件式任务参考，不代表课题组会向本科生提供相应任务、数据、试剂、设备、资源或指导。

### Expected Skill Development

- **论文直接支持的技术能力**：WES/WGS/Long-read 测序数据分析、Minigene 剪接验证技术、细胞培养与转染、线粒体/胶原显微成像、Western blot 与 qPCR。
- **间接推测的综合能力**：ACMG 变异致病性评级能力、基因组结构变异（SV/TRV）分析能力、严谨的实验对照设计。

### Long-term Advisor Fit

- **方向适配条件**：适合希望在人类遗传学、眼科疾病机制与长读长基因组学领域接受全面训练，能够兼顾数据分析与细胞验证的本科生。
- **不适配条件**：对遗传学完全不感兴趣、抗拒编程与数据分析，或无法保证持续时间者。

### Participation Path Barriers

- **数据分析与变异解读路径**：门槛中等，需要掌握 Linux 命令行、Python/R 脚本及基因组变异过滤软件。
- **Minigene 与剪接验证路径**：门槛中等，需要具备分子克隆、PCR、凝胶电泳与细胞转染技能。
- **长读长重复序列与线粒体成像路径**：门槛较高，需要掌握三代测序分析算法或高分辨显微成像。

## 📈 Growth Path

This growth path represents a possible development scenario inferred from available evidence. It does not represent actual laboratory arrangements.

以下内容仅为基于公开学术证据构建的条件式发展情景，不代表课题组真实培养流程、任务分配或指导安排。

### 0-3 Months

- 学习人类遗传学、高度近视/ASD 遗传学背景及 ACMG 变异指南。
- 了解基因组分析基础命令行或分子克隆/细胞培养安全规范。

### 3-6 Months

- 尝试练习具体变异的生信筛选或 Minigene 剪接示例数据处理。
- 可通过公开论文阅读与模拟研究问题整理，逐步理解该方向的科学问题。公开学术证据无法证明该课题组本科生是否参加组会或 Discussion。

### 6-12 Months

- 如果具备条件，可尝试特定变异的细胞表型分析学习（如胶原/线粒体检测）。
- 整理文献阅读与练习记录，练习撰写学术总结报告。

## ⚠️ Risk Controller

### Technical Barrier

**任务属性层面**：技术门槛较高。课题涉及人类遗传学前沿（长读长 WGS）、眼科胶原机制及线粒体动力学 [E18, E25, E31, E32]，需要较强的理论与实操能力。

**实验室现实安排**：Evidence insufficient. Unable to determine.

**条件式建议**：如果学生能够获得明确指导与实验条件，可优先从数据分析或 Minigene 剪接切入。该建议不代表实验室会提供上述条件。

### Learning Cost

**任务属性层面**：学习成本高。长读长变异分析算法较新；细胞实验需要较长时间的操作培训。

**实验室现实安排**：Evidence insufficient. Unable to determine.

### Feedback Cycle

从任务属性看，文献整理、公开数据分析和单一变异筛选通常比完整机制研究更容易划分检查节点。

但该课题组的真实反馈频率、等待时间和指导方式：
Evidence insufficient. Unable to determine.

### Expected Milestone Feasibility

**任务属性层面**：如果任务边界清晰，并且已有数据、方法、指导和资源条件，学生可能形成文献综述、变异筛选记录或 Minigene 剪接测试图谱等可检查材料。

**实验室现实安排**：是否能够形成论文、竞赛、软件著作权或其他正式成果：
Evidence insufficient. Unable to determine.

### Coursework Conflict

**任务属性层面**：可异步完成的生信数据分析任务，通常比需要连续实验时间点的细胞/剪接实验更容易与课程并行。

**实验室现实安排**：但该课题组的实际时间要求、课程冲突和安排灵活度：
Evidence insufficient. Unable to determine.

### Risk Mitigation Strategy

- **优先建议**：选择生信变异分析或 Minigene 剪接验证切入，降低初期物理时间限制。
- **本科科研参与风险等级**：
  - 数据分析与变异解读路径：Medium。
  - Minigene 与剪接验证路径：Medium。
  - 长读长重复序列与线粒体成像路径：High。
  - 综合评估本科科研参与风险等级：Medium。
- **风险判断 Evidence Confidence**：High。依据为公开论文显示该团队在高度近视与神经遗传学领域具备完善的 WES/WGS 测序、Minigene 剪接与细胞成像体系 [E18, E25, E31, E33]，技术路径清晰。
- **作者身份匹配置信度**：High。

## 🔎 Evidence Confidence

| 关键判断 | 置信度等级 | 支持证据 | 限制与边界 |
|---|---|---|---|
| 导师身份与中南大学机构匹配 | High | OpenAlex A5023140496 结合中南大学署名过滤 [E1-E33] | 机构匹配度极高 |
| 核心主线包含高度近视与眼科遗传学 | High | 2022–2026 年多篇近视与眼科论文直接支持 [E5, E18, E24, E25, E29, E30, E32] | 不包含排出的非中南大学署名作品 |
| 孤独症与长读长基因组学为重要方向 | High | 2026 Sci Bull [E31] 与 2026 Mol Psychiatry [E33] 重磅支持 | 证明技术存在，不代表本科生必然安排 |
| 具备 Minigene 剪接与细胞验证技术 | High | 多篇论文明示内含子保留与剪接验证 [E17, E18, E19, E27] | 局限于公开论文技术栈 |
| 本科生实际带教频率与实验室氛围 | No Evidence | 无公开学术证据支持 | Evidence insufficient. Unable to determine. |

## 🛠️ Survival Checklist

- **必备基础**：遗传学与分子生物学基础、Linux 基础命令（生信方向）或分子克隆基础（实验方向）。
- **推荐技能**：理解 ACMG 变异评级标准、熟悉 PyMOL / IGV 等可视化工具、掌握 Minigene 剪接验证逻辑。
- **可执行准备路线**：阅读 2023 JMG `CCDC66` [E25] 与 2026 Sci Bull 长读长 ASD [E31] 论文，理解高度近视与神经遗传学研究的基本框架。

## 🧑‍🎓 Experience Evidence

- `has_experience_evidence: false`
- `experience_case_count: 0`
- `evidence_type: academic_only`
- 当前仅包含公开学术证据，暂无经过授权的本科生经历材料。
- 真实指导频率、实验室氛围、导师责任心与学生体验均为 **Evidence insufficient. Unable to determine.**

## 🔗 Evidence Intersection

当前仅包含 Academic Evidence（基于 OpenAlex 检索与中南大学署名过滤的 33 篇公开论文），未接入 Experience Evidence，因此无法进行学术证据与经历证据的交叉验证。

## 📚 Evidence Source

| Evidence ID | 论文题名 | 发表年份 | DOI | 关联方向 |
|---|---|---|---|---|
| E1 | Genome-wide association study using whole-genome sequencing identifies risk loci for Parkinson’s disease in Chinese population | 2023 | 10.1038/s41531-023-00456-6 | 帕金森病GWAS |
| E2 | De novo variants in genes regulating stress granule assembly associate with neurodevelopmental disorders | 2022 | 10.1126/sciadv.abo7112 | 应激颗粒/NDD |
| E3 | <scp>CAG</scp> Repeat Expansion in <scp><i>THAP11</i></scp> Is Associated with a Novel Spinocerebellar Ataxia | 2023 | 10.1002/mds.29412 | 脊髓小脑共济失调/THAP11 |
| E4 | GIGYF1 disruption associates with autism and impaired IGF-1R signaling | 2022 | 10.1172/jci159806 | 孤独症/IGF-1R |
| E5 | <i>GLRA2</i>gene mutations cause high myopia in humans and mice | 2022 | 10.1136/jmedgenet-2022-108425 | GLRA2/高度近视 |
| E6 | Loss-of-function of KMT5B leads to neurodevelopmental disorder and impairs neuronal development and neurogenesis | 2022 | 10.1016/j.jgg.2022.03.004 | NDD/神经发生 |
| E7 | Clinical and genetic features of Charcot-Marie-Tooth disease patients with IGHMBP2 mutations | 2022 | 10.1016/j.nmd.2022.05.002 | CMT/IGHMBP2 |
| E8 | Expression of expanded GGC repeats within NOTCH2NLC causes cardiac dysfunction in mouse models | 2023 | 10.1186/s13578-023-01111-6 | NOTCH2NLC/心脏小鼠模型 |
| E9 | Molecular Basis of VCPIP1 and P97/VCP Interaction Reveals Its Functions in Post‐Mitotic Golgi Reassembly | 2024 | 10.1002/advs.202403417 | VCPIP1/高尔基体重装 |
| E10 | Intergenic sequences harboring potential enhancer elements contribute to Axenfeld-Rieger syndrome by regulating PITX2 | 2024 | 10.1172/jci.insight.177032 | 临床遗传/增强子 |
| E11 | Monoallelic loss-of-function variants in GSK3B lead to autism and developmental delay | 2024 | 10.1038/s41380-024-02806-z | 孤独症/GSK3B |
| E12 | One PMP22/MPZ and Three MFN2/GDAP1 Concomitant Variants Occurred in a Cohort of 189 Chinese Charcot-Marie-Tooth Families | 2022 | 10.3389/fneur.2021.736704 | CMT神经病变异 |
| E13 | <i>KCTD10</i> p.C124W variant contributes to schizophrenia by attenuating LLPS-mediated synapse formation | 2024 | 10.1073/pnas.2400464121 | 相分离/突触 |
| E14 | Csde1 Mediates Neurogenesis via Post-transcriptional Regulation of the Cell Cycle | 2025 | 10.1007/s12264-025-01426-z | 神经发生/转录后 |
| E15 | A non-coding variant in 5’ untranslated region drove up-regulation of pseudo-kinase EPHA10 and caused non-syndromic hearing loss in humans | 2022 | 10.1093/hmg/ddac223 | EPHA10/听力损失 |
| E16 | Association of TRMT2B gene variants with juvenile amyotrophic lateral sclerosis | 2023 | 10.1007/s11684-023-1005-y | JALS/肌萎缩侧索硬化 |
| E17 | Case Report: MYO5B Homozygous Variant c.2090+3A&gt;T Causes Intron Retention Related to Chronic Cholestasis and Diarrhea | 2022 | 10.3389/fgene.2022.872836 | MYO5B/内含子保留剪接 |
| E18 | OPA1 mutations in dominant optic atrophy: domain-specific defects in mitochondrial fusion and apoptotic regulation | 2025 | 10.1186/s12967-025-06471-w | OPA1/视神经萎缩线粒体 |
| E19 | Bi-Allelic Loss-of-Function Variant in MAN1B1 Cause Rafiq Syndrome and Developmental Delay | 2025 | 10.3390/ijms26167820 | Rafiq综合征/MAN1B1 |
| E20 | Disrupting integrator complex subunit INTS6 causes neurodevelopmental disorders and impairs neurogenesis and synapse development | 2025 | 10.1172/jci191729 | INTS6/神经发生与突触 |
| E21 | CSDE1 enhances genotoxic drug resistance in cancer by modulating RPA2 through CSDE1-eIF3a regulatory complex | 2025 | 10.1016/j.drup.2025.101249 | 外围/CSDE1肿瘤耐药 |
| E22 | Evidence supporting the role of GIGYF2 in synapse development and autism | 2026 | 10.1038/s41380-026-03681-6 | GIGYF2/孤独症 |
| E23 | Case series of congenital pseudarthrosis of the tibia unfulfilling neurofibromatosis type 1 diagnosis: 21% with somatic NF1 haploinsufficiency in the periosteum | 2022 | 10.1007/s00439-021-02429-2 | NF1/胫骨假关节 |
| E24 | Case Report: A de novo Variant of CRYGC Gene Associated With Congenital Cataract and Microphthalmia | 2022 | 10.3389/fgene.2022.866246 | CRYGC/先天性白内障 |
| E25 | <i>CCDC66</i>mutations are associated with high myopia through affected cell mitosis | 2023 | 10.1136/jmg-2023-109434 | CCDC66/高度近视与有丝分裂 |
| E26 | Association between <i>de novo</i> variants of nuclear-encoded mitochondrial-related genes and undiagnosed developmental disorder and autism | 2023 | 10.1093/qjmed/hcad249 | 核编码线粒体基因/ASD |
| E27 | Identification and functional study of a novel variant of <scp> <i>PAX9</i> </scp> causing tooth agenesis | 2024 | 10.1111/odi.14937 | PAX9/先天缺牙 |
| E28 | Genetic and Clinical Features of 10 Families With Hereditary Sensory Neuropathies | 2025 | 10.1111/jns.70020 | HSN/遗传性感觉神经病 |
| E29 | NOTCH2NLC GGC repeat expansions cause retinal neurodegeneration in neuronal intranuclear inclusion disease mouse model | 2026 | 10.1186/s13578-026-01542-x | NIID/视网膜神经退行变性 |
| E30 | P4HA2 Participates in Pathogenesis of Refractive Error by Regulating Collagen Posttranslational Modification and Extracellular Matrix Balance | 2026 | 10.1155/humu/9995099 | P4HA2/高度近视胶原修饰与ECM |
| E31 | Haplotype-resolved long-read sequencing reveals parent-of-origin effects of tandem-repeat variation in autism spectrum disorder | 2026 | 10.1016/j.scib.2026.03.058 | 三代长读长/ASD串联重复变异 |
| E32 | CHST5 gene mutations contribute to high myopia by disrupting collagen fiber organization | 2026 | 10.1016/j.jgg.2026.06.007 | CHST5/高度近视胶原组织 |
| E33 | Genomic landscape of rare variants in a Chinese autism cohort and discovery of novel risk genes | 2026 | 10.1038/s41380-026-03754-6 | 中国孤独症队列全景图谱 |

## 🧾 Boundary Statement

本报告仅基于 OpenAlex 公开学术数据及中南大学署名过滤文献生成，不使用任何未公开的个人评价或内部经历数据。本报告不评价导师个人性格、责任心、指导精力或实验室人文氛围；不推断课题组经费、设备权限或内部招生名额；不对本科生的论文发表、竞赛获奖或科研成果作任何承诺。报告中关于本科生可能参与的任务、能力提升路径、技术门槛及课业冲突风险，均为基于公开论文技术栈的条件式推断，仅供参考。
