# 导师公开数据模板 v1.0.4

本模板描述 `public-advisor-v1.json` 经确定性 Renderer 输出的公开 Markdown。Markdown 不是权威数据源，不得反向解析生成 JSON。

## 文件职责

- `public-advisor-v1.json`：公开字段、公开结论、采用证据ID、精选论文决定与发布状态。
- `evidence-manifest-v1.json`：分型 Evidence。`publication` 保存论文专属字段；`official_profile` 保存官方页面与逐条事实。
- `identity-review-v1.json`：导师主体、论文身份和官方来源身份三条独立审查轨道。
- `validation-report-v1.json`：三份 Schema、跨文件 Validator、发布门禁与计数结果。
- `public-advisor-v1.md`：只由 JSON 和 Manifest 确定性生成的公开审阅文本。

## 公开章节

研究方向逐条标识“公开事实”或“AI整理”。代表性论文表只显示 `publication` Evidence。证据状态章节分别显示官方主页证据、论文候选证据、已采用官方证据、已采用论文证据和精选论文数量。

公开事实只能由合同允许的一手官方 Evidence 支持。AI整理可以基于采用的论文或官方主页，但必须保留条件式表达和本科生任务不确定性。Renderer不声明 Schema 或 Validator 已通过；结论以 `validation-report-v1.json` 为准。

## 禁止公开

不得输出内部仓库路径、Researcher内部作者ID、API原始返回、本地缓存路径、机器状态码、身份审计内部备注或Experience材料。
