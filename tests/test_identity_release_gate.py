from __future__ import annotations

import json
import unittest
from pathlib import Path

from src.advisor_production.validator import validate_package
from tests.test_advisor_production import (
    complete_identity_review,
    complete_manifest,
    complete_public_record,
    error_codes,
)


ROOT = Path(__file__).resolve().parents[1]
XIANG_PACKAGE = ROOT / "data" / "advisors-v1" / "xiang-rong"


class AdvisorIdentityReleaseGateTests(unittest.TestCase):
    def validate_identity(self, identity: dict) -> dict:
        return validate_package(
            complete_public_record(),
            complete_manifest(),
            identity,
        )

    def assert_blocked(self, report: dict, expected_code: str) -> None:
        self.assertFalse(report["release_eligible"], report)
        self.assertEqual(report["effective_publication_status"], "review_pending")
        self.assertIn(expected_code, error_codes(report))
        self.assertIn("PUBLICATION_STATUS_NOT_ALLOWED", error_codes(report))

    def test_01_mechanical_migration_cannot_approve_release(self):
        identity = complete_identity_review()
        identity["reviewer_role"] = "codex_mechanical_migration"
        self.assert_blocked(
            self.validate_identity(identity),
            "IDENTITY_HUMAN_REVIEW_REQUIRED",
        )

    def test_02_verified_review_requires_review_date(self):
        identity = complete_identity_review()
        identity["reviewed_at"] = None
        self.assert_blocked(
            self.validate_identity(identity),
            "IDENTITY_REVIEW_DATE_REQUIRED",
        )

    def test_03_name_identity_conflict_blocks_release(self):
        identity = complete_identity_review()
        identity["advisor_identity"]["name_match_status"] = "conflict"
        self.assert_blocked(
            self.validate_identity(identity),
            "ADVISOR_NAME_IDENTITY_UNRESOLVED",
        )

    def test_04_institution_identity_unresolved_blocks_release(self):
        identity = complete_identity_review()
        identity["advisor_identity"]["institution_match_status"] = "unresolved"
        self.assert_blocked(
            self.validate_identity(identity),
            "ADVISOR_INSTITUTION_IDENTITY_UNRESOLVED",
        )

    def test_05_orcid_conflict_blocks_release(self):
        identity = complete_identity_review()
        identity["advisor_identity"]["orcid_status"] = "conflict"
        self.assert_blocked(
            self.validate_identity(identity),
            "ADVISOR_IDENTITY_NOT_RELEASE_READY",
        )

    def test_06_verified_orcid_requires_candidate_orcid(self):
        identity = complete_identity_review()
        identity["advisor_identity"]["candidate_orcid"] = None
        self.assert_blocked(
            self.validate_identity(identity),
            "ORCID_STATUS_INCONSISTENT",
        )

    def test_07_not_found_orcid_requires_null_candidate(self):
        identity = complete_identity_review()
        identity["advisor_identity"]["orcid_status"] = "not_found"
        self.assert_blocked(
            self.validate_identity(identity),
            "ORCID_STATUS_INCONSISTENT",
        )

    def test_08_valid_human_review_remains_release_eligible(self):
        report = self.validate_identity(complete_identity_review())
        self.assertTrue(report["valid"], report)
        self.assertTrue(report["release_eligible"], report)
        self.assertEqual(report["effective_publication_status"], "approved")

    def test_09_xiang_rong_user_approval_is_release_eligible(self):
        public = json.loads((XIANG_PACKAGE / "public-advisor-v1.json").read_text(encoding="utf-8"))
        manifest = json.loads((XIANG_PACKAGE / "evidence-manifest-v1.json").read_text(encoding="utf-8"))
        identity = json.loads((XIANG_PACKAGE / "identity-review-v1.json").read_text(encoding="utf-8"))
        report = validate_package(public, manifest, identity, package_dir=XIANG_PACKAGE)
        self.assertTrue(report["valid"], report)
        self.assertTrue(report["release_eligible"], report)
        self.assertEqual(report["effective_publication_status"], "approved")


if __name__ == "__main__":
    unittest.main()
