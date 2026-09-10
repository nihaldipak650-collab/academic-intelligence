from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from src.advisor_production.renderer import render_markdown
from src.advisor_production.validator import validate_package


ROOT = Path(__file__).resolve().parents[1]


def load_package(advisor_id: str) -> tuple[dict, dict, dict]:
    package = ROOT / "data" / "advisors-v1" / advisor_id
    return tuple(
        json.loads((package / filename).read_text(encoding="utf-8"))
        for filename in ("public-advisor-v1.json", "evidence-manifest-v1.json", "identity-review-v1.json")
    )


def error_codes(report: dict) -> set[str]:
    return {item["code"] for item in report["errors"]}


def upgrade_to_v106(public: dict, manifest: dict, identity: dict) -> tuple[dict, dict, dict]:
    public = copy.deepcopy(public)
    manifest = copy.deepcopy(manifest)
    identity = copy.deepcopy(identity)
    public["schema_version"] = public["version"] = "1.0.6"
    manifest["schema_version"] = identity["schema_version"] = "1.0.6"
    return public, manifest, identity


def zero_publication_fixture() -> tuple[dict, dict, dict]:
    """Return a stable synthetic zero-publication package.

    Chen Shuhua was the original Phase 2 zero-publication fixture, but it is now
    a real enrichment target. Strip publication state explicitly so these
    contract regressions do not depend on an advisor remaining unenriched.
    """
    public, manifest, identity = load_package("chen-shuhua")
    official = next(item for item in manifest["candidate_evidence"] if item["evidence_type"] == "official_profile")
    manifest["candidate_evidence"] = [official]
    manifest["source_scope"] = "Synthetic v1.0.6 zero-publication regression fixture."
    identity["publication_identity"] = []
    identity["advisor_identity"].update(
        orcid_status="unresolved",
        candidate_orcid=None,
        orcid_verification_evidence_ids=[],
        orcid_verification_basis=["Synthetic fixture intentionally has no publication identity chain."],
    )
    identity["p0_blockers"] = [{
        "code": "HUMAN_IDENTITY_REVIEW_PENDING",
        "description": "Synthetic fixture remains pending.",
        "evidence_ids": ["E1"],
    }]
    public["name_en"] = {
        "value": None,
        "value_en": None,
        "source_url": None,
        "source_ref": None,
        "source_authority": None,
        "last_verified_at": None,
        "missing_status": "no_public_information",
    }
    public["adopted_public_evidence_ids"] = ["E1"]
    public["featured_publication_evidence_ids"] = []
    public["featured_selection_status"] = "pending_manual_review"
    public["featured_selection_review"] = {
        "status": "pending",
        "reviewed_at": None,
        "reviewer_role": None,
        "selection_criteria": [],
        "notes": "Synthetic zero-publication fixture has no featured decision.",
    }
    public["publication_identity_status"] = "pending_verification"
    public["publication_status"] = "review_pending"
    public["summary"] = {
        "text": "根据官方主页，可能概括其公开身份与研究方向；本fixture未纳入论文候选。",
        "evidence_status": "partially_verified",
        "confidence": "Medium",
        "source_urls": [official["source_url"]],
        "evidence_ids": ["E1"],
        "evidence_lane": "ai_synthesis",
        "no_evidence_reason": None,
    }

    def bind_claims_to_e1(value):
        if isinstance(value, dict):
            if isinstance(value.get("evidence_ids"), list):
                value["evidence_ids"] = ["E1"]
                if isinstance(value.get("source_urls"), list):
                    value["source_urls"] = [official["source_url"]]
            for child in value.values():
                bind_claims_to_e1(child)
        elif isinstance(value, list):
            for child in value:
                bind_claims_to_e1(child)

    bind_claims_to_e1(public)
    return public, manifest, identity


def add_unresolved_publication_candidate(
    public: dict,
    manifest: dict,
    identity: dict,
    *,
    adopted: bool,
) -> None:
    _, source_manifest, source_identity = load_package("chen-guodong")
    publication = copy.deepcopy(next(item for item in source_manifest["candidate_evidence"] if item["evidence_id"] == "E2"))
    publication["candidate_statuses"] = ["adopted", "identity_pending"] if adopted else ["candidate", "identity_pending"]
    publication["identity_verified"] = False
    publication["supported_fields"] = ["summary"]
    manifest["candidate_evidence"].append(publication)

    record = copy.deepcopy(next(item for item in source_identity["publication_identity"] if item["evidence_id"] == "E2"))
    record["identity_status"] = "unresolved"
    record["matched_orcid"] = None
    record["orcid_source_url"] = None
    identity["publication_identity"].append(record)

    if adopted:
        public["adopted_public_evidence_ids"].append("E2")
        public["summary"]["evidence_ids"].append("E2")
        public["summary"]["source_urls"].append(publication["source_url"])


class V106ZeroPublicationRegressionTests(unittest.TestCase):
    def test_zero_publication_candidate_verified_fails(self):
        public, manifest, identity = zero_publication_fixture()
        public["publication_identity_status"] = "verified"
        report = validate_package(public, manifest, identity)
        self.assertIn("ZERO_PUBLICATION_IDENTITY_STATUS_CONTRADICTION", error_codes(report))

    def test_zero_publication_candidate_pending_passes_but_stays_non_release(self):
        public, manifest, identity = zero_publication_fixture()
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)
        self.assertFalse(report["release_eligible"])
        self.assertEqual("review_pending", report["effective_publication_status"])

    def test_zero_publication_pending_is_a_release_gate_even_after_human_identity_review(self):
        public, manifest, identity = zero_publication_fixture()
        public["publication_status"] = "approved"
        identity["review_status"] = "verified"
        identity["reviewed_at"] = "2026-09-09"
        identity["reviewer_role"] = "human_reviewer"
        identity["advisor_identity"].update(
            orcid_status="not_found",
            human_review_status="verified",
        )
        identity["p0_blockers"] = []
        report = validate_package(public, manifest, identity)
        self.assertFalse(report["release_eligible"])
        self.assertEqual("review_pending", report["effective_publication_status"])
        self.assertIn("PUBLICATION_STATUS_NOT_ALLOWED", error_codes(report))

    def test_zero_publication_renderer_is_explicit_and_not_overconfident(self):
        public, manifest, _ = zero_publication_fixture()
        rendered = render_markdown(public, manifest)
        self.assertIn("当前未纳入论文候选证据，代表论文及作者身份尚待检索与核验。", rendered)
        self.assertIn("| 导师论文归属 | 待核验 |", rendered)
        self.assertIn("- 论文身份核验状态：待核验", rendered)
        self.assertNotIn("导师论文归属 | 已核验", rendered)
        self.assertNotIn("论文身份核验状态：已核验", rendered)
        self.assertNotIn("完整候选证据已保存在内部证据清单中", rendered)

    def test_publication_candidates_but_zero_adopted_verified_fails(self):
        public, manifest, identity = zero_publication_fixture()
        add_unresolved_publication_candidate(public, manifest, identity, adopted=False)
        public["publication_identity_status"] = "verified"
        report = validate_package(public, manifest, identity)
        self.assertIn("ZERO_PUBLICATION_IDENTITY_STATUS_CONTRADICTION", error_codes(report))

    def test_publication_candidate_count_is_rendered_without_completeness_claim(self):
        public, manifest, identity = zero_publication_fixture()
        add_unresolved_publication_candidate(public, manifest, identity, adopted=False)
        rendered = render_markdown(public, manifest)
        self.assertIn("已保存 1 条论文候选证据，代表性论文尚待人工筛选。", rendered)
        self.assertNotIn("完整候选证据", rendered)

    def test_adopted_publication_none_verified_requires_pending(self):
        public, manifest, identity = zero_publication_fixture()
        add_unresolved_publication_candidate(public, manifest, identity, adopted=True)
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)
        public["publication_identity_status"] = "verified"
        self.assertIn("PUBLIC_IDENTITY_STATUS_INVALID", error_codes(validate_package(public, manifest, identity)))

    def test_partially_verified_truth_table(self):
        public, manifest, identity = load_package("chen-guodong")
        public, manifest, identity = upgrade_to_v106(public, manifest, identity)
        item = next(item for item in manifest["candidate_evidence"] if item["evidence_id"] == "E2")
        item["identity_verified"] = False
        item["candidate_statuses"].append("identity_pending")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E2")
        record["identity_status"] = "unresolved"
        public["publication_identity_status"] = "partially_verified"
        self.assertTrue(validate_package(public, manifest, identity)["valid"])
        public["publication_identity_status"] = "verified"
        self.assertIn("PUBLIC_IDENTITY_STATUS_INVALID", error_codes(validate_package(public, manifest, identity)))

    def test_fully_verified_publication_package_passes(self):
        public, manifest, identity = load_package("chen-guodong")
        public, manifest, identity = upgrade_to_v106(public, manifest, identity)
        self.assertTrue(validate_package(public, manifest, identity)["valid"])

    def test_historical_v105_and_approved_v104_release_gate_are_unchanged(self):
        public, manifest, identity = load_package("chen-guodong")
        self.assertTrue(validate_package(public, manifest, identity)["valid"])
        public, manifest, identity = load_package("xiang-rong")
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)
        self.assertTrue(report["release_eligible"], report)
        self.assertEqual("approved", report["effective_publication_status"])


if __name__ == "__main__":
    unittest.main()
