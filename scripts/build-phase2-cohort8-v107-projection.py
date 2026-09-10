"""Build and verify the isolated 29-path Phase 2 Cohort 8 v1.0.7 projection."""

from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import argparse
import csv
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.advisor_production.release_v107 import COHORT8_ADVISOR_IDS, load_and_project_cohort8


OUTPUT_ROOT = ROOT / "frontend" / ".release-projection-phase2-cohort8-v107"
PROJECTED_SITE = OUTPUT_ROOT / "site-src"
OLD_PREVIEW = ROOT / "frontend" / ".release-preview-phase2-cohort8"
ALLOWLIST_CSV = ROOT / "docs" / "releases" / "phase-2-cohort-8-release-prep-2026-09-10" / "PROPOSED_PUBLIC_FILES.csv"
PACK_FILES = ("public-advisor-v1.json", "evidence-manifest-v1.json", "validation-report-v1.json")


def invariant(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def parse_directory(path: Path) -> dict:
    source = path.read_text(encoding="utf-8")
    start, end = source.find("{"), source.rfind("}")
    invariant(start >= 0 and end > start, f"DIRECTORY_DATA_INVALID:{path}")
    return json.loads(source[start : end + 1])


def write_directory(path: Path, payload: dict) -> None:
    header = "/* MENTOR DIRECTORY R3 CONVERGENCE — real data only.\n   Generated from the approved public advisor contract. */\n"
    path.write_text(header + "window.DIRECTORY_DATA = " + json.dumps(payload, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8", newline="\n")


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def production_summary(text: str) -> str:
    return text.replace(
        "精选论文由Owner完成内容选择，但仍待最终网页审核，不构成发布许可。",
        "代表论文已完成 Owner scoped release review；该审核为聚焦式复核，不代表全字段穷尽核验。",
    )


def build() -> dict:
    subprocess.run(["node", "scripts/release-preview-phase2-cohort8.mjs"], cwd=ROOT / "frontend", check=True)
    cohort = load_and_project_cohort8()
    for item in cohort:
        invariant(item["validation"]["valid"] and item["validation"]["release_eligible"], f"V107_PACKAGE_NOT_RELEASE_ELIGIBLE:{item['advisor_id']}")

    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)
    shutil.copytree(ROOT / "site-src", PROJECTED_SITE)

    base_directory = parse_directory(ROOT / "site-src" / "academic" / "directory" / "assets" / "data.js")
    preview_directory = parse_directory(OLD_PREVIEW / "academic" / "assets" / "data.js")
    by_id = {item["id"]: deepcopy(item) for item in base_directory["mentors"]}
    for advisor_id in COHORT8_ADVISOR_IDS:
        record = deepcopy(next(item for item in preview_directory["mentors"] if item["id"] == advisor_id))
        record["eligible"] = True
        record["pubStatus"] = "approved"
        record.pop("releaseCandidate", None)
        record["summary"] = production_summary(record.get("summary", ""))
        by_id[advisor_id] = record
    mentors = list(by_id.values())
    counts: dict[str, int] = {}
    for mentor in mentors:
        counts[mentor["deptShort"]] = counts.get(mentor["deptShort"], 0) + 1
    directory = deepcopy(base_directory)
    directory.update({
        "generatedFrom": "approved public advisor contract v1.0.7 scoped release projection",
        "generatedAt": "2026-09-11",
        "reviewCount": len(mentors),
        "publicCount": 20,
        "reviewOnlyCount": 1,
        "departments": [{"id": key, "label": key, "count": value} for key, value in counts.items()],
        "mentors": mentors,
    })
    write_directory(PROJECTED_SITE / "academic" / "directory" / "assets" / "data.js", directory)

    base_dto = json.loads((ROOT / "site-src" / "academic" / "profile" / "data" / "public-dto.json").read_text(encoding="utf-8"))
    preview_dto = json.loads((OLD_PREVIEW / "academic" / "profile" / "data" / "public-dto.json").read_text(encoding="utf-8"))
    projected_by_id = {item["advisor_id"]: item for item in cohort}
    new_entries = []
    for advisor_id in COHORT8_ADVISOR_IDS:
        source = deepcopy(next(item for item in preview_dto["advisors"] if item["id"] == advisor_id))
        projected = projected_by_id[advisor_id]
        source.pop("releaseCandidate", None)
        source.pop("orcidReviewBasis", None)
        source.update({
            "dtoVersion": "1.0.7",
            "schemaVersion": "1.0.7",
            "version": "1.0.7",
            "releaseEligible": True,
            "publicationStatus": "approved",
            "status": "approved",
            "publicationIdentityStatus": projected["public"]["publication_identity_status"],
            "orcidReviewStatus": projected["identity"]["advisor_identity"]["orcid_status"],
        })
        new_entries.append(source)
    dto = {
        "schemaVersion": 1,
        "dtoVersion": "1.0.7",
        "source": "approved-public-advisor-contract-v1.0.7-scoped-release",
        "advisorCount": 20,
        "advisors": [*base_dto["advisors"], *new_entries],
    }
    write_json(PROJECTED_SITE / "academic" / "profile" / "data" / "public-dto.json", dto)

    packs_root = PROJECTED_SITE / "academic" / "profile" / "data" / "packs"
    for item in cohort:
        target = packs_root / item["advisor_id"]
        write_json(target / "public-advisor-v1.json", item["public"])
        write_json(target / "evidence-manifest-v1.json", item["manifest"])
        write_json(target / "validation-report-v1.json", item["validation"])

    preview_data = (OLD_PREVIEW / "academic" / "profile" / "data.js").read_text(encoding="utf-8")
    (PROJECTED_SITE / "t02-src" / "data.js").write_text(preview_data, encoding="utf-8", newline="\n")

    template_path = PROJECTED_SITE / "t02-src" / "template.js"
    template = template_path.read_text(encoding="utf-8")
    old = "<div class=\"ev-item\"><span class=\"ev-k\">论文信息</span><h3>已核验 ${pc.count} 篇</h3><p>题名与年份经 Crossref / DOI 交叉核验，年份以正式卷期为准。</p></div>"
    new = "<div class=\"ev-item\"><span class=\"ev-k\">论文信息</span><h3>已采用 ${pc.count} 篇</h3><p>题名、版本与作者身份依据正式论文元数据逐篇核验。</p>${m.release.orcidReviewStatus === 'unresolved' ? '<p class=\"orcid-open-risk\">导师级 ORCID 尚未唯一核验；页面不展示候选或冲突编号，公开结论不依赖其取值。</p>' : ''}</div>"
    invariant(old in template, "T02_PRODUCTION_TEMPLATE_ANCHOR_MISSING")
    template = template.replace(old, new).replace("共 ${pc.count} 篇已核验；其余在深读层。", "共 ${pc.count} 篇已采用；其余已采用论文在深读层。")
    template_path.write_text(template, encoding="utf-8", newline="\n")

    css_path = PROJECTED_SITE / "t02-src" / "template.css"
    css = css_path.read_text(encoding="utf-8").rstrip() + "\n\n.orcid-open-risk{margin-top:.55rem;padding:.55rem .7rem;border-left:3px solid #b88700;background:#fff8dc;color:#5e4a00}\n"
    css_path.write_text(css, encoding="utf-8", newline="\n")

    result = verify()
    write_json(OUTPUT_ROOT / "PROJECTION_MANIFEST.json", result)
    return result


def file_hash(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def verify() -> dict:
    with ALLOWLIST_CSV.open(encoding="utf-8", newline="") as handle:
        expected_rows = list(csv.DictReader(handle))
    expected = {row["path"]: row["operation"] for row in expected_rows}
    actual: dict[str, str] = {}
    source_root = ROOT
    for projected in PROJECTED_SITE.rglob("*"):
        if not projected.is_file():
            continue
        relative_to_site = projected.relative_to(PROJECTED_SITE)
        repo_relative = (Path("site-src") / relative_to_site).as_posix()
        source = source_root / repo_relative
        if not source.exists():
            actual[repo_relative] = "ADD"
        elif file_hash(source) != file_hash(projected):
            actual[repo_relative] = "MODIFY"
    for source in (ROOT / "site-src").rglob("*"):
        if source.is_file() and not (PROJECTED_SITE / source.relative_to(ROOT / "site-src")).exists():
            actual[(Path("site-src") / source.relative_to(ROOT / "site-src")).as_posix()] = "REMOVE"
    invariant(actual == expected, f"PRODUCTION_ALLOWLIST_MISMATCH:expected={expected}:actual={actual}")

    dto = json.loads((PROJECTED_SITE / "academic" / "profile" / "data" / "public-dto.json").read_text(encoding="utf-8"))
    ids = [item["id"] for item in dto["advisors"]]
    invariant(len(ids) == len(set(ids)) == 20, "PUBLIC_DTO_COUNT_OR_DUPLICATE_INVALID")
    invariant("guo-hui" not in ids, "GUO_HUI_ENTERED_PUBLIC_DTO")
    invariant(all(item.get("releaseEligible") is True and item.get("publicationStatus") in {"approved", "published"} for item in dto["advisors"]), "PUBLIC_DTO_RELEASE_GATE_INVALID")
    cohort_entries = [item for item in dto["advisors"] if item["id"] in COHORT8_ADVISOR_IDS]
    invariant(len(cohort_entries) == 8, "COHORT8_PUBLIC_DTO_COUNT_INVALID")
    public_text = json.dumps(cohort_entries, ensure_ascii=False)
    for forbidden in ("0000-0001-7431-1838", "0000-0001-7270-1939", "0000-0003-3335-9303", "0000-0001-5522-806X"):
        invariant(forbidden not in public_text, f"UNRESOLVED_ORCID_LEAK:{forbidden}")

    doi_owners: dict[str, str] = {}
    totals = {"candidates": 0, "adopted": 0, "verified_candidate": 0, "excluded": 0, "identity_pending": 0, "featured": 0}
    for advisor_id in COHORT8_ADVISOR_IDS:
        root = PROJECTED_SITE / "academic" / "profile" / "data" / "packs" / advisor_id
        public = json.loads((root / "public-advisor-v1.json").read_text(encoding="utf-8"))
        manifest = json.loads((root / "evidence-manifest-v1.json").read_text(encoding="utf-8"))
        report = json.loads((root / "validation-report-v1.json").read_text(encoding="utf-8"))
        invariant(public["schema_version"] == manifest["schema_version"] == report["schema_version"] == "1.0.7", f"PROJECTED_VERSION_INVALID:{advisor_id}")
        invariant(public["publication_status"] == "approved" and report["release_eligible"] is True, f"PROJECTED_RELEASE_INVALID:{advisor_id}")
        adopted = set(public["adopted_public_evidence_ids"])
        featured = set(public["featured_publication_evidence_ids"])
        totals["featured"] += len(featured)
        for evidence in manifest["candidate_evidence"]:
            if evidence["evidence_type"] != "publication":
                continue
            totals["candidates"] += 1
            statuses = set(evidence["candidate_statuses"])
            if "adopted" in statuses:
                totals["adopted"] += 1
                invariant(evidence["identity_verified"] is True, f"UNVERIFIED_ADOPTED:{advisor_id}:{evidence['evidence_id']}")
                doi = (evidence.get("doi") or "").lower()
                if doi:
                    prior_owner = doi_owners.get(doi)
                    invariant(prior_owner is None, f"CROSS_ADVISOR_DOI:{doi}:{prior_owner}:{advisor_id}")
                    doi_owners[doi] = advisor_id
            elif "excluded" in statuses:
                totals["excluded"] += 1
            elif "identity_pending" in statuses:
                totals["identity_pending"] += 1
            else:
                totals["verified_candidate"] += 1
            if evidence["evidence_id"] in featured:
                invariant(evidence["evidence_id"] in adopted and evidence["identity_verified"] is True, f"UNSAFE_FEATURED:{advisor_id}:{evidence['evidence_id']}")
    invariant(totals == {"candidates": 90, "adopted": 54, "verified_candidate": 24, "excluded": 6, "identity_pending": 6, "featured": 39}, f"COHORT_TOTALS_DRIFT:{totals}")
    return {
        "status": "COHORT8_RELEASE_PROJECTION_READY_FOR_OWNER_REVIEW",
        "canonical_source_mutated": False,
        "push_performed": False,
        "deploy_performed": False,
        "production_path_count": len(actual),
        "operations": {"MODIFY": sum(value == "MODIFY" for value in actual.values()), "ADD": sum(value == "ADD" for value in actual.values()), "REMOVE": sum(value == "REMOVE" for value in actual.values())},
        "paths": actual,
        "projected_public_advisor_count": 20,
        "cohort_totals": totals,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = verify() if args.check else build()
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
