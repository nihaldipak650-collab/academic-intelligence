# Academic Intelligence 仓库协作规则

本文件给所有在本仓库工作的 Codex 线程使用。仓库文件与 Git 状态是事实来源；聊天内容、模型记忆和未提交材料只能作为线索，不能替代核验。动态项目状态从 `docs/context/` 读取。

## 阅读路由

- 开始任何任务：先读 `docs/context/HANDOFF.md` 和 `docs/context/CURRENT_STATE.md`。
- 涉及范围或角色：再读 `docs/context/PROJECT_BRIEF.md`。
- 涉及既有决定：读 `docs/context/DECISIONS.md`。
- 涉及发布、隐私、Evidence 或导师数据：必须读 `docs/context/RISKS_AND_BLOCKERS.md`。
- 涉及排期：读 `docs/context/TASK_BOARD.md`。

## 仓库结构

- `src/`、`main.py`、`prompts/`：Python 检索、清洗、分析与报告流水线。
- `data/`：本地原始、清洗、知识与报告目录；当前 Git 仅跟踪占位文件，不得假设本地 Evidence 已提交。
- `web/`：0.5 静态站点、导师索引和 Markdown 报告。
- `frontend/`：1.0 React/Vite 前端；同步脚本从 `web/` 生成 `frontend/public/` 数据。
- `.github/workflows/`：Pages 验证、构建、部署与旧版回滚工作流。
- `docs/context/`：项目简报、当前状态、决定、风险、任务板和交接。

## 常用检查与构建

在仓库根目录先运行 `git status --short`。前端命令在 `frontend/` 下运行：

```powershell
npm.cmd ci
npm.cmd run sync:data
npm.cmd run validate:data
npm.cmd run test
npm.cmd run build
npm.cmd run check
```

`test`、`build` 和 `check` 会先同步数据并改写 `frontend/public/data/` 与 `frontend/public/reports/`；执行前后都要检查 Git diff。Python入口为 `python main.py --name "NAME" --institution "INSTITUTION"`，但当前提交未跟踪 `requirements.txt`，依赖安装方式须先核验，不能照抄旧 README 假定可用。

## Git 安全

- 开始前记录分支、HEAD、状态和最近提交；使用隔离 worktree 与 `codex/` 前缀分支，除非用户指定其他分支名。
- 保留用户已有修改；不得 reset、覆盖、清理或删除用途不明的文件。
- 未经明确授权，不得 push、合并、部署、force push、重写历史、删除分支或配置/更换 remote。
- 提交前运行 `git diff --check`、检查 `git status --short`，确认暂存区只含任务允许路径。

## 数据、隐私与发布门禁

- Academic Evidence 与 Experience Evidence 必须分离；不得把学生经历、访谈、录音、内部档案或可再识别信息放进公开目录或构建产物。
- 不得从公开资料推断导师性格、带教态度、实验室氛围、真实任务、资源、反馈速度或招募承诺。无可靠证据时明确写 No Evidence。
- 页面隐藏不是隐私隔离。发布前必须检查 Git 跟踪文件、`web/`、`frontend/public/`、`frontend/dist/`、Pages artifact、静态直链和 Git 历史。
- 当前存在未解决 P0 公开内容风险；在 `docs/context/RISKS_AND_BLOCKERS.md` 的门禁解除前，禁止发布或部署。
- 所有上线必须通过人工语义、身份、Evidence、隐私审查，并获得用户明确授权。

## 完成报告

每项任务结束时只报告：变更文件、验证命令与结果、分支和提交、工作区状态、未确认事项、风险/阻塞、是否 push/合并/部署。不得复制敏感正文或长日志。
