# 导师画像：`name_zh`（`name_en`）

本文件定义 Renderer 的固定章节，而不是可自由填写的 Markdown 表单。所有正文来自
`public-advisor-v1.json`，论文表和 Evidence 表来自 `evidence-manifest-v1.json`。

1. 一分钟认识导师
2. 基础身份与官方信息
3. 研究方向
4. 研究方向通俗解释
5. 主要研究问题
6. 常用技术与研究流程
7. 代表性论文与 DOI
8. 本科生可能参与的任务
9. 前置技能与学习成本
10. 通用成长路径
11. 联系前准备与线下核验
12. Evidence Manifest
13. 更新时间
14. Boundary Statement

## v1.0.1 对齐规则

- 基础身份表逐字段输出值、来源 URL 和最后核验日期。
- 论文表从 Manifest 输出 `author_position`、`is_co_first`、
  `is_corresponding`，不再使用合并枚举 `advisor_author_role`。
- 每条分析内容必须显示 `public_fact` 或 `ai_synthesis` 内容车道。
- 本科生任务必须显示 Confidence、Evidence 和不确定性声明。
- 成长路径固定显示：“以下路径是依据公开技术栈整理的通用学习场景，不代表导师
  官方培养方案、真实时间表或成果承诺。”
- 一般字段、动态字段和分析字段分别使用“暂无公开信息”“待核验”“暂无可靠公开
  证据”。
- Renderer 输出 UTF-8、LF 换行和一个末尾换行；相同 JSON 与 Manifest 必须逐字节
  相同。

