from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path
from unittest.mock import patch

from src.advisor_production.renderer import _label, render_markdown
from src.advisor_production.validator import validate_package
from tests.test_advisor_production import complete_identity_review, complete_manifest, complete_public_record, error_codes, sourced


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_DIR = ROOT / "docs" / "advisor-template-v1"


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


class AdvisorProductionV103Tests(unittest.TestCase):
    def validate(self, public=None, manifest=None, identity=None):
        return validate_package(public or complete_public_record(), manifest or complete_manifest(), identity or complete_identity_review())

    def test_01_new_record_allows_null_migrated_at(self):
        public = complete_public_record(); public["migrated_at"] = None
        self.assertTrue(self.validate(public=public)["valid"])

    def test_02_record_created_at_is_required(self):
        public = complete_public_record(); del public["record_created_at"]
        report = self.validate(public=public)
        self.assertIn("SCHEMA_REQUIRED", error_codes(report)); self.assertTrue(any(item["path"] == "public.record_created_at" for item in report["errors"]))

    def test_03_migration_date_cannot_replace_verification_date(self):
        public = complete_public_record(); public["migrated_at"] = "2026-08-01"
        public["institution"] = {"value":"旧机构", "value_en":None, "source_url":None, "source_ref":"legacy/report.md", "source_authority":"repository_existing_public_report", "last_verified_at":"2026-08-01", "missing_status":"available"}
        self.assertIn("MIGRATION_DATE_AS_VERIFICATION", error_codes(self.validate(public=public)))

    def test_04_renderer_does_not_claim_schema_passed(self):
        markdown = render_markdown(complete_public_record(), complete_manifest())
        self.assertNotIn("已通过机械校验", markdown); self.assertIn("请以validation-report-v1.json为准", markdown)

    def test_05_renderer_has_no_english_evidence_column_wording(self):
        markdown = render_markdown(complete_public_record(), complete_manifest())
        self.assertNotIn("Evidence", markdown); self.assertIn("候选证据总数", markdown); self.assertIn("已采用公开证据数", markdown)

    def test_06_missing_display_mapping_fails_closed(self):
        with patch("src.advisor_production.renderer._mapping", return_value={"enum_labels": {}}):
            with self.assertRaisesRegex(ValueError, "Missing Chinese display mapping"):
                _label("confidence", "High")

    def test_07_all_schema_enum_values_have_non_machine_labels(self):
        schemas = ["public-advisor-schema-v1.0.3.json", "evidence-manifest-schema-v1.0.3.json", "identity-review-schema-v1.0.3.json"]
        values: set[str] = set()
        for name in schemas:
            values.update(enum_values(json.loads((SCHEMA_DIR / name).read_text(encoding="utf-8"))))
        labels = json.loads((SCHEMA_DIR / "display-label-mapping-v1.0.3.json").read_text(encoding="utf-8"))["enum_labels"]
        missing = sorted(values - labels.keys())
        machine_fallbacks = sorted(value for value in values if labels.get(value) == value)
        self.assertEqual(missing, []); self.assertEqual(machine_fallbacks, [])

    def test_08_manifest_invalid_evidence_id_is_rejected_by_schema(self):
        manifest = complete_manifest(); manifest["candidate_evidence"][0]["evidence_id"] = "BAD-1"
        self.assertIn("SCHEMA_PATTERN", error_codes(self.validate(manifest=manifest)))

    def test_09_manifest_empty_title_is_rejected_by_schema(self):
        manifest = complete_manifest(); manifest["candidate_evidence"][0]["title"] = ""
        self.assertIn("SCHEMA_MIN_LENGTH", error_codes(self.validate(manifest=manifest)))

    def test_10_manifest_unreasonable_year_is_rejected_by_schema(self):
        manifest = complete_manifest(); manifest["candidate_evidence"][0]["publication_year"] = 2200
        self.assertIn("SCHEMA_MAXIMUM", error_codes(self.validate(manifest=manifest)))

    def test_11_identity_invalid_reviewer_role_is_rejected_by_schema(self):
        identity = complete_identity_review(); identity["reviewer_role"] = "model_approved"
        self.assertIn("SCHEMA_ENUM", error_codes(self.validate(identity=identity)))

    def test_12_identity_invalid_date_and_orcid_are_rejected_by_schema(self):
        identity = complete_identity_review(); identity["reviewed_at"] = "2026-13-40"; identity["advisor_identity"]["candidate_orcid"] = "bad-orcid"
        report = self.validate(identity=identity)
        self.assertGreaterEqual(sum(item["code"] in {"SCHEMA_FORMAT", "SCHEMA_PATTERN"} for item in report["errors"]), 2)

    def test_13_featured_cannot_be_generated_without_human_review(self):
        public = complete_public_record(); public["featured_selection_status"] = "pending_manual_review"
        public["featured_selection_review"] = {"status":"pending", "reviewed_at":None, "reviewer_role":None, "selection_criteria":[], "notes":None}
        self.assertIn("FEATURED_SELECTION_NOT_REVIEWED", error_codes(self.validate(public=public)))

    def test_14_three_missing_states_have_positive_and_negative_cases(self):
        self.assertTrue(self.validate()["valid"])
        invalid_fields = [
            {**sourced("值"), "last_verified_at": None},
            {**sourced(None, authority=None, missing_status="no_public_information"), "source_ref": "legacy.md"},
            {**sourced(None, authority=None, missing_status="needs_verification"), "last_verified_at": "2026-08-01"},
        ]
        for field in invalid_fields:
            with self.subTest(field=field):
                public = complete_public_record(); public["contact"]["official_phone"] = copy.deepcopy(field)
                self.assertIn("INVALID_MISSING_STATE", error_codes(self.validate(public=public)))


if __name__ == "__main__": unittest.main()
