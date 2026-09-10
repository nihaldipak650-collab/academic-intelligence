"""Apply the exact 2026-09-10 Owner publication decisions, locally only."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from src.advisor_production.renderer import render_markdown
from src.advisor_production.validator import validate_package


REVIEW = ROOT / "docs" / "reviews" / "phase-2-publication-enrichment"
DATA = ROOT / "data" / "advisors-v1"
DECISION_PATH = REVIEW / "OWNER_PUBLICATION_DECISIONS_2026-09-10.json"
DATE = "2026-09-10"
CRITERIA = [
    "publication identity confidence",
    "coverage of official research directions",
    "complementarity across selected papers",
    "recency where useful",
    "author role where useful",
    "student interpretability",
]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def evidence_url_by_id(manifest):
    return {item["evidence_id"]: item["source_url"] for item in manifest["candidate_evidence"]}


def refresh_generic_synthesis(value, ids, urls):
    if isinstance(value, dict):
        if value.get("evidence_lane") == "ai_synthesis":
            if "evidence_ids" in value:
                value["evidence_ids"] = list(ids)
            if "source_urls" in value:
                value["source_urls"] = list(urls)
        for child in value.values():
            refresh_generic_synthesis(child, ids, urls)
    elif isinstance(value, list):
        for child in value:
            refresh_generic_synthesis(child, ids, urls)


def owner_section(advisor_id, decision, before_adopted):
    final_adopted = decision["keep_adopted"] + decision["promote"]
    lines = [
        "## Owner decision",
        "",
        "- Decision: `ACCEPT_WITH_NOTES` (publication content / featured selection only).",
        f"- Machine adopted set before writeback: {', '.join(before_adopted)}.",
        f"- Owner final adopted set: {', '.join(final_adopted)}.",
        f"- Owner promotions: {', '.join(decision['promote']) or 'none'}.",
        f"- Owner featured set: {', '.join(decision['featured'])}.",
        f"- Rejected retained: {', '.join(decision['rejected']) or 'none'}.",
        f"- Unresolved retained: {', '.join(decision['unresolved']) or 'none'}.",
        f"- Verified candidates retained: {', '.join(decision['keep_candidate']) or 'none'}.",
        f"- Advisor ORCID decision: `{decision['orcid']['status']}`; value `{decision['orcid'].get('value')}`.",
        "- Featured selection is an Owner choice, not a citation ranking or release approval.",
        "- Global human identity review remains pending; final website visual review is still required.",
    ]
    if advisor_id == "jiang-hao":
        lines += [
            "- `TARGETED_IDENTITY_FOLLOWUP`: E5 remains unresolved pending publication-time author-affiliation closure.",
            "- E11 remains unresolved because its email conflicts with the target publication identity.",
            "- Limitation: current adopted evidence supports tumor mechanisms more strongly than tumor-nerve interaction; no tumor-nerve publication trajectory is claimed.",
        ]
    if advisor_id == "li-jinchen":
        lines.append("- The two incompatible ORCID values remain visible and unresolved; neither is selected.")
    if advisor_id == "duan-ranhui":
        lines.append("- E3 formal DOI remains canonical; the Research Square preprint remains a version relation only.")
    return "\n".join(lines) + "\n"


def update_audit(advisor_id, section):
    path = REVIEW / f"{advisor_id}-publication-audit.md"
    text = path.read_text(encoding="utf-8")
    marker = "\n## Owner decision\n"
    if marker in text:
        text = text.split(marker, 1)[0].rstrip() + "\n"
    path.write_text(text.rstrip() + "\n\n" + section, encoding="utf-8", newline="\n")


def apply_one(advisor_id, decision):
    package = DATA / advisor_id
    public = read_json(package / "public-advisor-v1.json")
    manifest = read_json(package / "evidence-manifest-v1.json")
    identity = read_json(package / "identity-review-v1.json")
    by_id = {item["evidence_id"]: item for item in manifest["candidate_evidence"]}
    publication_ids = {item["evidence_id"] for item in manifest["candidate_evidence"] if item["evidence_type"] == "publication"}
    final_adopted = decision["keep_adopted"] + decision["promote"]
    partition = set(final_adopted + decision["keep_candidate"] + decision["rejected"] + decision["unresolved"])
    if partition != publication_ids:
        raise RuntimeError(f"OWNER_PARTITION_MISMATCH:{advisor_id}:{sorted(publication_ids - partition)}:{sorted(partition - publication_ids)}")
    identity_by_id = {item["evidence_id"]: item for item in identity["publication_identity"]}
    for evidence_id in decision["promote"]:
        if not by_id[evidence_id].get("identity_verified") or identity_by_id[evidence_id].get("identity_status") != "verified":
            raise RuntimeError(f"PROMOTION_NOT_IDENTITY_VERIFIED:{advisor_id}:{evidence_id}")
        if "candidate" not in by_id[evidence_id].get("candidate_statuses", []):
            raise RuntimeError(f"PROMOTION_NOT_FROM_CANDIDATE:{advisor_id}:{evidence_id}")

    before_adopted = [item["evidence_id"] for item in manifest["candidate_evidence"] if item["evidence_type"] == "publication" and "adopted" in item.get("candidate_statuses", [])]
    for evidence_id in final_adopted:
        by_id[evidence_id]["candidate_statuses"] = ["adopted"]
        by_id[evidence_id]["notes"] = by_id[evidence_id]["notes"].split(" Owner decision 2026-09-10", 1)[0] + " Owner decision 2026-09-10: adopted for local publication review; not release approval."

    public["adopted_public_evidence_ids"] = ["E1"] + final_adopted
    public["featured_publication_evidence_ids"] = decision["featured"]
    public["featured_selection_status"] = "manually_reviewed"
    public["featured_selection_review"] = {
        "status": "approved",
        "reviewed_at": DATE,
        "reviewer_role": "user",
        "selection_criteria": CRITERIA,
        "notes": "Owner-approved publication-content featured selection for final local website review only; not global human identity approval or release authorization.",
    }
    public["publication_status"] = "review_pending"
    urls = evidence_url_by_id(manifest)
    bound_ids = ["E1"] + final_adopted
    bound_urls = [urls[evidence_id] for evidence_id in bound_ids]
    if decision["promote"]:
        for field in ("research_questions", "main_techniques", "research_workflow", "possible_undergraduate_tasks", "prerequisite_skills", "learning_cost", "generic_growth_path", "summary"):
            refresh_generic_synthesis(public.get(field), bound_ids, bound_urls)

    total = len(publication_ids)
    adopted_count = len(final_adopted)
    rejected_count = len(decision["rejected"])
    unresolved_count = len(decision["unresolved"])
    candidate_count = len(decision["keep_candidate"])
    public["data_status_note"] = (
        f"Owner publication decision 2026-09-10 applied locally: candidates {total}, adopted {adopted_count}, "
        f"verified non-adopted {candidate_count}, rejected {rejected_count}, unresolved {unresolved_count}, "
        f"featured {len(decision['featured'])}. Final website visual review and global human identity review remain pending; publication_status stays review_pending."
    )
    if isinstance(public.get("summary"), dict):
        public["summary"]["text"] = (
            f"根据官方主页与{adopted_count}篇已采用论文，可概括该导师的公开身份与研究方向；"
            f"另有{candidate_count}篇身份已核验候选、{rejected_count}篇同名错配和{unresolved_count}篇未决。"
            "精选论文由Owner完成内容选择，但仍待最终网页审核，不构成发布许可。"
        )
        if advisor_id == "jiang-hao":
            public["summary"]["text"] += " 当前采用证据对肿瘤机制的支持强于肿瘤—神经互作，后者不作为论文支持的发展脉络。"
    if advisor_id == "jiang-hao":
        limitation = " 当前采用论文对肿瘤机制的支持强于肿瘤—神经互作；不得把后者写成论文已支持的发展脉络。"
        if limitation.strip() not in public["boundary_statement"]:
            public["boundary_statement"] += limitation

    identity["advisor_identity"]["human_review_status"] = "pending"
    identity["notes"] = identity["notes"].split(" Owner publication decision", 1)[0] + " Owner publication decision 2026-09-10 accepted adopted/featured content only; global identity and release review remain pending."

    write_json(package / "public-advisor-v1.json", public)
    write_json(package / "evidence-manifest-v1.json", manifest)
    write_json(package / "identity-review-v1.json", identity)
    markdown = render_markdown(public, manifest)
    (package / "public-advisor-v1.md").write_text(markdown, encoding="utf-8", newline="\n")
    report = validate_package(public, manifest, identity, package_dir=package)
    write_json(package / "validation-report-v1.json", report)
    if not report["valid"] or report["release_eligible"]:
        raise RuntimeError(f"VALIDATION_GATE_FAILED:{advisor_id}:{report}")
    update_audit(advisor_id, owner_section(advisor_id, decision, before_adopted))


def update_ledger(decisions):
    path = REVIEW / "publication_identity_ledger.csv"
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if len(rows) != 90:
        raise RuntimeError(f"LEDGER_ROW_COUNT:{len(rows)}")
    fields = list(rows[0])
    for row in rows:
        decision = decisions[row["advisor_id"]]
        evidence_id = row["publication_candidate_id"]
        if evidence_id in decision["promote"]:
            if row["identity_status"] != "verified" or row["decision"] != "candidate":
                raise RuntimeError(f"LEDGER_PROMOTION_INVALID:{row['advisor_id']}:{evidence_id}")
            row["decision"] = "adopted"
            row["adopted_evidence_id"] = evidence_id
            row["notes"] = row["notes"].split(" Owner decision 2026-09-10", 1)[0] + " Owner decision 2026-09-10: promoted to adopted for local publication review; not release approval."
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def update_owner_matrix(decisions):
    lines = [
        "# Phase 2 Cohort 8 Publication Owner Review",
        "",
        "All eight publication-content decisions are `ACCEPT_WITH_NOTES`.",
        "",
        "**FINAL WEBSITE VISUAL REVIEW STILL REQUIRED. This is not global human identity approval or release authorization.**",
        "",
        "| Advisor | Candidates | Adopted | Rejected | Ambiguous | ORCID | Featured | Owner decision | Advisor-specific note |",
        "| --- | ---: | ---: | ---: | ---: | --- | ---: | --- | --- |",
    ]
    names = {"chen-shuhua":"陈淑华","deng-meichun":"邓梅春","deng-suixin":"邓穗馨","duan-ranhui":"段然慧","fan-liangliang":"范亮亮","guo-yi":"虢毅","jiang-hao":"姜浩","li-jinchen":"李津臣"}
    notes = {
        "chen-shuhua":"E23 unresolved; ORCID closure is E2+E7, not a complete public profile.",
        "deng-meichun":"E9 stays verified candidate; featured balances pain and channel/peptide work.",
        "deng-suixin":"E9 stays candidate; sample does not cover every official social/sleep/emotion direction.",
        "duan-ranhui":"E3 formal version remains canonical; E9/E10 stay candidates.",
        "fan-liangliang":"Single-record ORCID remains unresolved; no 2026 promotion.",
        "guo-yi":"E7 remains unresolved despite topical fit; E11 remains rejected dermatology namesake.",
        "jiang-hao":"E5 targeted follow-up and E11 remain unresolved; no tumor-nerve publication trajectory claim.",
        "li-jinchen":"Two incompatible ORCIDs remain unresolved; E7/E8 stay identity_pending.",
    }
    for advisor_id, decision in decisions.items():
        adopted = len(decision["keep_adopted"] + decision["promote"])
        orcid = decision["orcid"]["status"] + ": " + str(decision["orcid"].get("value") or "no candidate selected")
        lines.append(f"| {names[advisor_id]} | {adopted + len(decision['keep_candidate']) + len(decision['rejected']) + len(decision['unresolved'])} | {adopted} | {len(decision['rejected'])} | {len(decision['unresolved'])} | {orcid} | {len(decision['featured'])} | ACCEPT_WITH_NOTES | {notes[advisor_id]} |")
    lines += ["", "Owner decisions are preserved verbatim in `OWNER_PUBLICATION_DECISIONS_2026-09-10.md` and `.json`.", ""]
    (REVIEW / "phase-2-cohort-8-publication-owner-review.md").write_text("\n".join(lines), encoding="utf-8", newline="\n")


def main():
    artifact = read_json(DECISION_PATH)
    if artifact.get("release_authorized") is not False or artifact.get("global_human_approved") is not False:
        raise RuntimeError("OWNER_SCOPE_MUST_REMAIN_FAIL_CLOSED")
    decisions = artifact["advisors"]
    for advisor_id, decision in decisions.items():
        apply_one(advisor_id, decision)
    update_ledger(decisions)
    update_owner_matrix(decisions)
    print(json.dumps({"ok": True, "advisors": len(decisions), "status": "OWNER_DECISIONS_WRITTEN_LOCAL_REVIEW_ONLY"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
