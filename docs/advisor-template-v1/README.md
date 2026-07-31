# Academic Intelligence 导师生产合同

当前分支正式采用 **v1.0.1**。它基于只读参考提交
`557cd19ff92307ca904f53de405448bb9f4dcfab` 中冻结的 v1 合同修订；没有
cherry-pick 或覆盖该提交中的原 v1 文件。

## 采用文件

- `public-advisor-schema-v1.0.1.json`：公开导师 JSON 的结构合同。
- `public-advisor-template-v1.0.1.md`：确定性 Markdown 的章节和字段合同。
- `production-contract-v1.0.1.md`：公开 JSON、Evidence Manifest、Identity Review
  的职责边界和发布门禁。

## 固定链路

```text
仓库现有公开证据
→ public-advisor-v1.json + evidence-manifest-v1.json + identity-review-v1.json
→ Schema 与跨文件 Validator
→ 确定性 Markdown Renderer
→ validation-report-v1.json
→ 人工语义、身份、隐私和发布审核
```

禁止从 Markdown 反向解析或补造 JSON。机械校验通过也不等于获准发布。

