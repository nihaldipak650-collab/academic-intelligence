# Frontend 1.0 内部预览实施与验收报告

日期：2026-07-24  
分支：`feature/frontend-1.0-real-data`

## 完成范围

- 从 `web/advisors.json`、`web/site-config.json` 和 `web/reports/` 确定性同步 7 位真实导师及 7 份公开报告。
- 完成配置驱动的导师列表、搜索、真实标签筛选、统一详情页和 Markdown 长文渲染。
- 明确区分 Academic-only 与 Academic + Experience，并保留案例代表性 Unknown、No Evidence、Evidence ID、Confidence、DOI 和 Boundary Statement。
- 完成数据同步、数据验证、23 项自动化测试和 Vite 生产构建。
- 未修改 `web/`、原始报告、Evidence、论文题名/年份/DOI 或研究数据流水线。

## 浏览器视觉检查

检查宽度：1440px、1024px、768px、375px。

检查页面：

1. 导师列表页；
2. 郭辉 Academic-only 详情页；
3. 刘静 Experience Evidence 详情页；
4. 无搜索结果 Empty State；
5. 无效导师 ID 错误页。

结果：

- 1440px：列表三列；详情为目录、正文、阅读提示三栏；无页面级横向溢出。
- 1024px：列表两列；详情保留左侧目录并隐藏右侧提示栏；无页面级横向溢出。
- 768px：列表两列；详情切换单栏并显示折叠目录；无内容遮挡或横向溢出。
- 375px：列表单列，筛选标签在自身区域横向滚动；详情单栏，折叠目录、按钮、长标题和 DOI 可正常操作；无页面级横向溢出。
- Markdown 表格仅在 `.table-scroll` 容器内横向滚动，没有扩大页面宽度。
- Evidence Tooltip 在手机宽度下固定于视口内，鼠标/键盘焦点均可显示。
- 目录点击保留 `#/advisor/:id` 路由并正确滚动、聚焦目标标题。
- 从长报告底部切换导师后，新详情页立即回到页首。
- Boundary Statement 完整可见。
- Academic-only 页面显示标准无经历证据状态。
- Experience 页面显示 1 个授权案例、代表性 Unknown、Case ID 和事实/体验边界。
- Empty State 明确说明无匹配不是系统错误。
- 无效 ID 页面提供可用的返回导师列表入口。

## 本阶段最小修复

- `src/App.tsx`：路由切换时回到页首。
- `src/pages/AdvisorDetailPage.tsx`：目录使用受控滚动，避免与 Hash Router 冲突；异步报告加载完成后稳定回顶。
- `src/styles.css`：移动端 Tooltip 限制在视口内；关闭详情页滚动锚定；保留表格局部滚动。
- `src/test/setup.ts`：为测试环境补充 `window.scrollTo` 桩，避免 jsdom 非浏览器能力警告。

## 最终回归

```text
npm.cmd run test
Test Files  3 passed (3)
Tests       23 passed (23)

npm.cmd run build
Synced advisors: 7
Validated advisors: 7
Verified report copies: 7
Vite production build: passed
```

同步命令仍会对旧版 3 位导师缺少独立 `author_match_confidence` 和 `last_updated` 输出预期警告；前端明确显示 legacy 来源或“来源未标注”，未自行补写。

## 结论

当前 `frontend/` 已满足 1.0 前端内部预览条件。它尚未替换或部署 `web/` 0.5 Beta，也未执行远程推送或正式 1.0 发布。
