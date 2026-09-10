from __future__ import annotations

from copy import deepcopy
import csv
import unittest

from src.advisor_production.release_v107 import (
    COHORT8_ADVISOR_IDS,
    load_and_project_cohort8,
    load_owner_scoped_review,
    project_and_validate_package_v107,
)
from src.advisor_production.validator_v107 import _v107_orcid_issues, validate_package


def error_codes(report: dict) -> set[str]:
    return {item["code"] for item in report["errors"]}


class AdvisorProductionV107Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.owner_review = load_owner_scoped_review()
        cls.items = {item["advisor_id"]: item for item in load_and_project_cohort8()}

    def validate(self, item: dict) -> dict:
        return validate_package(item["public"], item["manifest"], item["identity"], contract_version="1.0.7")

    def test_01_cohort8_calibration_is_release_eligible(self):
        self.assertEqual(tuple(self.items), COHORT8_ADVISOR_IDS)
        for item in self.items.values():
            self.assertTrue(item["validation"]["valid"], item["validation"])
            self.assertTrue(item["validation"]["release_eligible"], item["validation"])
            self.assertEqual(item["validation"]["effective_publication_status"], "approved")

    def test_02_single_record_unresolved_orcid_is_optional_open_risk(self):
        for advisor_id in ("fan-liangliang", "jiang-hao"):
            item = self.items[advisor_id]
            identity = item["identity"]["advisor_identity"]
            self.assertEqual(identity["orcid_status"], "unresolved")
            self.assertEqual(identity["orcid_release_classification"], "optional_identifier_unresolved")
            self.assertTrue(item["validation"]["release_eligible"])
            self.assertIn("OPTIONAL_IDENTIFIER_OPEN_RISK", {warning["code"] for warning in item["validation"]["warnings"]})

    def test_03_conflicting_optional_orcids_release_only_without_selected_candidate(self):
        item = deepcopy(self.items["li-jinchen"])
        advisor = item["identity"]["advisor_identity"]
        self.assertIsNone(advisor["candidate_orcid"])
        self.assertEqual(set(advisor["conflicting_orcid_candidates"]), {"0000-0003-3335-9303", "0000-0001-5522-806X"})
        self.assertTrue(self.validate(item)["release_eligible"])
        advisor["candidate_orcid"] = advisor["conflicting_orcid_candidates"][0]
        report = self.validate(item)
        self.assertFalse(report["release_eligible"])
        self.assertIn("ORCID_RELEASE_CLASSIFICATION_INCONSISTENT", error_codes(report))

    def test_04_unresolved_orcid_cannot_be_exposed_as_publicly_verified(self):
        item = deepcopy(self.items["fan-liangliang"])
        item["public"]["summary"]["text"] += f" ORCID {item['identity']['advisor_identity']['candidate_orcid']}"
        report = self.validate(item)
        self.assertFalse(report["release_eligible"])
        self.assertIn("UNRESOLVED_ORCID_PUBLIC_EXPOSURE", error_codes(report))

    def test_05_unresolved_adopted_publication_still_blocks(self):
        item = deepcopy(self.items["chen-shuhua"])
        target = item["public"]["featured_publication_evidence_ids"][0]
        next(record for record in item["identity"]["publication_identity"] if record["evidence_id"] == target)["identity_status"] = "unresolved"
        report = self.validate(item)
        self.assertFalse(report["release_eligible"])
        self.assertIn("PUBLICATION_STATUS_NOT_ALLOWED", error_codes(report))

    def test_05b_unresolved_orcid_cannot_leak_through_public_manifest_notes(self):
        item = deepcopy(self.items["li-jinchen"])
        unresolved = item["identity"]["advisor_identity"]["conflicting_orcid_candidates"][0]
        item["manifest"]["candidate_evidence"][0]["notes"] += f" {unresolved}"
        report = self.validate(item)
        self.assertFalse(report["release_eligible"])
        self.assertIn("UNRESOLVED_ORCID_PUBLIC_EXPOSURE", error_codes(report))

    def test_06_excluded_publication_cannot_support_public_synthesis(self):
        item = deepcopy(self.items["chen-shuhua"])
        item["public"]["summary"]["evidence_ids"].append("E21")
        report = self.validate(item)
        self.assertFalse(report["valid"])
        self.assertIn("ADOPTED_CLAIM_MISMATCH", error_codes(report))

    def test_07_featured_unresolved_publication_still_blocks(self):
        item = deepcopy(self.items["guo-yi"])
        target = item["public"]["featured_publication_evidence_ids"][0]
        next(record for record in item["manifest"]["candidate_evidence"] if record["evidence_id"] == target)["identity_verified"] = False
        report = self.validate(item)
        self.assertFalse(report["release_eligible"])
        self.assertIn("PUBLICATION_STATUS_NOT_ALLOWED", error_codes(report))

    def test_08_missing_owner_scoped_review_blocks(self):
        item = deepcopy(self.items["deng-meichun"])
        item["identity"].pop("owner_release_review")
        report = self.validate(item)
        self.assertFalse(report["release_eligible"])
        self.assertIn("OWNER_SCOPED_RELEASE_REVIEW_REQUIRED", error_codes(report))

    def test_09_scoped_review_does_not_claim_exhaustive_human_approval(self):
        item = self.items["deng-suixin"]
        self.assertFalse(item["identity"]["owner_release_review"]["exhaustive_review"])
        self.assertEqual(item["identity"]["reviewer_role"], "codex_mechanical_migration")
        self.assertEqual(item["identity"]["review_status"], "unresolved")
        self.assertTrue(item["validation"]["release_eligible"])

    def test_10_core_advisor_identity_unresolved_blocks(self):
        item = deepcopy(self.items["duan-ranhui"])
        item["identity"]["advisor_identity"]["institution_match_status"] = "unresolved"
        report = self.validate(item)
        self.assertFalse(report["release_eligible"])
        self.assertIn("ADVISOR_INSTITUTION_IDENTITY_UNRESOLVED", error_codes(report))

    def test_11_verified_orcid_classification_remains_strict(self):
        gates, consistency = _v107_orcid_issues({
            "orcid_status": "verified",
            "orcid_release_classification": "verified_identifier",
            "candidate_orcid": "0000-0003-2373-3402",
            "conflicting_orcid_candidates": [],
        })
        self.assertEqual(gates + consistency, [])

    def test_12_not_found_orcid_classification_remains_strict(self):
        gates, consistency = _v107_orcid_issues({
            "orcid_status": "not_found",
            "orcid_release_classification": "identifier_not_found",
            "candidate_orcid": None,
            "conflicting_orcid_candidates": [],
        })
        self.assertEqual(gates + consistency, [])

    def test_13_publication_ledger_and_featured_totals_are_unchanged(self):
        totals = {"candidate": 0, "adopted": 0, "excluded": 0, "identity_pending": 0, "featured": 0}
        for item in self.items.values():
            publications = [record for record in item["manifest"]["candidate_evidence"] if record["evidence_type"] == "publication"]
            totals["candidate"] += sum("candidate" in record["candidate_statuses"] and "adopted" not in record["candidate_statuses"] and "excluded" not in record["candidate_statuses"] and "identity_pending" not in record["candidate_statuses"] for record in publications)
            totals["adopted"] += sum("adopted" in record["candidate_statuses"] for record in publications)
            totals["excluded"] += sum("excluded" in record["candidate_statuses"] for record in publications)
            totals["identity_pending"] += sum("identity_pending" in record["candidate_statuses"] and "excluded" not in record["candidate_statuses"] for record in publications)
            totals["featured"] += len(item["public"]["featured_publication_evidence_ids"])
        self.assertEqual(totals, {"candidate": 24, "adopted": 54, "excluded": 6, "identity_pending": 6, "featured": 39})

    def test_14_renderer_is_deterministic_for_all_calibration_packages(self):
        for item in self.items.values():
            rerun = project_and_validate_package_v107(
                {**deepcopy(item["public"]), "schema_version": "1.0.6", "version": "1.0.6", "publication_status": "review_pending"},
                {**deepcopy(item["manifest"]), "schema_version": "1.0.6"},
                {key: deepcopy(value) for key, value in item["identity"].items() if key != "owner_release_review"} | {"schema_version": "1.0.6"},
                self.owner_review,
            )
            self.assertEqual(item["markdown"], rerun["markdown"])


if __name__ == "__main__":
    unittest.main()
