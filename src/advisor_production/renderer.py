"""Deterministically render an advisor public JSON plus Evidence Manifest."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Iterable


NO_PUBLIC_INFO = "暂无公开信息"
NEEDS_VERIFICATION = "待核验"
NO_RELIABLE_EVIDENCE = "暂无可靠公开证据"
GROWTH_DISCLAIMER = "以下路径是依据公开技术栈整理的通用学习场景，不代表导师官方培养方案、真实时间表或成果承诺。"


def _escape(value: Any) -> str:
    return str(value).replace("|", "\\|").replace("\r", " ").replace("\n", " ").strip()


def _source_link(url: str | None) -> str:
    return f"[来源]({_escape(url)})" if url else "—"


def _sourced_display(field: dict[str, Any]) -> str:
    if field.get("value") is not None:
        return _escape(field["value"])
    if field.get("missing_status") == "needs_verification":
        return NEEDS_VERIFICATION
    return NO_PUBLIC_INFO


def _sourced_row(label: str, field: dict[str, Any]) -> str:
    verified = field.get("last_verified_at") or (NEEDS_VERIFICATION if field.get("missing_status") == "needs_verification" else "—")
    source = _source_link(field.get("source_url"))
    if source == "—" and field.get("source_ref"):
        source = f"`{_escape(field['source_ref'])}`"
    return f"| {label} | {_sourced_display(field)} | {source} | {_escape(verified)} |"


def _citations(ids: Iterable[str]) -> str:
    values = list(ids)
    return " ".join(f"[{_escape(item)}]" for item in values) if values else "—"


def _claim_lines(items: list[dict[str, Any]]) -> list[str]:
    if not items:
        return [f"- {NO_RELIABLE_EVIDENCE}。"]
    lines: list[str] = []
    for item in items:
        lane = "公开事实" if item["evidence_lane"] == "public_fact" else "AI整理"
        lines.append(
            f"- **{lane}｜{_escape(item['confidence'])}**：{_escape(item['text'])} {_citations(item['evidence_ids'])}"
        )
        if item.get("no_evidence_reason"):
            lines.append(f"  - 原因：{_escape(item['no_evidence_reason'])}")
    return lines


def _publication_sort_key(item: dict[str, Any]) -> tuple[int, str]:
    evidence_id = item.get("evidence_id", "E0")
    try:
        number = int(evidence_id[1:])
    except (TypeError, ValueError):
        number = 0
    return number, evidence_id


def _tri_state(value: bool | None) -> str:
    if value is True:
        return "是"
    if value is False:
        return "否"
    return NEEDS_VERIFICATION


def render_markdown(public: dict[str, Any], manifest: dict[str, Any]) -> str:
    """Return canonical LF-terminated Markdown without reading Markdown input."""
    name_zh = _sourced_display(public["name_zh"])
    name_en = _sourced_display(public["name_en"])
    title = f"# 导师画像：{name_zh}"
    if public["name_en"].get("value"):
        title += f"（{name_en}）"

    lines = [
        title,
        "",
        "> 本页仅依据公开来源和仓库现有的论文证据整理。公开事实与 AI 整理分别标识；可能任务和成长路径不代表真实实验室安排、招募承诺或导师官方培养方案。",
        "",
        "## 1. 一分钟认识导师",
        "",
        f"{_escape(public['summary']['text'])} **[{('公开事实' if public['summary']['evidence_lane'] == 'public_fact' else 'AI整理')}｜{_escape(public['summary']['confidence'])}]** {_citations(public['summary']['evidence_ids'])}",
        "",
        "| 项目 | 内容 |",
        "|---|---|",
        f"| 机构 | {_sourced_display(public['institution'])} |",
        f"| 学院或部门 | {_sourced_display(public['school_or_department'])} |",
        f"| 职位 | {_sourced_display(public['position'])} |",
        f"| 资料状态 | {_escape(public['update_status'])} / {_escape(public['publication_status'])} |",
        "",
        "## 2. 基础身份与官方信息",
        "",
        "| 字段 | 内容 | 字段级来源 | 最后核验 |",
        "|---|---|---|---|",
        _sourced_row("中文名", public["name_zh"]),
        _sourced_row("英文名", public["name_en"]),
        _sourced_row("机构", public["institution"]),
        _sourced_row("学院/部门", public["school_or_department"]),
        _sourced_row("职位", public["position"]),
    ]
    for index, role in enumerate(public.get("public_roles", []), start=1):
        lines.append(_sourced_row(f"公开角色 {index}", role))
    contact_labels = {
        "official_profile_url": "官方主页",
        "official_lab_url": "实验室主页",
        "official_email": "官方邮箱",
        "official_phone": "官方电话",
        "lab_address": "实验室地址",
    }
    for key, label in contact_labels.items():
        lines.append(_sourced_row(label, public["contact"][key]))

    lines.extend(["", "## 3. 研究方向", ""])
    lines.extend(_claim_lines(public["research_directions_original"]))

    lines.extend([
        "",
        "## 4. 研究方向通俗解释",
        "",
        "| 原始术语 | 中文解释 | 本科生理解提示 | Evidence | Confidence | 内容车道 |",
        "|---|---|---|---|---|---|",
    ])
    for item in public["research_directions_plain_language"]:
        lines.append(
            f"| {_escape(item['term_original'])} | {_escape(item['explanation_zh'])} | {_escape(item['undergraduate_meaning'])} | {_citations(item['evidence_ids'])} | {_escape(item['confidence'])} | {_escape(item['evidence_lane'])} |"
        )

    lines.extend(["", "## 5. 主要研究问题", ""])
    lines.extend(_claim_lines(public["research_questions"]))
    lines.extend(["", "## 6. 常用技术与研究流程", "", "### 主要技术", ""])
    lines.extend(_claim_lines(public["main_techniques"]))
    lines.extend(["", "### 研究流程", ""])
    lines.extend(_claim_lines(public["research_workflow"]))

    lines.extend([
        "",
        "## 7. 代表性论文与 DOI",
        "",
        "| Evidence ID | 论文原题 | 年份 | DOI | 来源类型 | author_position | is_co_first | is_corresponding | 来源 |",
        "|---|---|---:|---|---|---|---|---|---|",
    ])
    included_ids = set(public["representative_publication_evidence_ids"])
    for item in sorted(manifest["evidence"], key=_publication_sort_key):
        if item["evidence_id"] not in included_ids or not item["include_in_report"]:
            continue
        lines.append(
            "| {id} | {title} | {year} | {doi} | {source_type} | {position} | {co_first} | {corresponding} | {source} |".format(
                id=_escape(item["evidence_id"]),
                title=_escape(item["title"]),
                year=_escape(item["publication_year"] if item["publication_year"] is not None else NO_PUBLIC_INFO),
                doi=_escape(item["doi"] or NO_PUBLIC_INFO),
                source_type=_escape(item["source_type"]),
                position=_escape(item["author_position"]),
                co_first=_tri_state(item["is_co_first"]),
                corresponding=_tri_state(item["is_corresponding"]),
                source=_source_link(item["source_url"]),
            )
        )

    lines.extend([
        "",
        "## 8. 本科生可能参与的任务",
        "",
        "| 可能任务 | 场景与目的 | 可能方法 | 可能产出 | Evidence | Confidence | 内容车道 | 不确定性 |",
        "|---|---|---|---|---|---|---|---|",
    ])
    for item in public["possible_undergraduate_tasks"]:
        lines.append(
            f"| {_escape(item['task'])} | {_escape(item['task_context'])}；{_escape(item['task_purpose'])} | {_escape('、'.join(item['possible_methods']))} | {_escape(item['possible_output'])} | {_citations(item['evidence_ids'])} | {_escape(item['confidence'])} | {_escape(item['evidence_lane'])} | {_escape(item['uncertainty_note'])} |"
        )
    if not public["possible_undergraduate_tasks"]:
        lines.append(f"| {NO_RELIABLE_EVIDENCE} | — | — | — | — | No Evidence | ai_synthesis | 公开证据不足以推断本科生任务。 |")

    lines.extend(["", "## 9. 前置技能与学习成本", "", "### 前置技能", ""])
    lines.extend(_claim_lines(public["prerequisite_skills"]))
    lines.extend(["", "### 学习成本", ""])
    if public["learning_cost"] is None:
        lines.append(f"- {NO_RELIABLE_EVIDENCE}。")
    else:
        lines.extend(_claim_lines([public["learning_cost"]]))

    stage_labels = {"foundation": "基础阶段", "bounded_task": "边界明确的小任务", "independent_module": "相对独立的模块"}
    lines.extend(["", "## 10. 通用成长路径", "", f"> {GROWTH_DISCLAIMER}", ""])
    for item in public["generic_growth_path"]:
        lines.extend([
            f"### {stage_labels[item['stage']]}",
            "",
            f"- 可能活动：{_escape('、'.join(item['possible_activities']))}",
            f"- 可能产出：{_escape('、'.join(item['possible_outputs']))}",
            f"- Evidence：{_citations(item['evidence_ids'])}",
            f"- Confidence：{_escape(item['confidence'])}",
            f"- 内容车道：{_escape(item['evidence_lane'])}",
            f"- 不确定性：{_escape(item['uncertainty_note'])}",
            "",
        ])

    lines.extend([
        "## 11. 联系前准备与线下核验",
        "",
        "- 当前招募、名额、真实任务、组会要求、资源与反馈方式：待核验。",
        "- 可根据公开研究方向准备具体问题，但不得把可能任务视为承诺。",
        "",
        "## 12. Evidence Manifest",
        "",
        "| Evidence ID | 类型 | 标题/说明 | URL | 身份状态 |",
        "|---|---|---|---|---|",
    ])
    for item in sorted(manifest["evidence"], key=_publication_sort_key):
        lines.append(
            f"| {_escape(item['evidence_id'])} | {_escape(item['source_type'])} | {_escape(item['title'])} | {_source_link(item['source_url'])} | {'已核验' if item['identity_verified'] else '待核验'} |"
        )

    verified_dates = sorted(
        {
            field["last_verified_at"]
            for _path, field in _all_sourced_fields(public)
            if field.get("last_verified_at")
        }
    )
    lines.extend([
        "",
        "## 13. 更新时间",
        "",
        f"- 字段核验日期：{_escape('、'.join(verified_dates)) if verified_dates else NEEDS_VERIFICATION}",
        f"- 数据版本：{_escape(public['version'])}",
        f"- 发布状态：{_escape(public['publication_status'])}",
        "",
        "## 14. Boundary Statement",
        "",
        _escape(public["boundary_statement"]),
        "",
    ])
    return "\n".join(lines)


def _all_sourced_fields(value: Any, path: str = "$") -> Iterable[tuple[str, dict[str, Any]]]:
    if isinstance(value, dict):
        if {"value", "source_url", "source_ref", "source_authority", "last_verified_at", "missing_status"}.issubset(value):
            yield path, value
            return
        for key, child in value.items():
            yield from _all_sourced_fields(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _all_sourced_fields(child, f"{path}[{index}]")


def main() -> int:
    parser = argparse.ArgumentParser(description="Render deterministic advisor Markdown.")
    parser.add_argument("public_json", type=Path)
    parser.add_argument("manifest_json", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    public = json.loads(args.public_json.read_text(encoding="utf-8"))
    manifest = json.loads(args.manifest_json.read_text(encoding="utf-8"))
    args.output.write_text(render_markdown(public, manifest), encoding="utf-8", newline="\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
