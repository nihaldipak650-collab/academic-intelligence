# 导师公开数据生产合同 v1.0.2

## 定位

`public-advisor-v1.md` 是结构化数据的可读导出报告和证据审阅视图，不是最终前端 UI
规范。它不实现网页交互，也不重复展示完整候选论文池。

## 三层 Evidence

1. `candidate_evidence`：仅保存在 `evidence-manifest-v1.json` 的完整内部候选池，
   可以包含未采用、排除、版本重复和身份待核验记录。
2. `adopted_public_evidence_ids`：公开 JSON 实际采用并允许正文引用的证据编号。
3. `featured_publication_evidence_ids`：默认展示的精选代表性论文，必须是 adopted 的
   子集。`featured_selection_status` 为 `pending_manual_review` 时必须为空；完成
   `manually_reviewed` 后建议保留 6—10 条。

公开 JSON 和 Markdown 不再与 Manifest 的全部候选集合相等。新的不变量是：

- adopted 必须全部存在于 Manifest 且状态包含 `adopted`；
- featured 必须是 adopted 子集，不得包含排除项或版本重复项；
- excluded、candidate、duplicate_candidate 不得被公开结论引用；
- Markdown 正文引用集合必须等于 adopted 集合；
- Manifest 可以保存额外内部候选。

## 文件职责

- `public-advisor-v1.json`：公开主档、实际采用证据、精选状态和公开身份状态；不保存
  全部候选、内部日志或具体学生经历。
- `evidence-manifest-v1.json`：完整 `candidate_evidence`，记录
  `candidate_statuses`、排除原因、字段绑定、作者角色和 `version_group`。
- `identity-review-v1.json`：内部作者消歧、机构、ORCID、作者位置和 P0 发布门禁；
  详细内容不进入公开 Markdown。
- `validation-report-v1.json`：结构、跨文件一致性、计数和发布资格；不进入普通页面。

## 来源与日期

字段内部可保留 `source_ref`、`source_authority` 和仓库迁移来源。公开 Markdown 只显示
官方链接、缺失状态，或“现有仓库迁移材料，不作为正式官方来源”。禁止输出仓库路径、
内部文件名、行号和本地绝对路径。

`migrated_at` 是旧数据进入新合同的日期。`last_verified_at` 只表示实际查看官方或可靠
公开来源的日期；不得用生成或迁移日期代替。

## 内容与身份双维度

“证据支持程度”只表示证据对结论的支持，不表示导师质量或模型自信度。
`publication_identity_status` 独立表示导师论文归属是否完成核验。任何未解决 P0 都强制
`publication_status: review_pending`、`release_eligible: false`，页面显示“导师论文归属：
待核验”。

## Markdown 摘要规则

- 第 7 章“代表性论文”只展示 featured；尚未人工筛选时显示“代表性论文尚待人工
  筛选。完整候选证据已保存在内部证据清单中。”
- 第 12 章只显示候选总数、adopted 数、featured 数、身份状态、待处理版本组数和
  Schema/字段绑定状态；不得重复完整论文表。
- 第 13 章“更新时间与发布状态”显示迁移日期、更新状态和发布状态。
- 第 14 章为“使用边界说明”。
- 所有机器枚举通过 `display-label-mapping-v1.0.2.json` 转换为中文。
