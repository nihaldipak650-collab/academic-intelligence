# Task Board

## Now

- 冻结 Codex 上下文 2.0：仅提交 `AGENTS.md` 与 `docs/context/`，不修改代码、前端、导师数据、Evidence、工作流或部署配置。

## Next

- **唯一下一任务**：在全新 Codex 线程中重新核验当前 Git/远程/Pages 状态，制定并在用户明确授权后执行 P0 公开内容隔离。范围至少包括 Experience 物理隔离、`review_pending`/`beta` fail-closed 过滤、静态直链与 artifact 复核；Git 历史处置必须单独决策。

## Later

- P0 关闭后，选择一个已批准 Academic-only 样本验证 v1 JSON → Schema → 确定性 Markdown → 前端双轨链路。
- 修复逐导师身份、去重、统计与语义 Evidence 问题，再决定是否迁移其余 7 位。
- 核验单样本与发布门禁后，再由用户决定是否启动约 40 位导师的分批生产。
- 更新根 README，使其与真实手动部署/回滚工作流一致。

## Deferred

- 账号、数据库、在线编辑、AI 问答、导师排名与自动推荐。
- 新增导师、模板继续生产、问卷/访谈扩展和内部 UI。
- 任何未经单独授权的 Git 历史重写、远程清理或重新部署。

## Done

- 前端 1.0 的 7 位导师静态页面、搜索、测试和手动 Pages 工作流已在 `5d2ccf4` 基线中存在。
- 导师母模板 v1 已在本地分支 `feature/advisor-template-v1`、提交 `557cd19f` 冻结为参考，尚未确认合并或远程发布。
- P0 只读公开内容隔离审计已完成并确认公开链路与 Git 历史风险。
