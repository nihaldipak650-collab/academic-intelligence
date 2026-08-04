# 导师生产合同 v1.0.4

## 目标

v1.0.4在v1.0.3身份发布门禁上增加真正的分型Evidence，并保持JSON → Validator → Markdown的单向生产链路。旧合同文件保留，不覆盖。

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
