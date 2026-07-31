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

    def test_01_real_package_schema_and_bindings_pass(self):
        self.assertTrue(self.report["valid"], self.report); self.assertEqual(self.report["schema_and_field_binding_status"], "passed")

    def test_02_real_package_is_not_release_eligible(self):
        self.assertFalse(self.report["release_eligible"]); self.assertFalse(self.saved_report["release_eligible"])

    def test_03_publication_status_is_forced_review_pending(self):
        self.assertEqual(self.public["publication_status"], "review_pending"); self.assertEqual(self.report["effective_publication_status"], "review_pending")

    def test_04_featured_is_subset_of_adopted(self):
        self.assertLessEqual(set(self.public["featured_publication_evidence_ids"]), set(self.public["adopted_public_evidence_ids"]))

    def test_05_excluded_and_candidate_only_records_are_not_publicly_cited(self):
        cited = set(re.findall(r"\bE[1-9][0-9]*\b", self.saved_markdown))
        forbidden = {item["evidence_id"] for item in self.manifest["candidate_evidence"] if "excluded" in item["candidate_statuses"] or item["candidate_statuses"] == ["candidate", "identity_pending"]}
        self.assertTrue(cited.isdisjoint(forbidden)); self.assertEqual(cited, set(self.public["adopted_public_evidence_ids"]))

    def test_06_formal_and_preprint_share_version_group_and_are_not_both_featured(self):
        self.assertEqual(self.by_id["E16"]["version_group"], self.by_id["E17"]["version_group"])
        featured = set(self.public["featured_publication_evidence_ids"]); self.assertFalse({"E16", "E17"}.issubset(featured))

    def test_07_saved_markdown_is_exact_renderer_output(self):
        self.assertEqual(self.saved_markdown.encode("utf-8"), render_markdown(self.public, self.manifest).encode("utf-8"))

    def test_08_markdown_has_no_internal_reference_or_absolute_path(self):
        self.assertNotRegex(self.saved_markdown, r"web/(?:advisors\.json|reports/)|source_ref|repository_source_ref|[A-Za-z]:\\|/Users/|/home/|/tmp/")

    def test_09_markdown_has_no_experience_content(self):
        self.assertNotRegex(self.saved_markdown, r"学生经历|访谈原话|访谈记录|受访者|录音转写|participant_id|verbatim_quote")

    def test_10_markdown_has_no_machine_enum_codes(self):
        codes = ["public_fact", "ai_synthesis", "review_pending", "pending_verification", "pending_manual_review", "needs_reverification", "journal_article", "duplicate_candidate", "identity_pending"]
        for code in codes: self.assertNotIn(code, self.saved_markdown)

    def test_11_migration_date_does_not_claim_repository_fields_were_verified(self):
        self.assertEqual(self.public["migrated_at"], "2026-07-31")
        for key in ("name_zh", "name_en", "institution"):
            self.assertEqual(self.public[key]["missing_status"], "needs_verification"); self.assertIsNone(self.public[key]["last_verified_at"])

    def test_12_chapters_seven_and_twelve_are_bounded_exports(self):
        chapter7 = self.saved_markdown.split("## 7.", 1)[1].split("## 8.", 1)[0]
        chapter12 = self.saved_markdown.split("## 12.", 1)[1].split("## 13.", 1)[0]
        self.assertIn("代表性论文尚待人工筛选", chapter7); self.assertNotIn("证据编号 | 论文原题", chapter12); self.assertNotIn("Targeting WSTF", chapter12)


if __name__ == "__main__": unittest.main()
