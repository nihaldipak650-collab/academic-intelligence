# 导师生产合同 v1.0.5

## 目标

v1.0.5在v1.0.4基础上增加来源闭合、论文发表时机构、ORCID身份链和更精确的文献类型，并保持JSON → Validator → Markdown的单向生产链路。v1.0.4作为历史合同保留，不覆盖。

## v1.0.5新增硬约束

- 每个同时包含 `evidence_ids` 与 `source_urls` 的 Claim 必须双向闭合：去重后 URL 集合必须等于 Manifest 对应 Evidence 的 `source_url` 集合；缺少或多出 URL 都是错误。
- v1.0.5 的 available sourced value 必须以 `evidence-manifest-v1.json#E...` 引用实际 Evidence，且 `source_url` 必须与该 Evidence 的 canonical URL 一致。官方主页提取的外链可例外，但 Official Evidence 必须在 extracted fact 或 notes 中保留该外链，且 provenance URL 仍须指向官方主页。
- `publication_affiliations` 表示论文发表时作者 affiliation institution；`matched_institution` 必须来自该字段，不能复制导师当前机构。
- 每条 `publication_identity` 的非空 `matched_orcid` 都必须与非空 `candidate_orcid` 一致，并且 `orcid_source_url` 必须非空、闭合到对应 Evidence 的 canonical `source_url`；`matched_orcid=null` 时 `orcid_source_url` 必须同为 null。该成对检查也适用于 `identity_status=unresolved`，防止状态切换绕过。
- `orcid_status=verified` 只对 `orcid_verification_evidence_ids` 声明的论文记录形成额外强制 ORCID 链：链中至少两条已核实论文必须拥有相同 `candidate_orcid`，并且至少一条通过发表时机构或作者邮箱与官方主页形成闭合；非链论文若来源没有公开 ORCID，`matched_orcid` 与 `orcid_source_url` 应为 null，不得为满足链规则而补写。
- `orcid_status=verified` 必须有非空 `candidate_orcid`；`orcid_status=not_found` 必须为 candidate null、空 chain 且所有论文 ORCID/来源均为 null；`orcid_status=unresolved` 可有或无 candidate，但任一论文写入非空 ORCID 时 candidate 必须非空且一致。非 verified 状态不得保留非空 ORCID chain。
- ORCID 链至少一条论文记录必须通过发表时机构或作者邮箱与官方主页形成闭合链；仅同名 ORCID 不得通过。若记录 `matched_author_email`，其 `matched_author_email_source_url` 必须非空并与该 Evidence 的 canonical `source_url` 闭合；官方邮箱的 `official_profile_email_source_url` 必须闭合到官方主页 Evidence。
- `publication_types` 保存来源记录的文献类型断言，`source_type` 区分 `journal_article`、`meta_analysis`、`review`、`preprint` 等；当来源断言包含 Meta-Analysis 时，`source_type` 不得写成 review。

## 身份与发布门禁

`advisor_identity` 记录当前机构、官方邮箱、ORCID闭合 Evidence 和验证基础；`publication_identity` 记录论文发表时机构及其来源 URL。人工身份审核 pending 时仍强制 `review_pending` 和 `release_eligible=false`。Validator 通过不等于发布批准。

## Evidence分型

所有Evidence共享证据编号、类型、来源URL、来源权威、候选状态、原因、支持字段、仓库来源引用、核验日期和备注。

`publication`必须包含题名、年份、DOI或null、论文来源类型、作者位置、共同第一、通讯作者、身份确认和版本组。只有论文Evidence参与DOI去重、正式版/预印本版本检查和精选代表论文列表。

`official_profile`必须包含页面标题、姓名、机构、学院、官方来源和逐条提取事实；禁止出现DOI、年份、作者位置、共同第一、通讯作者或版本组等论文专属字段。来源必须是学院、学校、导师或实验室官方页面。

## 身份审查

`advisor_identity`审查导师姓名、机构、学院、官方主页、ORCID与人工状态。`publication_identity`只覆盖论文Evidence。`official_source_identity`只覆盖官方非论文Evidence。Manifest中每条Evidence必须由对应类型的身份记录覆盖，禁止串用。

## 公开事实与AI整理

`public_fact`只能引用已采用且经官方来源身份核验的一手官方Evidence。Researcher API或论文聚合结果不能单独支持公开事实。`ai_synthesis`可引用已采用的论文或官方主页，但必须保留“基于公开证据”“可能”“不代表真实安排”等条件边界。本科生任务与成长路径不得写成实验室承诺。

## 发布门禁

approved/published继续要求合法日期的人类身份审核、导师姓名与机构确认、ORCID状态一致、无P0、所有已采用论文身份确认、所有已采用官方来源域名/姓名/机构确认。任何未满足项强制 `release_eligible=false` 和 `review_pending`。精选论文必须是已采用的publication Evidence并具有独立人工审核记录。

## Renderer边界

Markdown只读取Public Advisor JSON和Manifest。代表论文表只渲染publication。Renderer不读取Validation Report时不得宣称校验通过。公开Markdown不得包含Experience、内部路径、内部作者ID、API原始结构、缓存路径或审计备注。
