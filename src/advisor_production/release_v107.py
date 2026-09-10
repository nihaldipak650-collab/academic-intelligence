"""Deterministic v1.0.6 -> v1.0.7 scoped release projection helpers."""

from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
from pathlib import Path
from typing import Any
import json

from .renderer import render_markdown
from .validator_v107 import validate_package


REPO_ROOT = Path(__file__).resolve().parents[2]
COHORT8_ADVISOR_IDS = (
    "chen-shuhua",
    "deng-meichun",
    "deng-suixin",
    "duan-ranhui",
    "fan-liangliang",
    "guo-yi",
    "jiang-hao",
    "li-jinchen",
)
OWNER_REVIEW_PATH = REPO_ROOT / "docs" / "releases" / "advisor-production-v1.0.7-review" / "COHORT8_OWNER_SCOPED_RELEASE_REVIEW.json"
OWNER_REVIEW_FIELDS = (
    "status",
    "reviewer_role",
    "reviewed_at",
    "review_scope",
    "advisor_ids",
    "publication_decision_artifact_ref",
    "publication_decision_sha256",
    "featured_decision_artifact_ref",
    "known_open_risks_sha256",
    "known_open_risks_acknowledged",
    "exhaustive_review",
    "release_authorized",
    "notes",
)


def _activate_scoped_release_wording(public: dict[str, Any]) -> None:
    old_summary = "精选论文由Owner完成内容选择，但仍待最终网页审核，不构成发布许可。"
    new_summary = "代表论文已完成 Owner scoped release review；该审核为聚焦式复核，不代表全字段穷尽核验。"
    if isinstance(public.get("summary"), dict):
        public["summary"]["text"] = public["summary"].get("text", "").replace(old_summary, new_summary)
    public["featured_selection_review"]["notes"] = (
        "Owner-approved featured selection is included in the scoped v1.0.7 release review; "
        "the review is not exhaustive field-by-field human approval."
    )
    note = public.get("data_status_note", "")
    marker = " Final website visual review and global human identity review remain pending; publication_status stays review_pending."
    public["data_status_note"] = note.replace(
        marker,
        " Scoped Owner release review approved with notes; global exhaustive human approval is not asserted.",
    )


def _redact_unresolved_orcid_values(value: Any, unresolved_values: set[str]) -> Any:
    if isinstance(value, dict):
        return {key: _redact_unresolved_orcid_values(item, unresolved_values) for key, item in value.items()}
    if isinstance(value, list):
        return [_redact_unresolved_orcid_values(item, unresolved_values) for item in value]
    if isinstance(value, str):
        for unresolved in unresolved_values:
            value = value.replace(unresolved, "[unresolved advisor ORCID candidate withheld from public projection]")
    return value


def load_owner_scoped_review(path: Path = OWNER_REVIEW_PATH) -> dict[str, Any]:
    review = json.loads(path.read_text(encoding="utf-8"))
    if review.get("schema_version") != "1.0.7":
        raise ValueError("OWNER_SCOPED_REVIEW_VERSION_INVALID")
    if tuple(review.get("advisor_ids", ())) != COHORT8_ADVISOR_IDS:
        raise ValueError("OWNER_SCOPED_REVIEW_COHORT_MISMATCH")
    for key in ("publication_decision_artifact_ref", "featured_decision_artifact_ref", "known_open_risks_artifact_ref"):
        target = REPO_ROOT / review[key]
        if not target.is_file():
            raise ValueError(f"OWNER_SCOPED_REVIEW_ARTIFACT_MISSING:{key}")
    publication_path = REPO_ROOT / review["publication_decision_artifact_ref"]
    risk_path = REPO_ROOT / review["known_open_risks_artifact_ref"]
    if sha256(publication_path.read_bytes()).hexdigest() != review.get("publication_decision_sha256"):
        raise ValueError("OWNER_PUBLICATION_DECISION_HASH_MISMATCH")
    if sha256(risk_path.read_bytes()).hexdigest() != review.get("known_open_risks_sha256"):
        raise ValueError("OWNER_KNOWN_RISKS_HASH_MISMATCH")
    return review


def project_package_v107(
    public: dict[str, Any],
    manifest: dict[str, Any],
    identity: dict[str, Any],
    owner_review: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    advisor_id = public.get("advisor_id")
    if advisor_id not in COHORT8_ADVISOR_IDS:
        raise ValueError(f"V107_CALIBRATION_ADVISOR_OUT_OF_SCOPE:{advisor_id}")
    if {public.get("schema_version"), manifest.get("schema_version"), identity.get("schema_version")} != {"1.0.6"}:
        raise ValueError(f"V107_PROJECTION_REQUIRES_FROZEN_V106:{advisor_id}")
    if manifest.get("advisor_id") != advisor_id or identity.get("advisor_id") != advisor_id:
        raise ValueError(f"V107_PROJECTION_ADVISOR_ID_MISMATCH:{advisor_id}")

    orcid_policy = owner_review.get("advisor_orcid_release", {}).get(advisor_id)
    if not isinstance(orcid_policy, dict):
        raise ValueError(f"V107_ORCID_POLICY_MISSING:{advisor_id}")

    projected_public = deepcopy(public)
    projected_manifest = deepcopy(manifest)
    projected_identity = deepcopy(identity)
    projected_public["schema_version"] = "1.0.7"
    projected_public["version"] = "1.0.7"
    projected_public["publication_status"] = "approved"
    _activate_scoped_release_wording(projected_public)
    projected_manifest["schema_version"] = "1.0.7"
    projected_identity["schema_version"] = "1.0.7"
    projected_identity["advisor_identity"]["orcid_release_classification"] = orcid_policy["classification"]
    projected_identity["advisor_identity"]["conflicting_orcid_candidates"] = list(orcid_policy["conflicting_orcid_candidates"])
    unresolved_values = set(orcid_policy["conflicting_orcid_candidates"])
    if orcid_policy["classification"] == "optional_identifier_unresolved" and projected_identity["advisor_identity"].get("candidate_orcid"):
        unresolved_values.add(projected_identity["advisor_identity"]["candidate_orcid"])
    projected_manifest = _redact_unresolved_orcid_values(projected_manifest, unresolved_values)
    projected_identity["owner_release_review"] = {
        key: deepcopy(owner_review[key]) for key in OWNER_REVIEW_FIELDS
    }
    return projected_public, projected_manifest, projected_identity


def project_and_validate_package_v107(
    public: dict[str, Any],
    manifest: dict[str, Any],
    identity: dict[str, Any],
    owner_review: dict[str, Any],
) -> dict[str, Any]:
    projected_public, projected_manifest, projected_identity = project_package_v107(
        public, manifest, identity, owner_review
    )
    report = validate_package(
        projected_public,
        projected_manifest,
        projected_identity,
        contract_version="1.0.7",
    )
    return {
        "public": projected_public,
        "manifest": projected_manifest,
        "identity": projected_identity,
        "validation": report,
        "markdown": render_markdown(projected_public, projected_manifest),
    }


def load_and_project_cohort8() -> list[dict[str, Any]]:
    owner_review = load_owner_scoped_review()
    results: list[dict[str, Any]] = []
    for advisor_id in COHORT8_ADVISOR_IDS:
        package_root = REPO_ROOT / "data" / "advisors-v1" / advisor_id
        documents = [
            json.loads((package_root / filename).read_text(encoding="utf-8"))
            for filename in ("public-advisor-v1.json", "evidence-manifest-v1.json", "identity-review-v1.json")
        ]
        projected = project_and_validate_package_v107(*documents, owner_review)
        projected["advisor_id"] = advisor_id
        results.append(projected)
    return results
