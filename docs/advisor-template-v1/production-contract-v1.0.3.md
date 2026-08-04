# 导师公开数据生产合同 v1.0.3

## 定位

本版本只收口批量生产前的机械门禁。`public-advisor-v1.md` 是结构化数据的可读导出报告和证据审阅视图，不是最终前端 UI。权威数据方向始终是 JSON/Manifest → Validator → Markdown，禁止从 Markdown 反向生成 JSON。

## 日期模型

- `record_created_at` 必填，表示本份结构化记录首次建立日期。
- `migrated_at` 必填但允许为 `null`；只有从旧数据迁移时填写真实迁移日期，全新导师必须为 `null`。
- `last_verified_at` 只记录实际查看官方或可靠公开来源的日期，不得用创建、生成或迁移日期代替。

## 三份 Schema

Validator 必须分别调用 `public-advisor-schema-v1.0.3.json`、`evidence-manifest-schema-v1.0.3.json` 和 `identity-review-schema-v1.0.3.json`。Validation Report 分别记录三份 Schema 的结果；Renderer 不读取报告时不得声称 Schema 或字段绑定已通过。

## Evidence 与文件职责

- `public-advisor-v1.json`：公开主档、实际采用证据、精选状态及精选人工审核记录。
- `evidence-manifest-v1.json`：完整 `candidate_evidence` 候选池，保存采用、排除、重复、身份状态、版本组和字段绑定。
- `identity-review-v1.json`：内部作者消歧、机构、ORCID、论文身份与 P0 门禁。
- `validation-report-v1.json`：三份 Schema、跨文件一致性、计数和发布资格。

`adopted_public_evidence_ids` 必须存在于 Manifest 且等于公开结论实际引用集合；`featured_publication_evidence_ids` 必须是 adopted 子集，不得含排除或重复候选；Markdown 引用集合必须等于 adopted。

## 人工精选审核

`featured_selection_review` 包含 `status`、`reviewed_at`、`reviewer_role`、`selection_criteria` 和 `notes`。

- `pending_manual_review` 必须对应 `status: pending`，featured 必须为空。
- `manually_reviewed` 必须对应 `status: approved`。
- approved 必须有核验日期、`user` 或 `content_reviewer` 角色和非空筛选标准。
- 模型、Renderer 和机械迁移工具不得自行标记为用户审核通过。

## 中文显示与可信边界

英文枚举只用于底层数据。所有可能进入 Markdown 的枚举必须在 `display-label-mapping-v1.0.3.json` 中有中文映射；映射缺失时 Renderer 必须明确失败，禁止静默显示机器代码。

第 12 章使用“候选证据总数”和“已采用公开证据数”。Renderer 不读取 Validation Report，因此固定显示：

- “版本关系状态：请以validation-report-v1.json为准。”
- “Schema与字段绑定结果：请以validation-report-v1.json为准。”

公开 Markdown 禁止内部路径、行号、具体学生经历和英文机器状态码。

## 发布门禁

任何未解决 P0、采用证据身份未确认、精选审核状态冲突或三份 Schema 失败，均不得达到 `release_eligible=true`。机械通过不替代人工身份、语义、隐私和发布审核。
