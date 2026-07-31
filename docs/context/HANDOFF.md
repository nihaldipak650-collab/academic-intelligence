# Handoff to a New Codex Thread

## 最近完成

- 以 Git 和仓库文件为准，压缩了 Academic Intelligence 的有效项目上下文。
- 新增根级 `AGENTS.md` 和 `docs/context/` 六份路由文档。
- 未修改 `frontend/`、`web/`、`data/`、导师报告、Evidence、工作流或部署配置。

## 分支、提交与工作区

- 线上来源分支/提交：`fix/frontend-1.0-visual-functional-regression` @ `5d2ccf409fd72d3e8f5740a66f46ad1605c7f74c`
- 上下文分支：`chore/project-context-v2`
- 上下文基线：`5d2ccf409fd72d3e8f5740a66f46ad1605c7f74c`
- 上下文提交：包含本文件且提交信息为 `Add project context handoff v2` 的提交；进入 worktree 后运行 `git rev-parse HEAD` 获取完整哈希。
- 模板参考分支/提交：本地 `feature/advisor-template-v1` @ `557cd19ff92307ca904f53de405448bb9f4dcfab`；未确认远程存在或已采用。
- 交接完成标准要求工作区干净；新线程仍必须自行运行状态命令，不依赖本段作为实时事实。

## 下一项唯一任务

重新执行一次只读的 Git、公开仓库、Pages artifact 和静态 URL 核验；在用户明确授权后，完成 P0 公开内容隔离。不得在只读核验阶段直接修复、部署或处置历史。

## 读取顺序

1. `AGENTS.md`
2. `docs/context/HANDOFF.md`
3. `docs/context/CURRENT_STATE.md`
4. `docs/context/RISKS_AND_BLOCKERS.md`
5. `docs/context/DECISIONS.md`
6. `docs/context/PROJECT_BRIEF.md`
7. `docs/context/TASK_BOARD.md`

如任务获批进入代码修复，再读：`web/advisors.json`、`frontend/scripts/data-pipeline.mjs`、`frontend/src/components/MarkdownReport.tsx`、两份 Pages workflow；不要在汇报中复制敏感报告正文。

## 首先运行

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
git log --oneline --decorate -10
git remote -v
```

只读审计时再检查跟踪路径与历史，例如 `git ls-files web/reports frontend/public/reports`、`git log --all -- <path>`。需要核验远程或 Pages 时，以当前远程状态为准，不从本交接文件推断。

## 禁止事项

- 不根据旧聊天或模型记忆补造仓库事实；无法复核即标记 `unverified`。
- 不复制具体学生经历、原话或可再识别信息。
- 未获明确授权，不修改报告/数据/前端，不 push、合并、部署、force push、重写历史或删除分支。
- 不把 AST 隐藏、索引缺失、`beta` 标签、测试通过或 7/7 artifact 完整视为隐私隔离。
- P0 未关闭前，不启动新导师、模板继续生产或批量接站。

## 完成标准

- Experience 与未批准报告不会进入公开源、public、dist、Pages artifact 或静态直链。
- 发布导出采用 fail-closed 的明确批准状态，并有拒绝路径测试。
- 对公开 Git 历史风险给出经用户批准的处置决定；未经授权不实施历史改写。
- 运行与报告验证命令、路径、分支、提交、工作区状态及未确认事项。
- 没有无关文件变更，也没有未经授权的 push、合并或部署。
