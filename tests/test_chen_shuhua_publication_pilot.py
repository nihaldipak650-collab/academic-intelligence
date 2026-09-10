import json
import unittest
from pathlib import Path

from src.advisor_production.renderer import render_markdown
from src.advisor_production.validator import validate_package


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "data" / "advisors-v1" / "chen-shuhua"


class ChenShuhuaPublicationPilotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.public = json.loads((PACKAGE / "public-advisor-v1.json").read_text(encoding="utf-8"))
        cls.manifest = json.loads((PACKAGE / "evidence-manifest-v1.json").read_text(encoding="utf-8"))
        cls.identity = json.loads((PACKAGE / "identity-review-v1.json").read_text(encoding="utf-8"))

    def test_pilot_decision_matrix_is_preserved(self):
        publications = [item for item in self.manifest["candidate_evidence"] if item["evidence_type"] == "publication"]
        self.assertEqual(22, len(publications))
        self.assertEqual(6, sum("adopted" in item["candidate_statuses"] for item in publications))
        self.assertEqual(13, sum(item["candidate_statuses"] == ["candidate"] and item["identity_verified"] for item in publications))
        self.assertEqual(2, sum("excluded" in item["candidate_statuses"] for item in publications))
        self.assertEqual(1, sum(item["candidate_statuses"] == ["identity_pending"] for item in publications))

    def test_orcid_chain_is_two_record_and_source_closed(self):
        advisor = self.identity["advisor_identity"]
        self.assertEqual("verified", advisor["orcid_status"])
        self.assertEqual("0000-0003-2373-3402", advisor["candidate_orcid"])
        self.assertEqual(["E2", "E7"], advisor["orcid_verification_evidence_ids"])
        by_id = {item["evidence_id"]: item for item in self.manifest["candidate_evidence"]}
        identity_by_id = {item["evidence_id"]: item for item in self.identity["publication_identity"]}
        for evidence_id in advisor["orcid_verification_evidence_ids"]:
            self.assertEqual(by_id[evidence_id]["source_url"], identity_by_id[evidence_id]["orcid_source_url"])

    def test_rejected_and_unresolved_are_not_adopted(self):
        self.assertTrue({"E21", "E22", "E23"}.isdisjoint(self.public["adopted_public_evidence_ids"]))
        identity_by_id = {item["evidence_id"]: item for item in self.identity["publication_identity"]}
        self.assertEqual("conflict", identity_by_id["E21"]["identity_status"])
        self.assertEqual("conflict", identity_by_id["E22"]["identity_status"])
        self.assertEqual("unresolved", identity_by_id["E23"]["identity_status"])

    def test_owner_featured_writeback_and_release_gate(self):
        self.assertEqual(["E2", "E3", "E5", "E7"], self.public["featured_publication_evidence_ids"])
        self.assertEqual("manually_reviewed", self.public["featured_selection_status"])
        self.assertEqual("approved", self.public["featured_selection_review"]["status"])
        self.assertEqual("user", self.public["featured_selection_review"]["reviewer_role"])
        self.assertEqual("pending", self.identity["advisor_identity"]["human_review_status"])
        self.assertEqual("review_pending", self.public["publication_status"])
        report = validate_package(self.public, self.manifest, self.identity, package_dir=PACKAGE)
        self.assertTrue(report["valid"])
        self.assertFalse(report["release_eligible"])

    def test_renderer_is_deterministic_and_renders_only_owner_featured(self):
        first = render_markdown(self.public, self.manifest)
        second = render_markdown(self.public, self.manifest)
        self.assertEqual(first.encode("utf-8"), second.encode("utf-8"))
        featured_section = first.split("## 7. 代表性论文", 1)[1].split("## 8.", 1)[0]
        for evidence_id in ("E2", "E3", "E5", "E7"):
            self.assertIn(f"| {evidence_id} |", featured_section)
        self.assertNotIn("| E4 |", featured_section)
        self.assertNotIn("| E6 |", featured_section)
        self.assertNotIn("人工已批准", first)


if __name__ == "__main__":
    unittest.main()
