# 导师信息网站 1.0 前端

React + TypeScript + Vite 的独立前端。它与仓库中的 `web/` 0.1 静态站点并行，不修改旧站点。

## 本地运行

```powershell
npm.cmd install
npm.cmd run dev
```

生产构建：

```powershell
npm.cmd run build
```

## 路由

- `/#/`：导师列表、姓名搜索、研究方向筛选
- `/#/advisor/:id`：导师详情文档

使用 Hash Router 是为了兼容 GitHub Pages 等纯静态托管环境，直接刷新详情页时不需要服务端路由回退。

## 数据与证据边界

当前演示数据位于 `src/data/advisors.ts`。其中论文标题与 DOI 的占位内容必须经过人工核验后才能替换为正式公开数据。

- `directions`、`methods`：学术证据区
- `experiences`：可选的学生经历区；空数组会渲染“暂无经历证据”
- `confidence`、`confidenceNote`：证据置信度及 Tooltip 解释
- `boundary`：页面底部使用边界声明

正式接入数据时，建议继续保持“学术事实”和“学生经历”两条证据通道分离。
