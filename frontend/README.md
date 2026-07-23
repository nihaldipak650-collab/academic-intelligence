# Academic Intelligence 导师网站 1.0 前端

React + TypeScript + Vite 的独立、只读前端。它与仓库中的 `web/` 0.5 Beta 并行；本目录不会替换旧站，也不包含发布操作。

## 数据架构

生产页面只使用以下链路：

```text
web/advisors.json
+ web/site-config.json
+ web/reports/*.md
        ↓ npm run sync:data
frontend/public/data/*.json
+ frontend/public/reports/*.md
        ↓ React 数据适配器
列表页 + 统一详情页
```

- `web/advisors.json` 是公开导师元数据来源。
- `web/reports/*.md` 是已经进入 0.5 Beta 的审核后公开报告副本。
- `frontend/scripts/data-pipeline.mjs` 负责归一化字段、复制报告和生成 SHA-256。
- `frontend/public/` 是确定性的构建输入，不是新的研究数据源。
- React 页面不硬编码导师正文；新增导师无需增加页面组件。

缺失字段不会被编造。旧版 3 位导师没有独立的 `author_match_confidence` 和 `last_updated`：

- 前端保留 `academic_confidence` 的等级，并用 `legacy_academic_confidence` 标记来源；
- 最后更新时间显示“来源未标注”；
- 同步命令会输出警告，便于后续数据维护者补齐。

## 命令

在 `frontend/` 中运行：

```powershell
npm.cmd install
npm.cmd run sync:data
npm.cmd run validate:data
npm.cmd run dev
npm.cmd run test
npm.cmd run build
```

`npm run build` 会先自动同步和验证数据，再执行 TypeScript 检查及 Vite 生产构建。`npm run test` 也会先同步并验证。

路由：

- `/#/`：导师列表、全文搜索、动态研究标签筛选。
- `/#/advisor/:id`：统一导师详情页及完整 Markdown 报告。

项目使用 Hash Router，`vite.config.ts` 使用 `base: "./"`，因此可在 GitHub Pages 的 `/academic-intelligence/` 仓库子路径下加载资源，刷新详情页也不需要服务端路由回退。

## 增加或更新一位导师

1. 按现有审核流程更新 `web/advisors.json`，不要直接编辑 `frontend/public/data/advisors.json`。
2. 将经过审核、允许公开的 Markdown 放入 `web/reports/`，并在元数据的 `report` 字段中使用文件名。
3. 确保 `id` 唯一、文件名唯一，报告首行导师姓名与配置一致。
4. 对 Academic-only 导师设置：
   - `evidence_type: "academic_only"`
   - `has_experience_evidence: false`
   - `experience_case_count: 0`
5. 对有经历证据的导师设置：
   - `evidence_type: "academic_and_experience"`
   - `has_experience_evidence: true`
   - `experience_case_count` 为真实授权案例数
   - 报告内保留 Case ID、代表性 Unknown、事实层与体验层边界
6. 运行 `npm.cmd run sync:data`。脚本会复制报告、生成元数据并清理失效的生成副本。
7. 运行 `npm.cmd run validate:data`。重复 ID、重复/错误报告路径、姓名串页、Experience 逻辑冲突、缺失报告、占位内容或副本不一致都会返回非零退出码。
8. 运行 `npm.cmd run test` 和 `npm.cmd run build`。
9. 运行 `npm.cmd run dev`，人工抽查列表、详情、移动端表格、DOI、Evidence 标签、No Evidence 和 Boundary Statement。

## 禁止编造或改写的字段

不得在前端补写论文题名、年份、DOI、Evidence ID、作者身份结论、导师指导方式、实验室氛围、反馈频率、本科生任务安排或学生经历。交接资料没有给出的值必须保持缺失并显式提示。

同步脚本拒绝以下演示占位内容进入生产数据：

- `placeholder`
- `example.com`
- `10.0000/`
- `lorem ipsum`
- `mock advisor`
- `待人工核验后补充`
- `demo DOI`

## 发布前人工检查

- 数量等于 `web/advisors.json` 的导师数；
- 搜索中文名、英文名、摘要和标签均可用；
- 搜索与方向筛选组合正确；
- 每个卡片 ID、姓名、摘要、标签和报告没有串页；
- Academic-only 与 Experience 案例数量一致；
- 报告内的 Growth Path 声明、Confidence、Evidence 编号、No Evidence、DOI 和 Boundary Statement 完整可见；
- 表格只在自身容器横向滚动，375px 下无页面级横向溢出；
- 键盘焦点、Tooltip、目录锚点和返回列表可用；
- `dist/data/` 与 `dist/reports/` 存在；
- `dist/` 不包含 Windows 绝对路径或演示占位内容。

本前端不提供导师评分、排名、推荐、比较、社区、账号、数据库或 AI 问答。
