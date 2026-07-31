# Risks and Blockers

风险核验日期：2026-07-31。报告只描述位置、状态和门禁，不包含任何具体学生经历正文。

## P0

### R-P0-001 — Experience 内容进入公开链路与静态直链

- **风险**：刘静、李发祥报告含具体学生 Experience 信息；隐藏章节后，原始 Markdown 仍存在于公开目录、构建 artifact 和静态路径。
- **可复核来源**：`web/reports/Liu_advisor_profile_v1_5_demo_display.md`、`web/reports/Li_advisor_profile_v1_5_demo_display.md`、对应 `frontend/public/reports/` 文件、`frontend/scripts/data-pipeline.mjs`、`frontend/src/components/MarkdownReport.tsx`、Git 历史提交 `421e0f5`、`d00834f`、`5d2ccf4`。
- **是否已确认**：是；P0 只读公开内容隔离审计已确认公开仓库、构建和 Pages artifact 均可读取。
- **最小处理方式**：在单独获批任务中先停止这些文件进入公开源与 artifact，加入构建级内容白名单/批准状态门禁，再复核静态直链；历史处置需另行决策。
- **未解决时禁止**：任何重新部署、公开发布或声称 Experience 已隔离。

### R-P0-002 — `review_pending` 来源报告被公开复制

- **风险**：郭辉、胡德华、胡正茂、李家大的索引源指向 `data/reports/review_pending/`，但副本已在 `web/reports/`、`frontend/public/reports/` 和 Pages artifact 中；`beta` 不是隐私隔离状态。
- **可复核来源**：`web/advisors.json`、上述两个公开报告目录、`frontend/scripts/data-pipeline.mjs`、`.github/workflows/deploy-frontend-pages.yml`、`.github/workflows/deploy-pages.yml`。
- **是否已确认**：是。
- **最小处理方式**：建立只接受明确批准状态的公开导出白名单，拒绝 `review_pending`/`beta` 和缺失状态；重新构建后检查 artifact 与直接 URL。
- **未解决时禁止**：部署 0.5 或 1.0、把 7/7 文件齐全当作可发布证明。

### R-P0-003 — 敏感文件已进入公开 Git 历史

- **风险**：删除当前工作区副本不能使文件从 Git 历史或既有远程对象中消失。
- **可复核来源**：提交 `421e0f5`、`a782256`、`d00834f`、`5d2ccf4` 及其相关报告路径。
- **是否已确认**：是。
- **最小处理方式**：先确认授权与暴露范围，形成历史处置和远程协同方案；未获授权不得执行重写历史、删除分支或 force push。
- **未解决时禁止**：宣称已彻底删除或完成隐私修复。

### R-P0-004 — 个别导师报告存在发布阻断项

- **风险**：模板分支审计记录了身份/ORCID 冲突、正式论文与预印本重复计数、统计口径错误等发布阻断项。
- **可复核来源**：本地分支 `feature/advisor-template-v1` 提交 `557cd19f` 中的 `docs/advisor-template-v1/existing-advisors-gap-audit-v1.md`。
- **是否已确认**：审计结论已提交；支撑它的部分 Evidence/身份文件未进入当前分支，执行修复前必须重新核验。
- **最小处理方式**：逐导师恢复或重建身份与 Evidence Manifest，先关闭 P0，再考虑模板迁移。
- **未解决时禁止**：把相关导师标为 approved/published，或扩展批量生产。

## P1

### R-P1-001 — 发布脚本没有批准状态过滤

- **风险**：`data-pipeline.mjs` 遍历索引报告并复制到 public；缺失 `status` 时默认 `published`，没有 `publication_status` 批准白名单。
- **可复核来源**：`frontend/scripts/data-pipeline.mjs`、`web/advisors.json`。
- **是否已确认**：是。
- **最小处理方式**：在后续获批修复中采用 fail-closed 的批准状态与路径白名单，并对拒绝项写测试。
- **未解决时禁止**：把前端 AST 隐藏或索引缺失当作发布隔离。

### R-P1-002 — 当前生产链路仍依赖 Markdown 解析

- **风险**：字段抽取依赖标题和列表，无法作为稳定 Schema 或隐私边界。
- **可复核来源**：`frontend/scripts/data-pipeline.mjs`；本地模板分支 `557cd19f:docs/advisor-template-v1/frontend-field-mapping-v1.md`。
- **是否已确认**：是。
- **最小处理方式**：P0 完成后，单样本验证规范化 JSON → Schema → 确定性 Markdown → 前端，再决定批量迁移。
- **未解决时禁止**：从自由 Markdown 反向重建权威 JSON，或直接扩展约 40 位导师。

## P2

### R-P2-001 — 根 README 与真实工作流存在漂移

- **风险**：根 README 的旧版发布描述与当前手动工作流不完全一致，可能误导新线程。
- **可复核来源**：`README.md`、`.github/workflows/deploy-frontend-pages.yml`、`.github/workflows/deploy-pages.yml`。
- **是否已确认**：是。
- **最小处理方式**：在 P0 修复后另开文档维护任务更新 README；本次上下文迁移不改它。
- **未解决时禁止**：仅依据 README 判断当前部署触发方式。

### R-P2-002 — 本地 Evidence 不在 Git 基线

- **风险**：`data/` 当前只跟踪 `.gitkeep`，部分审计证据只在本地忽略目录，新的 worktree 无法复核全部语义结论。
- **可复核来源**：`git ls-tree -r HEAD data/`；模板分支 `docs/advisor-template-v1/README.md`。
- **是否已确认**：是。
- **最小处理方式**：后续任务先明确私有 Evidence 的保存、访问与匿名化边界，再进行逐导师复核。
- **未解决时禁止**：把结构校验或历史审计摘要当成完整 Evidence 验证。
