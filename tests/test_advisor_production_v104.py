from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from src.advisor_production.renderer import render_markdown
from src.advisor_production.validator import validate_package
from tests.test_advisor_production import (
    complete_identity_review as complete_identity_review_v103,
    complete_manifest as complete_manifest_v103,
    complete_public_record as complete_public_record_v103,
)


def complete_public_record() -> dict:
    public = complete_public_record_v103()
    public["schema_version"] = "1.0.4"
    public["version"] = "1.0.4"
    public["research_directions_original"] = [{
        "text": "学院官方主页显示研究方向包括疾病遗传学。",
        "evidence_status": "verified",
        "confidence": "High",
        "source_urls": ["https://faculty.test.edu.cn/profile"],
        "evidence_ids": ["E2"],
        "evidence_lane": "public_fact",
        "no_evidence_reason": None,
    }]
    public["main_techniques"][0]["evidence_lane"] = "ai_synthesis"
    public["prerequisite_skills"][0]["text"] = "基于公开证据，可能需要基础遗传学与文献阅读。"
    public["adopted_public_evidence_ids"] = ["E1", "E2"]

    def normalize_ai_synthesis(value: object) -> None:
        if isinstance(value, dict):
            if value.get("evidence_lane") == "ai_synthesis" and value.get("evidence_status") == "verified":
                value["evidence_status"] = "partially_verified"
            for child in value.values():
                normalize_ai_synthesis(child)
        elif isinstance(value, list):
            for child in value:
                normalize_ai_synthesis(child)

    normalize_ai_synthesis(public)
    return public


def publication_evidence() -> dict:
    item = complete_manifest_v103()["candidate_evidence"][0]
    item.update({
        "source_authority": "researcher_api",
        "last_verified_at": "2026-08-01",
        "notes": "测试论文证据。",
    })
    return item


def official_profile_evidence(evidence_id: str = "E2") -> dict:
    return {
        "evidence_id": evidence_id,
        "evidence_type": "official_profile",
        "source_url": "https://faculty.test.edu.cn/profile",
        "source_authority": "official_institution",
        "candidate_statuses": ["adopted"],
        "reason": None,
        "supported_fields": ["research_directions_original"],
        "repository_source_ref": "tests/fixtures/official-profile.html",
        "last_verified_at": "2026-08-01",
        "notes": "学院官方主页。",
        "page_title": "测试导师个人主页",
        "profile_name": "测试导师",
        "institution": "测试大学",
        "school_or_department": "生命科学学院",
        "extracted_facts": [{
            "fact_id": "F1",
            "fact_text": "研究方向包括疾病遗传学。",
            "fact_category": "research_direction",
            "source_anchor": "研究方向",
            "supported_public_fields": ["research_directions_original"],
        }],
    }


def complete_manifest() -> dict:
    return {
        "schema_version": "1.0.4",
        "advisor_id": "test-advisor",
        "candidate_evidence": [publication_evidence(), official_profile_evidence()],
    }


def publication_identity() -> dict:
    return {
        "evidence_id": "E1",
        "identity_status": "verified",
        "verification_basis": ["题名、DOI、作者与机构一致。"],
        "matched_author_name": "Test Advisor",
        "matched_institution": "Test University",
        "matched_orcid": "0000-0000-0000-0001",
        "notes": "测试论文身份。",
    }


def official_source_identity(evidence_id: str = "E2") -> dict:
    return {
        "evidence_id": evidence_id,
        "identity_status": "verified",
        "official_domain_status": "verified",
        "profile_name_match_status": "verified",
        "institution_match_status": "verified",
        "reviewed_at": "2026-08-01",
        "notes": "官方域名、姓名与机构一致。",
    }


def complete_identity_review() -> dict:
    identity = complete_identity_review_v103()
    identity["schema_version"] = "1.0.4"
    identity["reviewed_at"] = "2026-08-01"
    identity["reviewer_role"] = "user"
    identity["advisor_identity"].update({
        "school_or_department_match_status": "verified",
        "official_profile_match_status": "verified",
        "official_profile_url": "https://faculty.test.edu.cn/profile",
        "human_review_status": "verified",
    })
    identity["publication_identity"] = [publication_identity()]
    identity["official_source_identity"] = [official_source_identity()]
    return identity


def error_codes(report: dict) -> set[str]:
    return {item["code"] for item in report["errors"]}


def load_advisor_package(advisor_id: str) -> tuple[dict, dict, dict]:
    root = Path(__file__).resolve().parents[1] / "data" / "advisors-v1" / advisor_id
    return tuple(
        json.loads((root / name).read_text(encoding="utf-8"))
        for name in ("public-advisor-v1.json", "evidence-manifest-v1.json", "identity-review-v1.json")
    )


class TypedEvidenceContractV104Tests(unittest.TestCase):
    def test_01_official_profile_does_not_require_publication_year(self):
        self.assertTrue(validate_package(complete_public_record(), complete_manifest(), complete_identity_review())["valid"])

    def test_02_official_profile_does_not_require_doi(self):
        self.assertNotIn("doi", complete_manifest()["candidate_evidence"][1])
        self.assertTrue(validate_package(complete_public_record(), complete_manifest(), complete_identity_review())["valid"])

    def test_03_official_profile_does_not_require_author_position(self):
        self.assertNotIn("author_position", complete_manifest()["candidate_evidence"][1])
        self.assertTrue(validate_package(complete_public_record(), complete_manifest(), complete_identity_review())["valid"])

    def test_04_official_profile_rejects_publication_only_fields(self):
        manifest = complete_manifest()
        manifest["candidate_evidence"][1]["doi"] = "10.1234/not-allowed"
        self.assertIn("SCHEMA_ONE_OF", error_codes(validate_package(complete_public_record(), manifest, complete_identity_review())))

    def test_05_publication_requires_publication_only_fields(self):
        manifest = complete_manifest()
        del manifest["candidate_evidence"][0]["author_position"]
        self.assertIn("SCHEMA_ONE_OF", error_codes(validate_package(complete_public_record(), manifest, complete_identity_review())))

    def test_06_publication_identity_does_not_cover_official_profile(self):
        identity = complete_identity_review()
        self.assertEqual(["E1"], [item["evidence_id"] for item in identity["publication_identity"]])
        self.assertTrue(validate_package(complete_public_record(), complete_manifest(), identity)["valid"])

    def test_07_official_source_identity_must_cover_official_profile(self):
        identity = complete_identity_review()
        identity["official_source_identity"] = []
        self.assertIn("OFFICIAL_SOURCE_IDENTITY_MISMATCH", error_codes(validate_package(complete_public_record(), complete_manifest(), identity)))

    def test_08_official_profile_can_support_public_fact(self):
        report = validate_package(complete_public_record(), complete_manifest(), complete_identity_review())
        self.assertTrue(report["valid"], report)

    def test_09_researcher_api_alone_cannot_support_public_fact(self):
        public = complete_public_record()
        public["research_directions_original"][0]["evidence_ids"] = ["E1"]
        public["adopted_public_evidence_ids"] = ["E1"]
        self.assertIn("PUBLIC_FACT_SOURCE_NOT_ALLOWED", error_codes(validate_package(public, complete_manifest(), complete_identity_review())))

    def test_10_featured_cannot_reference_official_profile(self):
        public = complete_public_record()
        public["featured_publication_evidence_ids"] = ["E2"]
        self.assertIn("FEATURED_NON_PUBLICATION", error_codes(validate_package(public, complete_manifest(), complete_identity_review())))

    def test_11_non_publication_evidence_does_not_participate_in_doi_dedup(self):
        manifest = complete_manifest()
        second = official_profile_evidence("E3")
        second["page_title"] = "10.1234/test.1"
        second["candidate_statuses"] = ["candidate"]
        manifest["candidate_evidence"].append(second)
        identity = complete_identity_review()
        identity["official_source_identity"].append(official_source_identity("E3"))
        self.assertNotIn("DUPLICATE_DOI", error_codes(validate_package(complete_public_record(), manifest, identity)))

    def test_12_non_publication_evidence_does_not_participate_in_version_checks(self):
        manifest = complete_manifest()
        second = official_profile_evidence("E3")
        second["page_title"] = "A verified publication title (preprint)"
        second["candidate_statuses"] = ["candidate"]
        manifest["candidate_evidence"].append(second)
        identity = complete_identity_review()
        identity["official_source_identity"].append(official_source_identity("E3"))
        self.assertNotIn("UNLINKED_PUBLICATION_VERSION", error_codes(validate_package(complete_public_record(), manifest, identity)))

    def test_13_unmatched_official_domain_cannot_be_adopted(self):
        identity = complete_identity_review()
        identity["official_source_identity"][0]["official_domain_status"] = "conflict"
        self.assertIn("OFFICIAL_SOURCE_NOT_ADOPTABLE", error_codes(validate_package(complete_public_record(), complete_manifest(), identity)))

    def test_14_unmatched_official_profile_name_cannot_be_adopted(self):
        identity = complete_identity_review()
        identity["official_source_identity"][0]["profile_name_match_status"] = "conflict"
        self.assertIn("OFFICIAL_SOURCE_NOT_ADOPTABLE", error_codes(validate_package(complete_public_record(), complete_manifest(), identity)))

    def test_15_markdown_labels_official_fact_as_public_fact(self):
        markdown = render_markdown(complete_public_record(), complete_manifest())
        self.assertIn("公开事实", markdown)

    def test_16_publication_table_excludes_official_profile(self):
        markdown = render_markdown(complete_public_record(), complete_manifest())
        self.assertNotIn("测试导师个人主页", markdown)

    def test_17_chapter_twelve_has_typed_counts(self):
        markdown = render_markdown(complete_public_record(), complete_manifest())
        self.assertIn("官方主页证据数：1", markdown)
        self.assertIn("论文候选证据数：1", markdown)
        self.assertIn("已采用官方证据数：1", markdown)
        self.assertIn("已采用论文证据数：1", markdown)

    def test_18_mixed_evidence_markdown_is_byte_deterministic(self):
        first = render_markdown(complete_public_record(), complete_manifest())
        second = render_markdown(complete_public_record(), complete_manifest())
        self.assertEqual(first.encode("utf-8"), second.encode("utf-8"))

    def test_19_v103_is_not_silently_accepted_as_v104(self):
        report = validate_package(
            complete_public_record_v103(),
            complete_manifest_v103(),
            complete_identity_review_v103(),
            contract_version="1.0.4",
        )
        self.assertFalse(report["valid"])
        self.assertIn("CONTRACT_VERSION_MISMATCH", error_codes(report))

    def test_20_human_identity_release_gate_remains_effective(self):
        identity = complete_identity_review()
        identity["reviewer_role"] = "codex_mechanical_migration"
        report = validate_package(complete_public_record(), complete_manifest(), identity)
        self.assertFalse(report["release_eligible"])
        self.assertIn("IDENTITY_HUMAN_REVIEW_REQUIRED", error_codes(report))

    def test_21_all_v104_schema_enums_have_chinese_display_labels(self):
        root = Path(__file__).resolve().parents[1] / "docs" / "advisor-template-v1"

        def enum_values(value: object) -> set[str]:
            found: set[str] = set()
            if isinstance(value, dict):
                if isinstance(value.get("enum"), list):
                    found.update(item for item in value["enum"] if isinstance(item, str))
                for child in value.values():
                    found.update(enum_values(child))
            elif isinstance(value, list):
                for child in value:
                    found.update(enum_values(child))
            return found

        values: set[str] = set()
        for name in ("public-advisor-schema-v1.0.4.json", "evidence-manifest-schema-v1.0.4.json", "identity-review-schema-v1.0.4.json"):
            values.update(enum_values(json.loads((root / name).read_text(encoding="utf-8"))))
        labels = json.loads((root / "display-label-mapping-v1.0.4.json").read_text(encoding="utf-8"))["enum_labels"]
        self.assertEqual(sorted(values - labels.keys()), [])
        self.assertEqual(sorted(value for value in values if labels.get(value) == value), [])

    def test_22_ai_synthesis_requires_conditional_wording(self):
        public = complete_public_record()
        public["summary"]["text"] = "实验室为本科生安排固定项目。"
        self.assertIn("AI_SYNTHESIS_NOT_CONDITIONAL", error_codes(validate_package(public, complete_manifest(), complete_identity_review())))

    def test_23_ai_synthesis_cannot_be_verified(self):
        public = complete_public_record()
        public["summary"]["evidence_status"] = "verified"
        self.assertIn("AI_SYNTHESIS_STATUS_INVALID", error_codes(validate_package(public, complete_manifest(), complete_identity_review())))

    def test_24_ai_synthesis_can_be_partially_verified(self):
        report = validate_package(complete_public_record(), complete_manifest(), complete_identity_review())
        self.assertNotIn("AI_SYNTHESIS_STATUS_INVALID", error_codes(report))
        self.assertTrue(report["valid"], report)

    def test_25_public_fact_can_remain_verified(self):
        public = complete_public_record()
        self.assertEqual("verified", public["research_directions_original"][0]["evidence_status"])
        report = validate_package(public, complete_manifest(), complete_identity_review())
        self.assertNotIn("AI_SYNTHESIS_STATUS_INVALID", error_codes(report))
        self.assertTrue(report["valid"], report)

    def test_26_existing_whitelist_approved_packages_remain_valid(self):
        # Local-review cohort only ships 13 advisors; do not require out-of-cohort packs.
        for advisor_id in ("chen-miao", "xiang-rong", "zhao-yuetao"):
            with self.subTest(advisor_id=advisor_id):
                public, manifest, identity = load_advisor_package(advisor_id)
                report = validate_package(public, manifest, identity)
                self.assertTrue(report["valid"], report)

    def test_27_corrected_guo_hui_package_is_valid(self):
        public, manifest, identity = load_advisor_package("guo-hui")
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)

    def test_28_local_review_pending_packages_remain_review_pending(self):
        for advisor_id in ("guo-hui", "hu-zhengmao"):
            with self.subTest(advisor_id=advisor_id):
                public, manifest, identity = load_advisor_package(advisor_id)
                report = validate_package(public, manifest, identity)
                self.assertFalse(report["release_eligible"], report)
                self.assertEqual("review_pending", report["effective_publication_status"])

    def test_29_guo_hui_markdown_is_byte_deterministic(self):
        public, manifest, _identity = load_advisor_package("guo-hui")
        first = render_markdown(public, manifest)
        second = render_markdown(public, manifest)
        self.assertEqual(first.encode("utf-8"), second.encode("utf-8"))

    def test_30_guo_hui_human_identity_remains_pending(self):
        _public, _manifest, identity = load_advisor_package("guo-hui")
        self.assertEqual("verified", identity["review_status"])
        self.assertEqual("pending", identity["advisor_identity"]["human_review_status"])
        self.assertEqual("verified", identity["advisor_identity"]["orcid_status"])
        self.assertEqual("0000-0002-1570-2545", identity["advisor_identity"]["candidate_orcid"])

    def test_31_guo_hui_featured_selection_is_pending(self):
        public, manifest, _identity = load_advisor_package("guo-hui")
        featured = public["featured_publication_evidence_ids"]
        self.assertEqual([], featured)
        self.assertEqual("pending_manual_review", public["featured_selection_status"])
        self.assertTrue(set(featured).issubset(public["adopted_public_evidence_ids"]))
        evidence_types = {item["evidence_id"]: item["evidence_type"] for item in manifest["candidate_evidence"]}
        self.assertEqual(6, public.get("schema_version") and len(public["adopted_public_evidence_ids"]))
        self.assertTrue(all(evidence_types[eid] in {"publication", "official_profile"} for eid in public["adopted_public_evidence_ids"]))


if __name__ == "__main__":
    unittest.main()
