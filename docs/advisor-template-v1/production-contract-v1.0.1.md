# 导师公开数据生产合同 v1.0.1

## 三份输入文件职责

### `public-advisor-v1.json`

保存公开导师主档、字段级来源、面向本科生的公开事实或明确标识的 AI 整理，
以及对 Evidence ID 的引用。它不保存完整论文书目、作者身份审查过程、学生经历、
访谈或内部材料。

机构、学院、职位、公开角色、主页、邮箱、电话和地址使用统一的字段级来源对象：
`value`、`source_url`、`source_ref`、`source_authority`、`last_verified_at`、
`missing_status`。公开联系方式只接受官方机构、导师或实验室来源。

### `evidence-manifest-v1.json`

保存 Evidence 的唯一书目事实：原题、年份、DOI、来源类型、来源 URL、支持字段，
以及拆分后的作者角色：

- `author_position`
- `is_co_first`
- `is_corresponding`

Manifest 还保存正式论文/预印本版本关系和是否进入报告。JSON、Manifest 与生成的
Markdown 必须使用完全一致的 Evidence ID 集合。

### `identity-review-v1.json`

保存论文级身份核验结论、P0 阻断项、核验角色和日期。它不保存导师展示正文。
缺少独立身份记录、存在身份冲突或任一论文身份未闭环时，发布状态强制为
`review_pending`。

## 缺失状态

- `no_public_information`：一般公开字段已检查但没有可发布信息，显示“暂无公开信息”。
- `needs_verification`：必须由当期官方页面或当事方确认，显示“待核验”。
- `no_reliable_public_evidence`：分析证据不足，Confidence 必须为 `No Evidence`，
  Evidence ID 为空，并记录原因，显示“暂无可靠公开证据”。

三种状态不得互换，也不得用生成日期冒充核验日期。

## 发布门禁

- `approved` / `published` 要求 Identity Review 为 `verified`、P0 阻断项为空，且
  Manifest 中所有论文身份均已确认。
- P0 未解决时 Validator 输出的有效状态强制为 `review_pending`。
- DOI 重复或未显式关联的正式论文/预印本版本阻断发布。
- Experience、访谈、录音、学生案例、可再识别信息、密钥和本地绝对路径不得进入
  公开包。
- Markdown 只由公开 JSON 与 Manifest 确定性生成；Identity Review 只控制门禁，
  不向公开报告写入审查细节。
