# Phase 2 Cohort 8 v1.0.6 — Owner Web Review

状态：`READY_FOR_OWNER_REVIEW`

本页是本地 Owner 人工审核清单，不是批准记录、发布许可或上线记录。Owner Decision 仅允许人工填写：`ACCEPT`、`ACCEPT_WITH_NOTES`、`FIX`、`REJECT`。

## 本地预览范围

- Cohort：8 位，配置文件为 `frontend/config/local-review-phase2-cohort-8-v106.json`。
- 数据源：每位导师目录内的 v1.0.6 五文件 package。
- 隔离输出：`frontend/.local-review-phase2-8/`。
- 本地入口：`http://127.0.0.1:43124/#/advisors`。
- 页面状态：`review_pending`、`release_eligible=false`、`publication_identity_status=pending_verification`。
- 论文状态：本轮未执行论文检索；论文候选 0；已采用论文 0。
- 禁止状态：不是 `HUMAN_APPROVED`、`READY_FOR_RELEASE` 或 `PUBLICATION_APPROVED`。

## Owner 审核矩阵

| Advisor | Route | Identity | Research | Evidence | Publication wording | Cross contamination | UI | Owner Decision |
|---|---|---|---|---|---|---|---|---|
| 陈淑华 | `#/advisor/chen-shuhua` | 待人工审核 | 待人工审核 | 待人工审核 | 自动检查 PASS，待人工阅读 | 自动检查 PASS | 浏览器 PASS | |
| 邓梅春 | `#/advisor/deng-meichun` | 待人工审核 | 待人工审核 | 待人工审核 | 自动检查 PASS，待人工阅读 | 自动检查 PASS | 浏览器 PASS | |
| 邓穗馨 | `#/advisor/deng-suixin` | 待人工审核 | 待人工审核 | 待人工审核 | 自动检查 PASS，待人工阅读 | 自动检查 PASS | 浏览器 PASS | |
| 段然慧 | `#/advisor/duan-ranhui` | 待人工审核 | 待人工审核 | 待人工审核 | 自动检查 PASS，待人工阅读 | 自动检查 PASS | 浏览器 PASS | |
| 范亮亮 | `#/advisor/fan-liangliang` | 待人工审核 | 待人工审核 | 待人工审核 | 自动检查 PASS，待人工阅读 | 自动检查 PASS | 浏览器 PASS | |
| 虢毅 | `#/advisor/guo-yi` | 待人工审核 | 待人工审核 | 待人工审核 | 自动检查 PASS，待人工阅读 | 自动检查 PASS | 浏览器 PASS | |
| 姜浩 | `#/advisor/jiang-hao` | 待人工审核 | 待人工审核 | 待人工审核 | 自动检查 PASS，待人工阅读 | 自动检查 PASS | 浏览器 PASS | |
| 李津臣 | `#/advisor/li-jinchen` | 待人工审核 | 待人工审核 | 待人工审核 | 自动检查 PASS，待人工阅读 | 自动检查 PASS | 浏览器 PASS | |

## Review-only gate

Adapter 在映射前逐包检查：

- 五文件存在且可读取；四个 JSON 的 schema 均为 `1.0.6`，advisor_id 均与目录一致。
- Validation 必须 `valid=true`、`release_eligible=false`，请求与有效 publication status 均为 `review_pending`。
- Publication identity 必须为 `pending_verification`；`verified` 且已采用论文为 0 时使用独立错误码 fail closed。
- Manifest 与 Validation 的论文候选、已采用论文、featured 论文均为 0；Identity publication records 为空。
- 数据状态与 Markdown 均明确包含“本轮未执行论文检索”；Markdown 必须包含 canonical publication pending 文案。
- Cohort ID 必须逐项等于本任务固化的 8 人集合；替换任意一人即 fail closed。
- 8 个 package 之间执行 advisor_id、姓名、Evidence source URL 与完整来源记录指纹污染检查。

## 自动验证记录

- Phase 2 adapter / cohort / output / UI：11 tests passed（含目标替换与 Evidence URL 复制负向用例）。
- TypeScript typecheck：PASS。
- Vite `review-phase2` 隔离构建：PASS，产物写入 `frontend/.local-review-phase2-8/dist/`。
- 旧 13 人 local review：13 tests passed；生成 13 位、13 份报告；validate PASS。
- Python 全量回归：125 tests、6 subtests passed。
- Canonical publication pending 文案：8/8 reports。
- 禁止的 verified/release wording：0 hits。
- 浏览器逐路由复核：8/8 页面可打开；8/8 显示 pending、search not run、候选 0、已采用 0 和官方主页链接；禁止文案 0 hits。
- `git diff --check`：PASS。
- `frontend/public/` 与 `web/`：本轮 diff 为空。
- Fresh Independent Reviewer：首轮发现 exact-set 与 Evidence fingerprint 两项 P1；最小修复后复核 PASS，状态 `INDEPENDENT_REVIEWER_PASS`。

## 已知非本轮公开基线问题

运行完整前端 Vitest 时共 101 tests，其中 99 passed、2 failed：

1. `public-advisor-dto.test.mjs` 仍写死 source advisor 数量为 13；当前工作树已有 24 个 advisor package，但公开 adapter 仍只导出 12 位。
2. 当前既有 `frontend/public` 中至少一份公开 report 的实际 SHA-256 与既有 DTO 记录不一致。

两项均位于本轮禁止修改的公开路径或公开测试语义，且不是 Phase 2 isolated adapter 引入。本轮未修改公开 DTO、公开 reports 或 public adapter 来掩盖失败。

## Owner 人工阅读顺序

1. 打开 `#/advisors`，确认只出现 8 位导师与黄色 LOCAL REVIEW 状态条。
2. 逐页检查身份、研究方向、Evidence 链和官方主页链接。
3. 确认每页都显示“本轮未执行论文检索”和 canonical publication pending 文案。
4. 在上表最后一列人工填写决策；在 Owner 明确批准前保持 `review_pending` 与 `release_eligible=false`。
