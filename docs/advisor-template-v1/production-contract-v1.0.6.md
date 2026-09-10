# Academic Intelligence Advisor Production Contract v1.0.6

v1.0.6 完整继承 v1.0.5 的 Evidence、来源闭合、论文发表时机构、ORCID 原子真值表、隐私和发布门禁。v1.0.4 与 v1.0.5 历史合同、Schema 和映射保持不变。

## Zero-publication 语义

`publication_identity_status` 只描述实际采用的 publication Evidence，不允许用空集合真值推导“已核验”。

| publication candidates | adopted publications | verified adopted publications | 唯一合法状态 |
| ---: | ---: | ---: | --- |
| 0 | 0 | 0 | `pending_verification` |
| >0 | 0 | 0 | `pending_verification` |
| >0 | >0 | 0 | `pending_verification` |
| >0 | N | 0 < verified < N | `partially_verified` |
| >0 | N | verified = N, N >= 1 | `verified` |

其中“verified adopted publication”要求 Manifest 记录 `identity_verified=true`，且对应 `identity-review-v1.json` publication identity 为 `verified`。`verified` 至少需要一条实际采用的 publication Evidence。

零论文候选或零采用论文却声明 `verified` 时，Validator 必须返回 `ZERO_PUBLICATION_IDENTITY_STATUS_CONTRADICTION`。其他状态与真值表不一致时返回 `PUBLIC_IDENTITY_STATUS_INVALID`。

## Renderer

- publication candidate 数为 0：显示“当前未纳入论文候选证据，代表论文及作者身份尚待检索与核验。”
- publication candidate 数为 N 且 featured 为空：显示“已保存 N 条论文候选证据，代表性论文尚待人工筛选。”
- 不得显示无法由 Manifest 计数证明的“完整候选证据”。
- 状态标签必须与 Validator 接受的 `publication_identity_status` 一致。

## 发布与人工审核

本版本不放宽任何发布门禁。`human_review=pending`、P0 blocker、ORCID 未解决或论文身份未闭合仍强制 `review_pending` 与 `release_eligible=false`。机械合法不等于内容完整，也不等于人工批准。
