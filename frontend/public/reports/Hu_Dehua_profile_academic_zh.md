# 导师画像：胡德华

## ✨ 一句话硬核总结

公开研究主线集中在健康信息行为与公共卫生信息化（如疫苗接种意愿、框架效应、网络舆情与科研诚信）以及医学数据挖掘/算法与工具开发（深度学习死亡/影像预测、R包工具开发）[E1, E2, E8, E14, E18]，本科生基于公开论文技术栈可能从问卷调查数据统计、网络文本/舆情分析及生物信息或医学数据模型应用切入，核心门槛在于兼具统计学分析、数据挖掘（Python/R）与医学信息学背景。

## 🧬 Academic Mapping

### Identity and OpenAlex Match

- **姓名**：胡德华（Dehua Hu）
- **OpenAlex display name**：Dehua Hu
- **OpenAlex Author ID**：https://openalex.org/A5073045477
- **ORCID**：https://orcid.org/0000-0001-9257-2270
- **目标机构署名**：Central South University / 中南大学湘雅医学院医药信息系/生命科学学院
- **匹配度与置信度**：匹配置信度 **High**（经中南大学署名严格过滤后）

### Author Disambiguation Risk

- **同名作者污染风险**：**High**。OpenAlex 原始记录 A5073045477 包含 35 篇作品，其中包含部分非中南大学同名作者（如化学或材料领域）的噪声记录。
- **过滤规则与边界**：本报告严格限定为目标作者署名中明确带有 Central South University 的 21 篇作品，排除了 14 篇非中南大学署名作品，消除了跨领域污染。
- **归属注意事项**：保留的 21 篇文献中，双核心主线为健康信息行为/公卫信息化与医学数据挖掘/生物信息工具；少数涉及结构生物学能量景貌（[E7]）或前列腺癌 biomarker（[E17]）的合作论文，不扩大为核心主线。

### Recent Five-Year Scope

- **检索年份范围**：2022–2026 年（近五个日历年）
- **检索作品总数**：35 篇
- **中南大学署名过滤后作品数**：21 篇
- **DOI/题名去重后论文数**：21 篇
- **重复记录 / 预印本冲突**：预印本 [E19] 保留用于体现舆情演化最新进展，全部 21 篇记录均由 `evidence_manifest.json` 锁定，无重复计算。

### Core Research Directions

- **核心主线 1：健康信息行为、信息框架与公共卫生信息学**：信息框架效应（Framing Effect）、健康信念模型（HBM）、双系统模型（HSM）在 COVID-19/带状疱疹疫苗接种意愿、口罩佩戴及在线健康社区用户行为中的应用 [E1, E3, E5, E6, E9, E10, E11, E12, E21]。
- **核心主线 2：重大公卫事件网络舆情演化与谣言辟谣机制**：疫情防控政策调整前后网络舆情演化特征、谣言传播与辟谣对比分析（Infodemiology Study）[E13, E16, E19]。
- **核心主线 3：医学科研诚信与生成式 AI（GenAI）影响**：生成式 AI 对医学科研诚信意识与行为的影响评估 [E14]、医学论文署名位置与团队身份的学术不端责任归因 [E15]。
- **核心主线 4：医学数据挖掘、深度学习与工具开发**：基于深度神经网络的重症急性心衰死亡预测 [E2]、FDG-PET/CT 影像深度学习预测肺癌预后 [E4]、甲状腺结节冷冻切片多任务预测 [E20] 以及生物生物信息对齐/回归分析 R 包开发（ggalign [E8], bregr [E18]）。

### Core Scientific Questions

只基于 21 篇论文可以支持的科学问题：

1. **信息框架与健康心理学模型如何驱动公众健康决策**：增益/损失框架、社会规范与信息可信度如何交互影响公众疫苗接种（COVID-19/带状疱疹）与卫生防护行为 [E1, E3, E9, E10, E11, E21]？
2. **重大公共卫生事件中的舆情演化与信息流行病学（Infodemiology）**：公共卫生政策重大调整前后，社交媒体舆情演化模式与谣言辟谣机制有何异同 [E13, E16, E19]？
3. **GenAI 与科研诚信归因的社会技术学**：生成式 AI 工具如何改变医学研究者的诚信认知，以及作者署名次序与团队身份如何影响学术不端责任归因 [E14, E15]？
4. **深度学习与统计回归工具在临床预测与生物信息中的应用**：深度神经网络与 PET/CT/冰冻切片图像如何提升心衰死亡与肿瘤预后预测精度 [E2, E4, E20]？如何设计高效率的生物信息回归与图形对齐工具 [E8, E18]？

### Main Technical Routes

基于论文证据整理的反复出现的实验与计算技术：

1. **问卷调查与量表编制（Psychometrics）**：基于健康信念模型（HBM）、健康素养量表、自我量化 scale 编制与结构方程模型（SEM）分析 [E1, E3, E5, E6, E10, E11, E14, E21]。
2. **网络文本挖掘与舆情分析**：社交媒体/在线健康社区文本爬取、主题建模（LDA）、情感分析与舆情演化网络分析 [E11, E12, E13, E16, E19]。
3. **医学深度学习与影像组学**：MIMIC 电子病历数据挖掘、DNN/CNN 临床预测模型构建、FDG-PET/CT 及冷冻切片图像深度学习 [E2, E4, E20]。
4. **R 语言统计与生物信息软件包开发**：R 包开发（R Package Development）、Bioconductor/tidyverse 生物信息图形与回归建模封装（ggalign, bregr）[E8, E18]。

### Research Evolution

- **2022年**：聚焦 COVID-19 疫苗接种意愿、口罩佩戴信息框架、高血压自我量化量表及在线健康社区行为 [E3, E5, E6, E9, E10, E12]。
- **2023-2024年**：拓展至疫苗加强针意愿 [E1, E11]、心衰与肺癌深度学习预测 [E2, E4]、舆情演化与谣言辟谣机制 [E13, E19]、科研诚信责任归因 [E15] 及 JAK1/前列腺癌计算方法 [E7, E17]。
- **2025-2026年**：深化生成式 AI 对科研诚信的影响 [E14]、公卫政策调整舆情演化 [E16]、带状疱疹疫苗意愿 [E21]、甲状腺结节深度学习 [E20] 以及前沿 R 语言生物信息工具开发 [E8, E18]。
- **演化结论**：体现出从“常规公卫问卷与信息行为分析”向“大数据/文本挖掘”、“AI与科研诚信”及“深度学习医学预测/R工具开发”双轮驱动发展的特征。**Confidence: High**。

### Conditional Direction Trend

基于既有论文连续性的条件式趋势（非真实未发表计划）：

- 若课题组继续推进行为与政策信息化，可能结合 LLM/GenAI 开展更深层次的健康传播干预与科研诚信行为演化研究 [E14, E16]；
- 若依托医学数据挖掘与 R 包开发基础 [E8, E18, E20]，可能推出更多面向临床多模态数据与生物信息可视化的计算工具。

## 🎓 Undergraduate Perspective

### Suitable Undergraduate Profile

- **兴趣匹配**：对医学信息学、健康传播与行为学、数据挖掘、问卷与文本分析、医学 AI 或 R 语言工具开发感兴趣。
- **基础要求**：具备应用统计学、流行病学/医学信息学基础，或掌握 Python/R 语言数据分析技能；具备良好的问卷设计或数据清洗能力。

### Possible Undergraduate Tasks

1. 如果存在问卷设计、数据抽取与指导条件，本科生可能尝试协助进行健康行为问卷数据清洗与结构方程模型（SEM）或回归统计分析。Confidence: Medium。[E1, E11, E21]
2. 如果存在公开数据源与指导条件，本科生可能尝试参与社交媒体文本数据爬取、主题分析与舆情演化图表绘制。Confidence: Medium。[E13, E16, E19]
3. 如果存在开放数据与指导条件，本科生可能辅助进行开源数据（如 MIMIC）的预处理、R 包（如 bregr, ggalign）测试或深度学习模型代码调优。Confidence: Low–Medium。[E2, E8, E18, E20]

以上内容仅为根据公开论文技术栈形成的条件式任务参考，不代表课题组会向本科生提供相应任务、数据、试剂、设备、资源或指导。

### Expected Skill Development

- **论文直接支持的技术能力**：问卷设计与心理测量学（Scale Development）、结构方程模型（SEM）、Python 文本挖掘与 LDA 主题分析、MIMIC/医学影像深度学习、R 语言 Package 开发。
- **间接推测的综合能力**：交叉学科文献研读、流行病学调查设计、生物医学数据可视化与统计建模能力。

### Long-term Advisor Fit

- **方向适配条件**：希望在医学信息学、健康大数据分析、公共卫生传播或医学 AI 交叉领域接受系统训练，喜欢数据驱动或问卷/文本分析的本科生。
- **不适配条件**：仅寻求传统湿实验/动物实验、抗拒编程与数据处理，或缺乏统计学基础者。

### Participation Path Barriers

- **问卷调查与统计分析路径**：门槛较低至中等，需掌握 SPSS/Stata/R 及基础统计学与问卷设计方法。
- **文本挖掘与舆情分析路径**：门槛中等，需要掌握 Python 爬虫、文本预处理及自然语言处理（NLP）基础。
- **深度学习模型与 R 包开发路径**：门槛较高，需要掌握 PyTorch/TensorFlow 或 R 包高级开发架构。

## 📈 Growth Path

This growth path represents a possible development scenario inferred from available evidence. It does not represent actual laboratory arrangements.

以下内容仅为基于公开学术证据构建的条件式发展情景，不代表课题组真实培养流程、任务分配或指导安排。

### 0-3 Months

- 学习健康信念模型（HBM）、框架效应及医学信息学背景文献。
- 了解 R/Python 基础数据清洗与统计分析方法。

### 3-6 Months

- 尝试练习问卷数据处理、文本数据主题分析或公开数据库的预处理。
- 学习独立整理数据分析结果并绘制可视化图形。

### 6-12 Months

- 如果具备条件，可尝试特定信息行为主题的问卷/舆情数据分析，或参与算法/R 包功能模块的测试学习。
- 整理文献阅读与分析记录。是否能够形成论文、竞赛、软件著作权或其他正式成果：
  Evidence insufficient. Unable to determine.

## ⚠️ Risk Controller

### Technical Barrier

**任务属性层面**：问卷调查与基础统计门槛相对平缓，但深度学习预测与 R 包开发需要较强的编程能力 [E2, E8, E18, E20]。

**实验室现实安排**：Evidence insufficient. Unable to determine.

**条件式建议**：如果学生获得明确指导与数据条件，可根据自身背景选择问卷统计或数据挖掘切入。该建议不代表实验室会提供上述条件。

### Learning Cost

**任务属性层面**：学习统计分析软件（R/SPSS）与 NLP/深度学习框架需要一定的学习曲线。

**实验室现实安排**：Evidence insufficient. Unable to determine.

### Feedback Cycle

从任务属性看，文献整理、问卷数据分析和舆情文本挖掘通常比复杂湿实验更容易划分检查节点。

但该课题组的真实反馈频率、等待时间和指导方式：
Evidence insufficient. Unable to determine.

### Expected Milestone Feasibility

**任务属性层面**：如果任务边界清晰，并且已有数据、方法、指导和资源条件，学生可能形成文献综述、数据清洗记录、问卷分析图表或模型测试记录等可检查材料。

**实验室现实安排**：是否能够形成论文、竞赛、软件著作权或其他正式成果：
Evidence insufficient. Unable to determine.

### Coursework Conflict

**任务属性层面**：可异步完成的文献或公开数据任务，通常比需要连续实验时间点的任务更容易与课程并行。

**实验室现实安排**：但该课题组的实际时间要求、课程冲突和安排灵活度：
Evidence insufficient. Unable to determine.

### Risk Mitigation Strategy

- **优先建议**：选择问卷统计或文本数据分析切入，降低前期物理时间冲突风险。
- **本科科研参与风险等级**：
  - 问卷调查与数据统计分析路径：Low。
  - 文本挖掘与舆情分析路径：Medium。
  - 深度学习模型与 R 包开发路径：High。
  - 综合评估本科科研参与风险等级：Low。
- **风险判断 Evidence Confidence**：High。依据为公开论文显示该团队研究路线主要基于问卷数据、公共文本与开源医疗数据分析 [E1, E2, E8, E14, E18]，技术路径清晰。
- **作者身份匹配置信度**：High。

## 🔎 Evidence Confidence

| 关键判断 | 置信度等级 | 支持证据 | 限制与边界 |
|---|---|---|---|
| 导师身份与中南大学机构匹配 | High | OpenAlex A5073045477 结合中南大学署名过滤 [E1-E21] | 经严格机构消歧，去除了同名噪声 |
| 核心主线为健康信息行为与公卫信息化 | High | 2022–2026 年多篇问卷与信息行为论文连续支持 [E1, E3, E5, E6, E9-E12, E21] | 不包含排除的 14 篇非中南大学署名作品 |
| 包含文本挖掘、舆情演化与 GenAI 研究 | High | 2023–2025 年舆情演化 [E13, E16, E19] 与 GenAI 诚信 [E14] 论文支持 | 证明方向存在，不代表本科生必然安排 |
| 包含医学深度学习与 R 包工具开发 | High | 2024–2026 年心衰/肺癌预测 [E2, E4, E20] 及 ggalign/bregr [E8, E18] 直接支持 | 技术门槛相对较高 |
| 本科生实际带教频率与实验室氛围 | No Evidence | 无公开学术证据支持 | Evidence insufficient. Unable to determine. |

## 🛠️ Survival Checklist

- **必备基础**：应用统计学、医学信息学或 Python/R 编程基础。
- **推荐技能**：掌握 R 语言（tidyverse, ggplot2）、结构方程模型（AMOS/lavaan）、Python NLP 文本处理库（jieba, scikit-learn）。
- **可执行准备路线**：阅读 2024 Front Public Health 框架效应论文 [E1] 与 2025 GenAI 诚信论文 [E14]，理解问卷与信息行为研究的基本逻辑。

## 🧑‍🎓 Experience Evidence

- `has_experience_evidence: false`
- `experience_case_count: 0`
- `evidence_type: academic_only`
- 当前仅包含公开学术证据，暂无经过授权的本科生经历材料。
- 真实指导频率、实验室氛围、导师责任心与学生体验均为 **Evidence insufficient. Unable to determine.**

## 🔗 Evidence Intersection

当前仅包含 Academic Evidence（基于 OpenAlex 检索与中南大学署名过滤的 21 篇公开论文），未接入 Experience Evidence，因此无法进行学术证据与经历证据的交叉验证。

## 📚 Evidence Source

| Evidence ID | 论文题名 | 发表年份 | DOI | 关联方向 |
|---|---|---|---|---|
| E1 | A study on the factors influencing the intention to receive booster shots of the COVID-19 vaccine in China based on the information frame effect | 2024 | 10.3389/fpubh.2024.1258188 | 信息框架/疫苗接种意愿 |
| E2 | Prediction of mortality events of patients with acute heart failure in intensive care unit based on deep neural network | 2024 | 10.1016/j.cmpb.2024.108403 | 深度学习/急性心衰预测 |
| E3 | The Uptake and Vaccination Willingness of COVID-19 Vaccine among Chinese Residents: Web-Based Online Cross-Sectional Study | 2022 | 10.3390/vaccines10010090 | 疫苗意愿/横断面调查 |
| E4 | Deep Learning to Predict the Cell Proliferation and Prognosis of Non-Small Cell Lung Cancer Based on FDG-PET/CT Images | 2023 | 10.3390/diagnostics13193107 | 深度学习/肺癌预后 |
| E5 | Development and Validation of a Self-Quantification Scale for Patients With Hypertension | 2022 | 10.3389/fpubh.2022.849859 | 心理测量/高血压量化量表 |
| E6 | The Development and Preliminary Application of the Chinese Version of the COVID-19 Vaccine Literacy Scale | 2022 | 10.3390/ijerph192013601 | 疫苗素养量表 |
| E7 | A novel approach to study multi-domain motions in JAK1’s activation mechanism based on energy landscape | 2024 | 10.1093/bib/bbae079 | 外围/JAK1结构计算 |
| E8 | ggalign: Bridging the Grammar of Graphics and Biological Multilayered Complexity | 2025 | 10.1002/advs.202507799 | R包开发/生物信息图形 |
| E9 | Effect of Information Framing on Wearing Masks During the COVID-19 Pandemic: Interaction With Social Norms and Information Credibility | 2022 | 10.3389/fpubh.2022.811792 | 口罩佩戴/框架效应 |
| E10 | Exploring the Willingness of the COVID-19 Vaccine Booster Shots in China Using the Health Belief Model: Web-Based Online Cross-Sectional Study | 2022 | 10.3390/vaccines10081336 | 健康信念模型(HBM) |
| E11 | How information processing and risk/benefit perception affect COVID-19 vaccination intention of users in online health communities | 2023 | 10.3389/fpubh.2023.1043485 | 在线健康社区/风险感知 |
| E12 | Exploring Users’ Health Behavior Changes in Online Health Communities: Heuristic-Systematic Perspective Study | 2022 | 10.3390/ijerph191811783 | 双加工视角/健康行为 |
| E13 | Difference in Rumor Dissemination and Debunking Before and After the Relaxation of COVID-19 Prevention and Control Measures in China: Infodemiology Study | 2024 | 10.2196/48564 | 谣言传播与辟谣/信息流行病学 |
| E14 | Assessing the influence of generative artificial intelligence (GenAI) on awareness and behavior in medical research integrity: An online survey study | 2025 | 10.1080/08989621.2025.2554696 | GenAI/科研诚信 |
| E15 | Scientific misconduct responsibility attribution: An empirical study on byline position and team identity in Chinese medical papers | 2024 | 10.1371/journal.pone.0308377 | 学术不端责任归因 |
| E16 | How online public opinion evolves before and after policy adjustments in response to major public health emergencies | 2025 | 10.3389/fpubh.2025.1438854 | 公卫政策/舆情演化 |
| E17 | Identifying Key Genes as Progression Indicators of Prostate Cancer with Castration Resistance Based on Dynamic Network Biomarker Algorithm and Weighted Gene Correlation Network Analysis | 2024 | 10.3390/biomedicines12092157 | 外围/前列腺癌网络算法 |
| E18 | <i>bregr</i> : An R Package for Streamlined Batch Processing and Visualization of Biomedical Regression Models | 2025 | 10.1002/mdr2.70028 | R包开发/回归模型可视化 |
| E19 | Characteristics of Network Public Opinion Evolution Before and after Policy Adjustment in Response to Major Public Health Emergencies: Evidence from the Optimization of Containment Measures for COVID-19 in China | 2023 | 10.2139/ssrn.4469391 | 舆情演化预印本 |
| E20 | Deep learning for multitask prediction on thyroid nodule frozen sections | 2026 | 10.3389/fonc.2025.1676360 | 深度学习/甲状腺切片 |
| E21 | Willingness and influencing factors of herpes zoster vaccination intention among Chinese residents: a study based on framing effects | 2026 | 10.3389/fpubh.2026.1849221 | 框架效应/带状疱疹疫苗 |

## 🧾 Boundary Statement

本报告仅基于 OpenAlex 公开学术数据及中南大学署名过滤文献生成，不使用任何未公开的个人评价或内部经历数据。本报告不评价导师个人性格、责任心、指导精力或实验室人文氛围；不推断课题组经费、设备权限或内部招生名额；不对本科生的论文发表、竞赛获奖或科研成果作任何承诺。报告中关于本科生可能参与的任务、能力提升路径、技术门槛及课业冲突风险，均为基于公开论文技术栈的条件式推断，仅供参考。
