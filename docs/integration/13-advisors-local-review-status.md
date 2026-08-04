# 13 位导师本地审核状态

来源：权威包 `data/advisors-v1/<id>/`（供体 HEAD `66ba1a6`），白名单仅
`frontend/config/local-review-cohort-13.json`。

| ID | 姓名线索 | 公开状态 | `release_eligible` | ORCID（identity-review） | Candidate / Adopted / Featured |
|----|----------|----------|--------------------|--------------------------|--------------------------------|
| chen-miao | 陈苗 | approved | true | （见包内） | 正式可公开 |
| guo-hui | 郭辉 | review_pending | false | `0000-0002-1570-2545` | Candidate 6 / Adopted 6 / Featured 0；`human_review_status=pending` |
| hu-dehua | 胡德华 | approved | true | （见包内） | 正式可公开 |
| hu-zhengmao | 胡正茂 | review_pending | false | `0000-0002-3921-8205` | Candidate 11 / Adopted 7 / Featured 0；`human_review_status=pending` |
| li-faxiang | 李发祥 | approved | true | （见包内） | 正式可公开 |
| li-jiada | 李佳达 | approved | true | （见包内） | 正式可公开；featured 选择仍可能为 pending_manual_review |
| li-xing | 李兴 | approved | true | （见包内） | 正式可公开 |
| liu-jing | 刘静 | approved | true | （见包内） | 正式可公开 |
| su-haomiao | 苏浩淼 | approved | true | （见包内） | 正式可公开 |
| tan-jieqiong | 谭洁琼 | approved | true | （见包内） | 正式可公开 |
| wang-shixiang | 王诗翔 | approved | true | （见包内） | 正式可公开 |
| xiang-rong | 向荣 | approved | true | （见包内） | 正式可公开 |
| zhao-yuetao | 赵岳涛 | approved | true | （见包内） | 正式可公开 |

## 模式边界

- **正式 dto**：仅 11 位 `approved` + `release_eligible=true` → `frontend/public/`
- **本地 review**：上表全部 13 位 → `frontend/.local-review/public/`（含 `data/advisors.json` 与 13 份 `reports/<id>.md`）；`public_release_approved=false`；禁止 `vite build --mode review`

## 待审核说明文案

`guo-hui` / `hu-zhengmao`：`待项目负责人人工审核，仅用于本地预览，未经公开批准。`
