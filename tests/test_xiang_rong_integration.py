from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

from src.advisor_production.renderer import render_markdown
from src.advisor_production.validator import validate_package


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "data" / "advisors-v1" / "xiang-rong"


class XiangRongIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.public = json.loads((PACKAGE / "public-advisor-v1.json").read_text(encoding="utf-8"))
        cls.manifest = json.loads((PACKAGE / "evidence-manifest-v1.json").read_text(encoding="utf-8"))
        cls.identity = json.loads((PACKAGE / "identity-review-v1.json").read_text(encoding="utf-8"))
        cls.saved_markdown = (PACKAGE / "public-advisor-v1.md").read_text(encoding="utf-8")
        cls.saved_report = json.loads((PACKAGE / "validation-report-v1.json").read_text(encoding="utf-8"))
        cls.report = validate_package(cls.public, cls.manifest, cls.identity, package_dir=PACKAGE)
        cls.by_id = {item["evidence_id"]: item for item in cls.manifest["candidate_evidence"]}

    def test_01_v104_package_schema_and_bindings_pass(self):
        self.assertEqual(self.public["schema_version"], "1.0.4")
        self.assertEqual(self.manifest["schema_version"], "1.0.4")
        self.assertEqual(self.identity["schema_version"], "1.0.4")
        self.assertTrue(self.report["valid"], self.report)
        self.assertEqual(self.report["schema_and_field_binding_status"], "passed")
        self.assertEqual(set(self.report["schema_results"].values()), {"passed"})

    def test_02_user_approval_makes_public_candidate_release_eligible(self):
        self.assertTrue(self.report["release_eligible"])
        self.assertTrue(self.saved_report["release_eligible"])
        self.assertEqual(self.public["publication_status"], "approved")
        self.assertEqual(self.report["effective_publication_status"], "approved")
        self.assertEqual(self.identity["reviewer_role"], "user")
        self.assertEqual(self.identity["advisor_identity"]["human_review_status"], "verified")

    def test_03_official_profile_and_five_publications_are_adopted(self):
        self.assertEqual(set(self.by_id), {"E1", "E2", "E3", "E4", "E5", "E6"})
        self.assertEqual(self.by_id["E6"]["evidence_type"], "official_profile")
        self.assertEqual(
            {item["evidence_id"] for item in self.manifest["candidate_evidence"] if item["evidence_type"] == "publication"},
            {"E1", "E2", "E3", "E4", "E5"},
        )
        self.assertEqual(set(self.public["adopted_public_evidence_ids"]), set(self.by_id))
        for item in self.manifest["candidate_evidence"]:
            self.assertEqual(item["candidate_statuses"], ["adopted"])

    def test_04_publication_identity_is_exact_and_verified(self):
        publication_ids = {"E1", "E2", "E3", "E4", "E5"}
        self.assertEqual({item["evidence_id"] for item in self.identity["publication_identity"]}, publication_ids)
        self.assertTrue(all(item["identity_status"] == "verified" for item in self.identity["publication_identity"]))
        self.assertTrue(all(self.by_id[evidence_id]["identity_verified"] for evidence_id in publication_ids))
        self.assertEqual(self.public["publication_identity_status"], "verified")

    def test_05_erratum_is_not_double_counted(self):
        dois = {item.get("doi") for item in self.manifest["candidate_evidence"] if item["evidence_type"] == "publication"}
        self.assertIn("10.1002/mco2.226", dois)
        self.assertNotIn("10.1002/mco2.466", dois)
        self.assertEqual(self.report["pending_version_group_count"], 0)

    def test_06_official_identity_is_source_backed(self):
        self.assertEqual(self.public["name_zh"]["value"], "项荣")
        self.assertEqual(self.public["school_or_department"]["value"], "生命科学学院细胞生物学系")
        self.assertEqual(self.public["position"]["value"], "教授")
        self.assertEqual([item["value"] for item in self.public["public_roles"]], ["博士生导师"])
        self.assertEqual(self.identity["advisor_identity"]["orcid_status"], "not_found")
        self.assertIsNone(self.identity["advisor_identity"]["candidate_orcid"])

    def test_07_featured_remains_pending_and_empty(self):
        self.assertEqual(self.public["featured_publication_evidence_ids"], [])
        self.assertEqual(self.public["featured_selection_status"], "pending_manual_review")
        self.assertEqual(self.public["featured_selection_review"]["status"], "pending")

    def test_08_saved_markdown_is_exact_renderer_output(self):
        self.assertEqual(
            self.saved_markdown.encode("utf-8"),
            render_markdown(self.public, self.manifest).encode("utf-8"),
        )

    def test_09_markdown_has_only_adopted_evidence_and_no_internal_refs(self):
        cited = set(re.findall(r"\bE[1-9][0-9]*\b", self.saved_markdown))
        self.assertEqual(cited, set(self.public["adopted_public_evidence_ids"]))
        self.assertNotRegex(
            self.saved_markdown,
            r"web/(?:advisors\.json|reports/)|source_ref|repository_source_ref|[A-Za-z]:\\|/Users/|/home/|/tmp/",
        )

    def test_10_markdown_has_no_experience_or_publication_promises(self):
        self.assertNotRegex(
            self.saved_markdown,
            r"学生经历|访谈原话|访谈记录|受访者|录音转写|participant_id|verbatim_quote",
        )
        self.assertNotRegex(self.saved_markdown, r"保证毕业|保证论文|当前有名额|导师不\s*push")

    def test_11_public_markdown_is_localized(self):
        codes = [
            "public_fact",
            "ai_synthesis",
            "review_pending",
            "pending_verification",
            "pending_manual_review",
            "journal_article",
            "identity_pending",
        ]
        for code in codes:
            self.assertNotIn(code, self.saved_markdown)
        self.assertNotIn("Evidence", self.saved_markdown)

    def test_12_validation_report_matches_current_package(self):
        self.assertEqual(self.saved_report, self.report)
        self.assertEqual(self.saved_report["candidate_evidence_count"], 6)
        self.assertEqual(self.saved_report["adopted_publication_evidence_count"], 5)
        self.assertEqual(self.saved_report["adopted_official_evidence_count"], 1)


if __name__ == "__main__":
    unittest.main()
