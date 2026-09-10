from __future__ import annotations

import json
import unittest
from pathlib import Path

from src.advisor_production.validator import validate_package
from tests.test_advisor_production_v104 import (
    complete_identity_review as complete_identity_review_v104,
    complete_manifest as complete_manifest_v104,
    complete_public_record as complete_public_record_v104,
)


ROOT = Path(__file__).resolve().parents[1]


def error_codes(report: dict) -> set[str]:
    return {item["code"] for item in report["errors"]}


def load_v105(advisor_id: str) -> tuple[dict, dict, dict]:
    package = ROOT / "data" / "advisors-v1" / advisor_id
    return tuple(
        json.loads((package / filename).read_text(encoding="utf-8"))
        for filename in ("public-advisor-v1.json", "evidence-manifest-v1.json", "identity-review-v1.json")
    )


def legacy_v104_fixture() -> tuple[dict, dict, dict]:
    return complete_public_record_v104(), complete_manifest_v104(), complete_identity_review_v104()


def clear_publication_orcids(identity: dict) -> None:
    for record in identity["publication_identity"]:
        record["matched_orcid"] = None
        record["orcid_source_url"] = None


class V105RepairRegressionTests(unittest.TestCase):
    def test_legacy_v104_path_accepts_missing_claim_url_but_v105_fails(self):
        public, manifest, identity = legacy_v104_fixture()
        public["research_directions_original"][0]["source_urls"] = []
        legacy_report = validate_package(public, manifest, identity, contract_version="1.0.4")
        self.assertTrue(legacy_report["valid"], legacy_report)

        public, manifest, identity = load_v105("chen-guodong")
        public["research_questions"][0]["source_urls"].pop()
        repaired_report = validate_package(public, manifest, identity)
        self.assertIn("EVIDENCE_URL_CLOSURE_MISMATCH", error_codes(repaired_report))

    def test_legacy_v104_path_accepts_extra_claim_url_but_v105_fails(self):
        public, manifest, identity = legacy_v104_fixture()
        public["research_directions_original"][0]["source_urls"].append("https://example.test/unbound")
        legacy_report = validate_package(public, manifest, identity, contract_version="1.0.4")
        self.assertTrue(legacy_report["valid"], legacy_report)

        public, manifest, identity = load_v105("chen-huiyong")
        public["research_questions"][0]["source_urls"].append("https://example.test/unbound")
        repaired_report = validate_package(public, manifest, identity)
        self.assertIn("EVIDENCE_URL_CLOSURE_MISMATCH", error_codes(repaired_report))

    def test_legacy_v104_path_ignores_source_ref_mismatch_but_v105_fails(self):
        public, manifest, identity = legacy_v104_fixture()
        public["name_en"]["source_ref"] = "evidence-manifest-v1.json#E2"
        public["name_en"]["source_url"] = "https://doi.org/10.1234/test.1"
        legacy_report = validate_package(public, manifest, identity, contract_version="1.0.4")
        self.assertTrue(legacy_report["valid"], legacy_report)

        public, manifest, identity = load_v105("chen-chao")
        public["name_en"]["source_ref"] = "evidence-manifest-v1.json#E2"
        repaired_report = validate_package(public, manifest, identity)
        self.assertIn("SOURCED_VALUE_URL_MISMATCH", error_codes(repaired_report))

    def test_official_external_link_exception_is_recorded_and_passes(self):
        public, manifest, identity = load_v105("chen-chao")
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)
        self.assertNotIn("OFFICIAL_EXTERNAL_LINK_UNRECORDED", error_codes(report))

    def test_publication_time_affiliation_cannot_be_current_institution(self):
        public, manifest, identity = load_v105("chen-guodong")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E2")
        record["matched_institution"] = "Central South University"
        report = validate_package(public, manifest, identity)
        self.assertIn("PUBLICATION_AFFILIATION_MISMATCH", error_codes(report))

        public, manifest, identity = load_v105("chen-guodong")
        self.assertTrue(validate_package(public, manifest, identity)["valid"])

    def test_same_name_orcid_without_cross_record_chain_is_not_verified(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"]["orcid_verification_evidence_ids"] = []
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_CHAIN_INCOMPLETE", error_codes(report))

        public, manifest, identity = load_v105("chen-guodong")
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)

    def test_non_chain_publication_without_orcid_is_allowed(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"]["orcid_verification_evidence_ids"] = ["E3", "E4"]
        non_chain = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E2")
        non_chain["matched_orcid"] = None
        non_chain["orcid_source_url"] = None
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)

    def test_non_chain_publication_rejects_conflicting_orcid(self):
        public, manifest, identity = load_v105("chen-guodong")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E2")
        record["matched_orcid"] = "0000-0000-0000-0001"
        record["orcid_source_url"] = next(item["source_url"] for item in manifest["candidate_evidence"] if item["evidence_id"] == "E2")
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_RECORD_MISMATCH", error_codes(report))

    def test_non_chain_publication_rejects_orcid_without_source(self):
        public, manifest, identity = load_v105("chen-guodong")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E2")
        record["matched_orcid"] = identity["advisor_identity"]["candidate_orcid"]
        record["orcid_source_url"] = None
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_SOURCE_MISSING", error_codes(report))

    def test_non_chain_publication_rejects_wrong_orcid_source(self):
        public, manifest, identity = load_v105("chen-guodong")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E2")
        record["matched_orcid"] = identity["advisor_identity"]["candidate_orcid"]
        record["orcid_source_url"] = "https://example.test/not-the-paper"
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_SOURCE_MISMATCH", error_codes(report))

    def test_unresolved_publication_orcid_pairing_is_still_fail_closed(self):
        public, manifest, identity = load_v105("chen-guodong")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E2")
        record["identity_status"] = "unresolved"
        record["matched_orcid"] = None
        record["orcid_source_url"] = next(item["source_url"] for item in manifest["candidate_evidence"] if item["evidence_id"] == "E2")
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_SOURCE_WITHOUT_VALUE", error_codes(report))

    def test_candidate_null_with_publication_orcid_fails(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"].update(orcid_status="unresolved", candidate_orcid=None, orcid_verification_evidence_ids=[])
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_CANDIDATE_MISSING", error_codes(report))

    def test_not_found_rejects_publication_orcid(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"].update(orcid_status="not_found", candidate_orcid=None, orcid_verification_evidence_ids=[])
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_STATUS_PUBLICATION_CONFLICT", error_codes(report))

    def test_not_found_rejects_non_empty_chain(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"].update(orcid_status="not_found", candidate_orcid=None)
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_STATUS_CHAIN_CONFLICT", error_codes(report))

    def test_not_found_with_empty_publication_orcids_is_valid_but_pending(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"].update(orcid_status="not_found", candidate_orcid=None, orcid_verification_evidence_ids=[])
        clear_publication_orcids(identity)
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)
        self.assertFalse(report["release_eligible"])
        self.assertEqual(report["effective_publication_status"], "review_pending")

    def test_unresolved_with_null_candidate_and_empty_orcids_is_valid_but_pending(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"].update(orcid_status="unresolved", candidate_orcid=None, orcid_verification_evidence_ids=[])
        clear_publication_orcids(identity)
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)
        self.assertFalse(report["release_eligible"])
        self.assertEqual(report["effective_publication_status"], "review_pending")

    def test_unresolved_with_candidate_and_consistent_orcids_is_valid_but_pending(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"].update(orcid_status="unresolved", orcid_verification_evidence_ids=[])
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)
        self.assertFalse(report["release_eligible"])
        self.assertEqual(report["effective_publication_status"], "review_pending")

    def test_verified_requires_candidate_orcid(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"]["candidate_orcid"] = None
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_VERIFIED_CANDIDATE_MISSING", error_codes(report))

    def test_orcid_chain_rejects_wrong_provenance_url(self):
        public, manifest, identity = load_v105("chen-guodong")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E3")
        record["orcid_source_url"] = "https://example.test/not-the-paper"
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_SOURCE_MISMATCH", error_codes(report))

    def test_orcid_chain_rejects_missing_provenance_url(self):
        public, manifest, identity = load_v105("chen-guodong")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E3")
        record["orcid_source_url"] = None
        report = validate_package(public, manifest, identity)
        self.assertIn("ORCID_SOURCE_MISSING", error_codes(report))

    def test_publication_email_rejects_wrong_provenance_url(self):
        public, manifest, identity = load_v105("chen-guodong")
        record = next(item for item in identity["publication_identity"] if item["evidence_id"] == "E6")
        record["matched_author_email_source_url"] = "https://example.test/not-the-paper"
        report = validate_package(public, manifest, identity)
        self.assertIn("PUBLICATION_EMAIL_SOURCE_MISMATCH", error_codes(report))

    def test_official_email_rejects_wrong_provenance_url(self):
        public, manifest, identity = load_v105("chen-guodong")
        identity["advisor_identity"]["official_profile_email_source_url"] = "https://example.test/not-the-profile"
        report = validate_package(public, manifest, identity)
        self.assertIn("OFFICIAL_PROFILE_EMAIL_SOURCE_MISMATCH", error_codes(report))

    def test_meta_analysis_must_not_be_written_as_review(self):
        public, manifest, identity = load_v105("chen-huiyong")
        item = next(item for item in manifest["candidate_evidence"] if item["evidence_id"] == "E4")
        item["source_type"] = "review"
        report = validate_package(public, manifest, identity)
        self.assertIn("SOURCE_TYPE_META_ANALYSIS_MISMATCH", error_codes(report))

        public, manifest, identity = load_v105("chen-huiyong")
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)

    def test_preprint_and_formal_version_group_cannot_both_be_adopted(self):
        public, manifest, identity = load_v105("chen-chao")
        preprint = next(item for item in manifest["candidate_evidence"] if item["evidence_id"] == "E7")
        preprint["candidate_statuses"] = ["adopted"]
        report = validate_package(public, manifest, identity)
        self.assertIn("DUPLICATE_PUBLICATION_VERSION", error_codes(report))

    def test_pending_human_review_keeps_release_ineligible(self):
        public, manifest, identity = load_v105("chen-huiyong")
        report = validate_package(public, manifest, identity)
        self.assertTrue(report["valid"], report)
        self.assertFalse(report["release_eligible"])
        self.assertEqual(report["effective_publication_status"], "review_pending")


if __name__ == "__main__":
    unittest.main()
