# Academic Intelligence 导师网站前端

React + TypeScript + Vite 的只读前端，挂在生命科学学生平台下的「导师与研究方向信息库」。

## 数据架构

正式公开链路：

```text
data/advisors-v1/*/
        ↓ npm run export:dto / sync:data
frontend/public/data/advisors.json
+ frontend/public/reports/*.md
        ↓ React 适配器（仅 approved/published）
列表页 + 详情页
```

- 权威生产包：`data/advisors-v1`（v1.0.4）。
- `web/advisors.json` 与 `web/reports/` 已退役，不再作为同步源。
- 本地审核预览：`npm run generate:review` → `.local-review/`（13 位，含 2 位 pending）；`vite build --mode review` 必须失败。
- `frontend/scripts/data-pipeline.mjs` 仅保留单元测试中的门禁辅助逻辑；正式同步请用 `public-advisor-dto.mjs`。

## 命令

在 `frontend/` 中运行：

```powershell
npm.cmd install
npm.cmd run sync:data
npm.cmd run validate:data
npm.cmd run scan:prebuild
npm.cmd run dev:dto
npm.cmd run generate:review
npm.cmd run dev:review
npm.cmd run test
npm.cmd run build
```

路由：

- `/`：生命科学平台首页
- `/advisors`：导师一览
- `/advisor/:id`：导师详情（页内锚点导航）

## 禁止编造或改写的字段

不得在前端补写论文题名、年份、DOI、Evidence ID、作者身份结论、导师指导方式、实验室氛围、反馈频率、本科生任务安排或学生经历。交接资料没有给出的值必须保持缺失并显式提示。
