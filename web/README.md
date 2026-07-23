# Academic Intelligence 导师信息网站 0.5 Beta

这是一个直接展示现有导师 Markdown 画像的静态网站，用于小范围 Beta 测试。原始报告通常位于 `../data/reports/`；经审核的 Academic-only Beta 报告保留在 `../data/reports/review_pending/`。启动脚本按 `advisors.json` 中的 `source_report`（若有）原样复制选定报告，不会修改证据母稿。

## 本地启动（Windows）

在 `academic-intelligence` 目录运行（无需安装依赖）：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_web.ps1
```

然后打开：<http://localhost:8000/>

如果端口被占用：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_web.ps1 -Port 8080
```

## 当前内容

- 首页导师列表与姓名/方向搜索
- 7 位导师画像：原有项荣、刘静、李发祥，以及 0.5 Beta 新增的郭辉、胡德华、胡正茂、李家大
- 导师详情页完整 Markdown 渲染
- 标题、列表、表格、引用、链接和 Evidence 编号展示
- 证据等级、经历证据状态、Academic-only、作者身份匹配置信度与用途边界提示
- 详情页直接刷新与返回列表

## 更新报告

编辑原始报告后，重新启动网站即可自动同步。只同步报告、不启动服务器：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_web.ps1 -SyncOnly
```

新增导师时，在 `advisors.json` 增加一项，并保证：

- `report` 是 `web/reports/` 中的公开文件名；
- 常规报告可省略 `source_report`，此时从 `data/reports/` 读取；
- 其他审核来源必须用项目内相对路径写入 `source_report`，例如 `data/reports/review_pending/example.md`；
- 不得写入 Windows 绝对路径或以 `/` 开头的站点根路径。

## 错误反馈配置

反馈入口集中配置在 `site-config.json` 的 `feedback_url`。仓库当前没有可确认的真实问卷或反馈网址，因此该字段保持为空，详情页会显示“反馈链接待配置”。获得真实链接后只需替换该字段，不需要修改页面代码。

## 静态部署

生产环境只采用 GitHub Pages。工作流位于 `../.github/workflows/deploy-pages.yml`，直接上传 `web/`，不需要 Node、Python、数据库或构建步骤。

### 首次发布

1. 将仓库推送到 GitHub，默认分支命名为 `main`。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. 推送到 `main` 会自动运行工作流；也可以在 **Actions → Deploy advisor website to GitHub Pages → Run workflow** 手动触发。
4. 部署状态和最终网址可在该工作流运行记录的 `github-pages` 环境中查看。

GitHub Pages 项目站通常位于 `https://<用户名>.github.io/<仓库名>/`。本站的 HTML、CSS、JavaScript、JSON和Markdown全部使用相对路径，不依赖域名根路径；`advisor.html?id=...` 是真实静态页面，因此详情页直接刷新和查询参数均可保留。

### 更新网站

修改页面、样式或 `advisors.json` 后，提交并推送到 `main` 即会自动发布。新增导师时：

1. 把经确认可公开的Markdown成稿放入 `data/reports/`；
2. 在 `web/advisors.json` 增加导师卡片配置；
3. 运行同步命令，把配置引用的报告原样复制到 `web/reports/`；
4. 检查报告不包含受访者姓名、联系方式、原始录音链接或密钥；
5. 提交并推送。

更新已有Markdown时，修改 `data/reports/` 中的证据母稿，然后运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_web.ps1 -SyncOnly
```

发布工作流会检查7份报告和必要静态资源是否存在，并扫描发布目录中的常见本地绝对路径及密钥格式。`data/`、`.env`、访谈原始文本和项目其他文件不会进入Pages artifact。

### 常见路径问题

- 不要把资源路径改成 `/styles.css`、`/advisors.json` 或 `/reports/...`；开头的 `/` 会绕过GitHub Pages仓库子路径。
- 保持 `styles.css`、`advisors.json`、`reports/...` 等相对路径。
- 新报告文件名建议使用ASCII字符；现有中文内容使用UTF-8保存即可。
- 如果卡片存在但详情报告打不开，先检查 `web/advisors.json` 的 `report` 是否与 `web/reports/` 文件名完全一致。

### 回滚

在GitHub找到上一个正常版本的提交，执行 `git revert <需要撤销的提交>`，然后推送到 `main`。新工作流会自动把回滚后的版本重新发布。不要用强制推送覆盖公开分支历史。

## 0.5 Beta 有意未包含

没有账号、后台、数据库、AI 问答、推荐、收藏、排名、导师比较、论坛或实时投稿。卡片摘要由小型配置文件维护，避免为少量异构报告引入脆弱的自动抽取逻辑。
