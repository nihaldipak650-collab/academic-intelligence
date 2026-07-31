# Current State

核验日期：2026-07-31。除特别标注外，以下状态来自 Git 和当前提交中的文件。

## 分支与上线版本

- 当前线上来源分支：`fix/frontend-1.0-visual-functional-regression`
- 当前线上来源提交：`5d2ccf409fd72d3e8f5740a66f46ad1605c7f74c`
- `main` 当前指向：`dbab129`（不是本次核验到的前端 1.0 上线来源）
- 上线版本：前端 1.0，构建来源为 `5d2ccf4`；仓库远程可公开读取的状态已在 P0 审计中确认。
- 本次上下文分支：`chore/project-context-v2`，基于 `5d2ccf4`；本文件所在提交即上下文 2.0 提交。

## 当前 7 位导师

来源：`web/advisors.json`。`publication_status` 不是当前索引字段；现行脚本读取 `status`，缺失时默认 `published`。

| ID | 姓名 | 索引状态 | 现行运行时状态 | 报告来源状态 |
|---|---|---|---|---|
| `xiang-rong` | 项荣 | 缺失 | `published` | 公开目录 |
| `liu-jing` | 刘静 | 缺失 | `published` | 公开目录，包含 Experience 风险 |
| `li-faxiang` | 李发祥 | 缺失 | `published` | 公开目录，包含 Experience 风险 |
| `guo-hui` | 郭辉 | `beta` | `beta` | 索引源指向 `review_pending`，但已有公开副本 |
| `hu-dehua` | 胡德华 | `beta` | `beta` | 索引源指向 `review_pending`，但已有公开副本 |
| `hu-zhengmao` | 胡正茂 | `beta` | `beta` | 索引源指向 `review_pending`，但已有公开副本 |
| `li-jiada` | 李家大 | `beta` | `beta` | 索引源指向 `review_pending`，但已有公开副本 |

## 数据与发布链路

```text
web/advisors.json + web/site-config.json + web/reports/*.md
  -> frontend/scripts/data-pipeline.mjs
  -> frontend/public/data/*.json + frontend/public/reports/*.md
  -> Vite build -> frontend/dist/
```

当前脚本按索引复制报告，不按 `publication_status` 做批准过滤；详情页的 `hideExperienceSections` 只在渲染阶段隐藏章节，不能阻止 Markdown 静态直链访问。

## 导师模板分支

- 本地分支：`feature/advisor-template-v1`
- 本地提交：`557cd19ff92307ca904f53de405448bb9f4dcfab`（`Freeze advisor production template v1`）
- 内容：`docs/advisor-template-v1/` 下的 v1 Schema、模板、Evidence/缺失规则、质量清单、差距审计、前端映射和批次合同。
- 状态：本地独立 worktree 中已提交；未发现远程分支包含该提交，是否采用/合并仍为 `unverified`。
- 当前指令：暂停所有模板和导师数据生产，该分支仅作只读参考。

## 已完成验证

- `frontend/IMPLEMENTATION_REPORT.md` 记录 2026-07-24 的前端检查：3 个测试文件、23 个测试通过，7 位导师同步/校验通过，Vite 构建通过。
- `.github/workflows/deploy-frontend-pages.yml` 对 1.0 artifact 检查恰好 7 位导师和 7 份报告，并只在手动 dispatch 且 `deploy=true` 时部署。
- `.github/workflows/deploy-pages.yml` 是 0.5 手动回滚工作流，上传整个 `web/`。
- 上述是已提交记录和工作流事实；本次上下文迁移未重新运行前端测试或构建，以避免改写 `frontend/public/`。

## 尚未完成的迁移

- 7 位导师尚未迁移到规范化 v1 导师 JSON、Schema 校验、确定性 Markdown 渲染链路。
- 前端仍从 Markdown 解析部分字段；`publication_status` 批准过滤尚未进入当前线上分支。
- Experience 模块尚未从公开构建链路完成物理隔离。
- 现有报告的身份、去重、方法与措辞 P0/P1 问题尚未统一闭环。

## 当前公开风险

- **P0 已确认**：刘静、李发祥的具体 Experience 内容存在于 Git 跟踪的公开报告、副本、构建产物和已部署 Pages artifact，可通过静态报告路径读取。
- **P0 已确认**：4 份 `review_pending` 来源报告已复制到 `web/reports/`、`frontend/public/reports/`、最终构建和 Pages artifact。
- **P0 已确认**：相关文件已进入公开 Git 历史。任何历史处置都需要单独授权；不得自行重写历史或 force push。

详细门禁见 `RISKS_AND_BLOCKERS.md`。
