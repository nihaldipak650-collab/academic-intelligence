# Luna advisor pilot 3 repair audit v1

日期：2026-09-06
范围：仅 `chen-chao`、`chen-guodong`、`chen-huiyong`；本文件记录 Repair Round 1/2/3 的独立复核拒绝和 Repair Round 2/3/4 的修复结果；状态最高为 `READY_FOR_HUMAN_REVIEW`。

## Independent Review Round 1：FAIL

Round 1 独立复核拒绝了上一版 `v1.0.5`，失败签名为 `ORCID_CHAIN_SCOPE_AND_PROVENANCE_GAP`：

- Validator 错误地要求所有 `identity_status=verified` 的论文都填写 candidate ORCID，而不是只约束 `orcid_verification_evidence_ids` 声明的链记录。
- ORCID provenance URL 未 fail-closed；将链中 E3 的 URL 改为 `https://example.test/not-the-paper` 仍可通过。
- 作者邮箱来源 URL 和官方邮箱来源 URL 未建立闭合门禁。
- 三个名为 `legacy_v104` 的回归测试实际使用了 v1.0.3 fixture，审计留痕不准确。

因此 Round 1 状态为 `FAIL`，不得发布；本节之后记录 Round 2 的修复。

## Independent Review Round 2：FAIL

Round 2 已关闭 Round 1 的链范围和 provenance 缺陷，但独立复核发现新的最小绕过，失败签名为 `NON_CHAIN_ORCID_VALIDATION_BYPASS`：

- Validator 只在 `evidence_id in chain_ids` 时校验 `matched_orcid` 和 `orcid_source_url`。
- 非链论文可携带冲突 ORCID，或携带 candidate ORCID 但没有来源 URL，仍返回 `valid=true`。

因此 Round 2 状态为 `FAIL`，不得发布；Round 3 仅收口全部 publication identity 的 ORCID 值/来源成对规则。

## Independent Review Round 3：FAIL

Round 3 已关闭非链 ORCID 的冲突值和错误来源绕过，但独立复核发现 `candidate_orcid=null` 时仍可接受非空论文 ORCID，失败签名为 `NULL_CANDIDATE_PUBLICATION_ORCID_BYPASS`：

- `candidate_orcid=None` 使 `matched_orcid != candidate_orcid` 的一致性检查被条件跳过。
- 在 `orcid_status=unresolved`、candidate null、空 chain 的组合下，E3-E6 仍可携带非空逐论文 ORCID 并通过。

因此 Round 3 状态为 `FAIL`，不得发布；下一节记录完整 ORCID 真值表的原子收口。

## 修复前检查点

- 隔离分支：`codex/luna-advisor-pilot-3`
- 修复前 HEAD：`fed26decc26a709379b0f087be8d68c1b50f2642`
- 修复前隔离工作树：仅有三个既有未跟踪试生产目录；参考工作树保留原有 11 个未提交报告改动。
- 修复前测试：原有 90 个 test methods、6 个 subtests 全部通过。
- 禁止范围已锁定：线上 12 位、郭辉、公开 DTO/报告、网站源码、workflow、远程写操作。

## 来源

官方主页：

- https://life.csu.edu.cn/info/1042/2563.htm
- https://life.csu.edu.cn/info/1042/2549.htm
- https://life.csu.edu.cn/info/1042/2529.htm

论文 DOI/正式记录：

- 陈超：`10.1126/scitranslmed.adh9974`、`10.1038/s41380-023-02243-4`、`10.1038/s41467-023-40861-2`、`10.1093/schbul/sbad003`、`10.1038/s41380-022-01834-x`
- 陈国栋：`10.1038/s41586-019-1160-0`、`10.1126/sciadv.abo7605`、`10.1016/j.fsi.2024.109661`、`10.3390/ijms252312879`、`10.1016/j.fsi.2025.110411`
- 陈慧勇：`10.1182/bloodadvances.2024012679`、`10.1111/bjh.18706`、`10.1002/ijc.34142`、`10.1111/bjh.16156`、`10.3324/haematol.2015.127902`

## 字段修复

| 缺陷 | 修复前 | 修复后 | 门禁 |
|---|---|---|---|
| Claim URL/Evidence 闭合 | 三包共 11 处 source URL 集合不闭合 | 三包所有 Claim 双向集合闭合 | `EVIDENCE_URL_CLOSURE_MISMATCH` |
| 陈超英文名来源 | `source_ref=...#E2`，`source_url=E4 DOI` | `source_ref=...#E4` | `SOURCED_VALUE_URL_MISMATCH` |
| 陈超 E2/E3 | candidate + identity_pending、角色 unknown | adopted、末位作者、通讯作者、机构/邮箱/ORCID链已记录 | ORCID/身份链门禁 |
| 陈国栋 E2 | matched institution 写成中南大学 | `Chinese Academy of Sciences, Shanghai` | `PUBLICATION_AFFILIATION_MISMATCH` |
| 陈国栋 E3 | matched institution 写成中南大学 | `Boston University` | `PUBLICATION_AFFILIATION_MISMATCH` |
| 陈国栋 ORCID | E2 被无来源补写并纳入链 | E2 `matched_orcid=null`；E3-E6 保留来源闭合链 | `ORCID_CHAIN_SCOPE`、`ORCID_SOURCE_*` |
| 陈慧勇 E6 | matched institution 写成中南大学 | `New York Blood Center` | `PUBLICATION_AFFILIATION_MISMATCH` |
| 陈慧勇 ORCID | E3/E6 被无来源补写并纳入链 | E3/E6 ORCID 字段清空；E2/E4/E5 保留来源闭合链 | `ORCID_CHAIN_SCOPE`、`ORCID_SOURCE_*` |
| 陈慧勇 E4 | `source_type=review` | `source_type=meta_analysis`，`publication_types=[journal_article, meta_analysis]` | `SOURCE_TYPE_META_ANALYSIS_MISMATCH` |

E7 预印本继续保留为 `duplicate_candidate`，与 E3 共用 `chen-chao-methylation-version`，未重复采用。

## Repair Round 2 修复

- ORCID 强制范围收窄到 `orcid_verification_evidence_ids`；非链论文没有公开 ORCID 时保持 `matched_orcid=null`、`orcid_source_url=null`。
- 链中每条论文必须有非空且与该 Evidence `source_url` canonical 相等的 `orcid_source_url`；错误或缺失 URL 均 fail-closed。
- 记录 `matched_author_email` 时，`matched_author_email_source_url` 必须非空并闭合到该论文 Evidence；`official_profile_email_source_url` 必须闭合到官方主页 Evidence。
- 陈国栋 ORCID 链缩减为 E3-E6；陈慧勇缩减为 E2、E4、E5；无明确来源的逐论文 ORCID 已清除。
- 三个 legacy 回归测试改用真正的 v1.0.4 fixture 与 `contract_version="1.0.4"`，不再以 v1.0.3 冒充。

## Repair Round 3 修复

- 每条 publication identity 的非空 `matched_orcid` 现在都必须等于 candidate ORCID，并且拥有闭合到对应 Evidence 的非空 provenance URL。
- `matched_orcid=null` 时，`orcid_source_url` 非空会报 `ORCID_SOURCE_WITHOUT_VALUE`；该检查也覆盖 `identity_status=unresolved`。
- 非链论文只有 ORCID 与来源 URL 同为 null 时才继续通过；链记录仍额外承担至少两条及当前身份闭合要求。

## Repair Round 4：Atomic ORCID Truth Table

- 对全部 publication identity 状态统一执行：candidate null 时任何非空 publication ORCID 失败；非空 ORCID 必须有正确来源且 candidate 一致；null ORCID 只能配 null 来源。
- `verified` 要求 candidate 非空并保留原有至少两条链、verified 记录和当前身份闭合规则。
- `not_found` 要求 candidate null、空 chain、全部论文 ORCID/来源为空。
- `unresolved` 允许 candidate null 或候选值，但非空论文 ORCID 仍必须与非空 candidate 一致；非 verified 状态不得保留非空 chain。

## v1.0.5 底层变更

- 新增并保留旧合同：`production-contract-v1.0.5.md`、`public-advisor-template-v1.0.5.md`。
- 新增 v1.0.5 Public/Manifest/Identity Schema；v1.0.4 文件未覆盖。
- Manifest 增加论文发表时 `publication_types`、`publication_affiliations` 和 affiliation provenance URL。
- Identity Review 增加官方邮箱、ORCID闭合 Evidence、论文发表时机构/邮箱/ORCID来源字段。
- Validator 增加 claim URL 双向闭合、sourced value provenance、发表时机构、限定链范围的 ORCID provenance、邮箱来源闭合和 Meta-Analysis 类型规则。
- Renderer 使用 v1.0.5 标签映射，兼容渲染 v1.0.4；新增 `meta_analysis=Meta分析` 标签。

## 缺陷夹具与测试

`tests/test_advisor_production_v105.py` 共 25 个 test methods、40 个 assertions，全部通过。全量套件为 115 tests、6 subtests。

- v1.0.4 路径放过缺失/额外 Claim URL，v1.0.5 分别报 `EVIDENCE_URL_CLOSURE_MISMATCH`；
- v1.0.4 路径放过 sourced value `source_ref` 错位，v1.0.5 报 `SOURCED_VALUE_URL_MISMATCH`；
- 官方主页外链有提取记录时通过；
- 论文发表时机构写成当前机构时报 `PUBLICATION_AFFILIATION_MISMATCH`；
- 仅同名 ORCID、无跨论文链时报 `ORCID_CHAIN_INCOMPLETE`；
- 两条有来源 ORCID 链记录加一条无公开 ORCID 的非链论文仍可通过；
- 错误或缺失 ORCID provenance URL 分别报 `ORCID_SOURCE_MISMATCH`、`ORCID_SOURCE_MISSING`；
- 错误论文邮箱来源 URL 报 `PUBLICATION_EMAIL_SOURCE_MISMATCH`，错误官方邮箱来源 URL 报 `OFFICIAL_PROFILE_EMAIL_SOURCE_MISMATCH`；
- 非链论文冲突 ORCID、缺失 ORCID 来源、错误 ORCID 来源分别报 `ORCID_RECORD_MISMATCH`、`ORCID_SOURCE_MISSING`、`ORCID_SOURCE_MISMATCH`；
- `unresolved` 论文携带不成对 ORCID/来源时报 `ORCID_SOURCE_WITHOUT_VALUE`，非链 ORCID 与来源同为 null 仍通过；
- candidate null 携带论文 ORCID 报 `ORCID_CANDIDATE_MISSING`；`not_found` 携带论文 ORCID 或非空 chain 分别报状态冲突；合法 `unresolved` 组合保持 `review_pending`。
- Meta-Analysis 写成 review 时报 `SOURCE_TYPE_META_ANALYSIS_MISMATCH`；
- 预印本与正式版同时 adopted 时报 `DUPLICATE_PUBLICATION_VERSION`；
- 人工身份审核 pending 时仍保持 `release_eligible=false`。

## 最终包结果

| advisor_id | candidate Evidence | adopted | validator | release_eligible | effective status |
|---|---:|---:|---|---|---|
| `chen-chao` | 7 | 6 | valid=true | false | review_pending |
| `chen-guodong` | 6 | 6 | valid=true | false | review_pending |
| `chen-huiyong` | 6 | 6 | valid=true | false | review_pending |

三个包的人工身份审核均为 pending；未写入 `HUMAN_APPROVED`，未上线。Round 4 后唯一 Validator warning 仍为 `IDENTITY_REVIEW_PENDING`。

## 保护边界与最终审计

- 允许修改范围仅为三个数据包、`src/advisor_production/`、`docs/advisor-template-v1/`、直接相关测试和本审计文件。
- 未修改线上 12 位、郭辉、公开 DTO、公开报告、网站源码或 workflow。
- 未 push、merge、rebase、deploy，也未进行远程写操作。
- 最终机械检查包括：三包 Renderer 后 Validator、schema/field binding、Markdown Evidence ID、全量测试、`git diff --check`、哈希和路径 allowlist。

最终机器状态：`READY_FOR_HUMAN_REVIEW`；这不是人工批准或上线许可。

## 最终 SHA-256

Fresh Renderer 输出与已保存 Markdown 字节一致；Fresh Validator 输出与已保存 validation report 字节一致。

```text
data/advisors-v1/chen-chao/evidence-manifest-v1.json  d71a073d6058c6124e8474726ba8cfc99f9a0f89cd2bf0651647170b2ced125b
data/advisors-v1/chen-chao/identity-review-v1.json    d14c1e6a33d59f90d9a7471c8727659d190ef8bb18d21e450ea71f23c9cb3673
data/advisors-v1/chen-chao/public-advisor-v1.json     b233ee3f8f23a89c3979ed9e9be8661b668d693ae23a20f3b3bedf88e126ef99
data/advisors-v1/chen-chao/public-advisor-v1.md       7aa06c366fd9cc5fd6e719a0b61e36c51a07fef92f86aea1405524ea574c33cd
data/advisors-v1/chen-chao/validation-report-v1.json  e5526c2b33ddf391bd7c483c972379b6c1368f07d921a7889d1d48fd89cc9bf4
data/advisors-v1/chen-guodong/evidence-manifest-v1.json  2a42a0d6eb7eccac0414f4151648b89b68ac83a8fe8e9633a9ceb423090141ce
data/advisors-v1/chen-guodong/identity-review-v1.json    6567a7d6208889daf814bb09a2dd98489aafb48441d41276891804464340c88c
data/advisors-v1/chen-guodong/public-advisor-v1.json     fdb9ad4c67bffbcb7f777c40ce45857ba191134dce3da3754a9ac97d6f7d5c03
data/advisors-v1/chen-guodong/public-advisor-v1.md       d7be6e249f36d278de58cbeb03ed858b8a3a53bc11b42196eafa507662038a93
data/advisors-v1/chen-guodong/validation-report-v1.json  e8f1d6e620e39418498f5911e2b66e851db2879e0d4441ca151bdc6fa170f342
data/advisors-v1/chen-huiyong/evidence-manifest-v1.json  7ba3e2f8e8f6e95f3b85b2eadeb1d0ec5ed0c427c7231f0d5571e2875bc9b5e1
data/advisors-v1/chen-huiyong/identity-review-v1.json    df6274785366ca194b226dd8de459b49a1e6832ed0f0c5446f777a29c6516c6b
data/advisors-v1/chen-huiyong/public-advisor-v1.json     c8f3c0bbdee65027e2464a3382a7c817b109228da1a687137929f680ae39dfae
data/advisors-v1/chen-huiyong/public-advisor-v1.md       40862d6ab83c01222240010daefe19bed6dc615b70261506d550b22aacaed094
data/advisors-v1/chen-huiyong/validation-report-v1.json  a3ee13fe8990490418020ccf6e479f1092c36fc5ce3fcfc669111f709318b64d
```
