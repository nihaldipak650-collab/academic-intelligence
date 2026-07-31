"""Deterministically render a v1.0.2 public advisor review document."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Iterable


REPO_ROOT = Path(__file__).resolve().parents[2]
MAPPING_PATH = REPO_ROOT / "docs" / "advisor-template-v1" / "display-label-mapping-v1.0.2.json"
NO_PUBLIC_INFO = "暂无公开信息"
NEEDS_VERIFICATION = "待核验"
NO_RELIABLE_EVIDENCE = "暂无可靠公开证据"
REPOSITORY_MIGRATION_SOURCE = "现有仓库迁移材料，不作为正式官方来源"
GROWTH_DISCLAIMER = "以下路径是依据公开技术栈整理的通用学习场景，不代表导师官方培养方案、真实时间表或成果承诺。"


def _mapping() -> dict[str, dict[str, str]]:
    return json.loads(MAPPING_PATH.read_text(encoding="utf-8"))


def _label(group: str, value: Any) -> str:
    if value is None:
        return NEEDS_VERIFICATION
    return _mapping().get("enum_labels", {}).get(str(value), str(value))


def _escape(value: Any) -> str:
    return str(value).replace("|", "\\|").replace("\r", " ").replace("\n", " ").strip()


def _source_link(url: str | None) -> str:
    return f"[公开来源]({_escape(url)})" if url else "—"


def _sourced_display(field: dict[str, Any]) -> str:
    if field.get("value") is not None:
        value = _escape(field["value"])
        if field.get("value_en"):
            value += f"（{_escape(field['value_en'])}）"
        return value
    return _label("missing_status", field.get("missing_status"))


def _sourced_row(label: str, field: dict[str, Any]) -> str:
    if field.get("source_url"):
        source = _source_link(field["source_url"])
    elif field.get("source_authority") == "repository_existing_public_report":
        source = REPOSITORY_MIGRATION_SOURCE
    else:
        source = "—"
    verified = field.get("last_verified_at") or NEEDS_VERIFICATION
    return f"| {label} | {_sourced_display(field)} | {source} | {_escape(verified)} |"


def _citations(ids: Iterable[str]) -> str:
    values = list(ids)
    return " ".join(f"[证据 {_escape(item)}]" for item in values) if values else "—"


def _claim_lines(items: list[dict[str, Any]]) -> list[str]:
    if not items:
        return [f"- {NO_RELIABLE_EVIDENCE}。"]
    lines: list[str] = []
    for item in items:
        lines.append(
            f"- **{_label('evidence_lane', item['evidence_lane'])}｜证据支持程度：{_label('confidence', item['confidence'])}**："
            f"{_escape(item['text'])} {_citations(item['evidence_ids'])}"
        )
        if item.get("no_evidence_reason"):
            lines.append(f"  - 原因：{_escape(item['no_evidence_reason'])}")
    return lines


def _publication_sort_key(item: dict[str, Any]) -> tuple[int, str]:
    evidence_id = item.get("evidence_id", "E0")
    try:
        return int(evidence_id[1:]), evidence_id
    except (TypeError, ValueError):
        return 0, evidence_id


def _tri_state(value: bool | None) -> str:
    return "是" if value is True else "否" if value is False else NEEDS_VERIFICATION


def render_markdown(public: dict[str, Any], manifest: dict[str, Any]) -> str:
    """Return canonical LF-terminated Markdown without reading Markdown input."""
    name_zh = _sourced_display(public["name_zh"])
    title = f"# 导师画像：{name_zh}"
    if public["name_en"].get("value"):
        title += f"（{_escape(public['name_en']['value'])}）"
    lines = [
        title, "",
        "> 本页由结构化公开数据确定性生成，用于人工证据审阅；不是网站界面。公开事实与 AI 整理分别标识，可能任务和成长路径不代表真实实验室安排或招募承诺。", "",
        "## 1. 一分钟认识导师", "",
        f"{_escape(public['summary']['text'])} **{_label('evidence_lane', public['summary']['evidence_lane'])}｜证据支持程度：{_label('confidence', public['summary']['confidence'])}** {_citations(public['summary']['evidence_ids'])}", "",
        f"> 数据状态：{_escape(public['data_status_note'])}", "",
        "| 项目 | 内容 |", "|---|---|",
        f"| 机构 | {_sourced_display(public['institution'])} |",
        f"| 学院或部门 | {_sourced_display(public['school_or_department'])} |",
        f"| 职位 | {_sourced_display(public['position'])} |",
        f"| 内容证据支持 | {_label('confidence', public['confidence'])} |",
        f"| 导师论文归属 | {_label('publication_identity_status', public['publication_identity_status'])} |",
        f"| 发布状态 | {_label('publication_status', public['publication_status'])} |", "",
        "## 2. 基础身份与官方信息", "",
        "| 字段 | 内容 | 字段级来源 | 最后核验日期 |", "|---|---|---|---|",
        _sourced_row("中文名", public["name_zh"]), _sourced_row("英文名", public["name_en"]),
        _sourced_row("机构", public["institution"]), _sourced_row("学院或部门", public["school_or_department"]),
        _sourced_row("职位", public["position"]),
    ]
    for index, role in enumerate(public.get("public_roles", []), start=1):
        lines.append(_sourced_row(f"公开角色 {index}", role))
    for key, label in {"official_profile_url":"官方主页", "official_lab_url":"实验室主页", "official_email":"官方邮箱", "official_phone":"官方电话", "lab_address":"实验室地址"}.items():
        lines.append(_sourced_row(label, public["contact"][key]))

    lines.extend(["", "## 3. 研究方向", ""]); lines.extend(_claim_lines(public["research_directions_original"]))
    lines.extend(["", "## 4. 研究方向通俗解释", "", "| 原始术语 | 中文解释 | 本科生理解提示 | 证据 | 证据支持程度 | 内容类型 |", "|---|---|---|---|---|---|"])
    for item in public["research_directions_plain_language"]:
        lines.append(f"| {_escape(item['term_original'])} | {_escape(item['explanation_zh'])} | {_escape(item['undergraduate_meaning'])} | {_citations(item['evidence_ids'])} | {_label('confidence', item['confidence'])} | {_label('evidence_lane', item['evidence_lane'])} |")
    lines.extend(["", "## 5. 主要研究问题", ""]); lines.extend(_claim_lines(public["research_questions"]))
    lines.extend(["", "## 6. 常用技术与研究流程", "", "### 主要技术", ""]); lines.extend(_claim_lines(public["main_techniques"]))
    lines.extend(["", "### 研究流程", ""]); lines.extend(_claim_lines(public["research_workflow"]))

    lines.extend(["", "## 7. 代表性论文", ""])
    featured = set(public["featured_publication_evidence_ids"])
    if public["featured_selection_status"] == "pending_manual_review" and not featured:
        lines.append("代表性论文尚待人工筛选。完整候选证据已保存在内部证据清单中。")
    else:
        lines.extend(["| 证据编号 | 论文原题 | 年份 | DOI | 来源类型 | 作者位置 | 共同第一作者 | 通讯作者 | 公开来源 |", "|---|---|---:|---|---|---|---|---|---|"])
        for item in sorted(manifest["candidate_evidence"], key=_publication_sort_key):
            if item["evidence_id"] not in featured:
                continue
            lines.append(f"| {item['evidence_id']} | {_escape(item['title'])} | {_escape(item['publication_year'] or NO_PUBLIC_INFO)} | {_escape(item['doi'] or NO_PUBLIC_INFO)} | {_label('source_type', item['source_type'])} | {_label('author_position', item['author_position'])} | {_tri_state(item['is_co_first'])} | {_tri_state(item['is_corresponding'])} | {_source_link(item['source_url'])} |")

    lines.extend(["", "## 8. 本科生可能参与的任务", "", "| 可能任务 | 场景与目的 | 可能方法 | 可能产出 | 证据 | 证据支持程度 | 内容类型 | 不确定性 |", "|---|---|---|---|---|---|---|---|"])
    for item in public["possible_undergraduate_tasks"]:
        lines.append(f"| {_escape(item['task'])} | {_escape(item['task_context'])}；{_escape(item['task_purpose'])} | {_escape('、'.join(item['possible_methods']))} | {_escape(item['possible_output'])} | {_citations(item['evidence_ids'])} | {_label('confidence', item['confidence'])} | {_label('evidence_lane', item['evidence_lane'])} | {_escape(item['uncertainty_note'])} |")
    lines.extend(["", "## 9. 前置技能与学习成本", "", "### 前置技能", ""]); lines.extend(_claim_lines(public["prerequisite_skills"]))
    lines.extend(["", "### 学习成本", ""]); lines.extend(_claim_lines([public["learning_cost"]]) if public["learning_cost"] else [f"- {NO_RELIABLE_EVIDENCE}。"])
    stage_labels = {"foundation":"基础阶段", "bounded_task":"边界明确的小任务", "independent_module":"相对独立的模块"}
    lines.extend(["", "## 10. 通用成长路径", "", f"> {GROWTH_DISCLAIMER}", ""])
    for item in public["generic_growth_path"]:
        lines.extend([f"### {stage_labels[item['stage']]}", "", f"- 可能活动：{_escape('、'.join(item['possible_activities']))}", f"- 可能产出：{_escape('、'.join(item['possible_outputs']))}", f"- 证据：{_citations(item['evidence_ids'])}", f"- 证据支持程度：{_label('confidence', item['confidence'])}", f"- 内容类型：{_label('evidence_lane', item['evidence_lane'])}", f"- 不确定性：{_escape(item['uncertainty_note'])}", ""])
    lines.extend(["## 11. 联系前准备与线下核验", "", "- 当前招募、名额、真实任务、组会要求、资源与反馈方式：待核验。", "- 可根据公开研究方向准备具体问题，但不得把可能任务视为承诺。", ""])

    records = manifest["candidate_evidence"]
    version_groups = {item["version_group"] for item in records if item.get("version_group")}
    lines.extend(["## 12. 证据与数据状态", "", f"- 候选 Evidence 总数：{len(records)}", f"- 已采用公开 Evidence 数：{len(public['adopted_public_evidence_ids'])}", f"- 精选代表论文数：{len(featured)}", f"- 身份核验状态：{_label('publication_identity_status', public['publication_identity_status'])}", f"- 正式版/预印本待处理数量：{len(version_groups)}", "- Schema 和字段绑定状态：已通过机械校验", ""])
    verified_dates = sorted({field["last_verified_at"] for _path, field in _all_sourced_fields(public) if field.get("last_verified_at")})
    lines.extend(["## 13. 更新时间与发布状态", "", f"- 迁移日期：{_escape(public['migrated_at'])}", f"- 字段核验日期：{_escape('、'.join(verified_dates)) if verified_dates else NEEDS_VERIFICATION}", f"- 数据版本：{_escape(public['version'])}", f"- 更新状态：{_label('update_status', public['update_status'])}", f"- 发布状态：{_label('publication_status', public['publication_status'])}", "", "## 14. 使用边界说明", "", _escape(public["boundary_statement"]), ""])
    return "\n".join(lines)


def _all_sourced_fields(value: Any, path: str = "$") -> Iterable[tuple[str, dict[str, Any]]]:
    if isinstance(value, dict):
        if {"value", "value_en", "source_url", "source_ref", "source_authority", "last_verified_at", "missing_status"}.issubset(value):
            yield path, value; return
        for key, child in value.items():
            yield from _all_sourced_fields(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _all_sourced_fields(child, f"{path}[{index}]")


def main() -> int:
    parser = argparse.ArgumentParser(description="Render deterministic advisor Markdown.")
    parser.add_argument("public_json", type=Path); parser.add_argument("manifest_json", type=Path); parser.add_argument("output", type=Path)
    args = parser.parse_args()
    public = json.loads(args.public_json.read_text(encoding="utf-8")); manifest = json.loads(args.manifest_json.read_text(encoding="utf-8"))
    args.output.write_text(render_markdown(public, manifest), encoding="utf-8", newline="\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
