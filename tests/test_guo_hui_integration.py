from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

from src.advisor_production.renderer import render_markdown
from src.advisor_production.validator import validate_package


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "data" / "advisors-v1" / "guo-hui"


class GuoHuiIntegrationTests(unittest.TestCase):
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

    def test_02_migration_remains_review_pending(self):
        self.assertFalse(self.report["release_eligible"])
        self.assertFalse(self.saved_report["release_eligible"])
        self.assertEqual(self.public["publication_status"], "review_pending")
        self.assertEqual(self.report["effective_publication_status"], "review_pending")
        self.assertEqual(self.identity["reviewer_role"], "codex_mechanical_migration")
        self.assertEqual(self.identity["advisor_identity"]["human_review_status"], "pending")

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

    def test_04_identity_and_orcid_are_mechanically_verified(self):
        self.assertEqual(self.public["name_zh"]["value"], "郭辉")
        self.assertEqual(self.public["school_or_department"]["value"], "生命科学学院遗传学系")
        self.assertEqual(self.public["position"]["value"], "研究员")
        self.assertEqual([item["value"] for item in self.public["public_roles"]], ["博士生导师"])
        self.assertEqual(self.identity["advisor_identity"]["orcid_status"], "verified")
        self.assertEqual(self.identity["advisor_identity"]["candidate_orcid"], "0000-0002-1570-2545")
        self.assertTrue(all(item["identity_status"] == "verified" for item in self.identity["publication_identity"]))

    def test_05_author_roles_are_conservatively_locked(self):
        expected = {
            "E1": ("last", False, True),
            "E2": ("last", False, True),
            "E3": ("middle", False, True),
            "E4": ("first", True, True),
            "E5": ("first", False, True),
        }
        for evidence_id, role in expected.items():
            item = self.by_id[evidence_id]
            self.assertEqual((item["author_position"], item["is_co_first"], item["is_corresponding"]), role)
            self.assertTrue(item["identity_verified"])

    def test_06_featured_remains_pending_and_empty(self):
        self.assertEqual(self.public["featured_publication_evidence_ids"], [])
        self.assertEqual(self.public["featured_selection_status"], "pending_manual_review")
        self.assertEqual(self.public["featured_selection_review"]["status"], "pending")

    def test_07_saved_markdown_and_validation_are_deterministic(self):
        self.assertEqual(self.saved_markdown.encode("utf-8"), render_markdown(self.public, self.manifest).encode("utf-8"))
        self.assertEqual(self.saved_report, self.report)

    def test_08_markdown_has_no_experience_or_internal_paths(self):
        self.assertNotRegex(
            self.saved_markdown,
            r"学生经历|访谈原话|访谈记录|受访者|录音转写|participant_id|verbatim_quote|[A-Za-z]:\\|/Users/|/home/|/tmp/",
        )
        self.assertNotRegex(self.saved_markdown, r"保证毕业|保证论文|当前有名额|导师不\s*push")
        cited = set(re.findall(r"\bE[1-9][0-9]*\b", self.saved_markdown))
        self.assertEqual(cited, set(self.public["adopted_public_evidence_ids"]))

    def test_09_report_counts_are_exact(self):
        self.assertEqual(self.saved_report["candidate_evidence_count"], 6)
        self.assertEqual(self.saved_report["adopted_publication_evidence_count"], 5)
        self.assertEqual(self.saved_report["adopted_official_evidence_count"], 1)
        self.assertEqual(self.saved_report["pending_version_group_count"], 0)


if __name__ == "__main__":
    unittest.main()
