import csv
import importlib.util
import json
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FREEZE = ROOT / "docs" / "releases" / "phase-2-cohort-8-freeze-2026-09-10"
PLAYBOOK = ROOT / "docs" / "playbooks" / "advisor-research-reuse-v1"


class Phase2Cohort8FreezeTests(unittest.TestCase):
    def test_freeze_hash_inventory_matches(self):
        spec = importlib.util.spec_from_file_location("freeze_checker", ROOT / "scripts" / "check-phase2-cohort8-freeze.py")
        module = importlib.util.module_from_spec(spec)
        assert spec.loader is not None
        spec.loader.exec_module(module)
        status, results = module.verify()
        self.assertEqual("MATCH", status, [row for row in results if row["status"] != "MATCH"])

    def test_manifest_preserves_exact_nonrelease_state(self):
        manifest = json.loads((FREEZE / "FREEZE_MANIFEST.json").read_text(encoding="utf-8"))
        self.assertEqual("fed26decc26a709379b0f087be8d68c1b50f2642", manifest["repository"]["head"])
        self.assertEqual("OWNER_FINAL_WEB_REVIEW_PASS_WITH_NOTES", manifest["owner_review"]["verdict"])
        self.assertEqual("INDEPENDENT_REVIEWER_PASS", manifest["independent_reviewer"]["verdict"])
        self.assertEqual(0, manifest["independent_reviewer"]["p0_p1_findings"])
        self.assertEqual(8, len(manifest["advisor_ids"]))
        self.assertEqual(54, sum(len(item["adopted_publication_evidence_ids"]) for item in manifest["advisors"].values()))
        self.assertEqual(39, sum(len(item["featured_publication_evidence_ids"]) for item in manifest["advisors"].values()))
        self.assertTrue(all(item["human_review_state"] == "pending" for item in manifest["advisors"].values()))
        self.assertTrue(all(item["publication_status"] == "review_pending" for item in manifest["advisors"].values()))
        self.assertTrue(all(item["release_eligible"] is False for item in manifest["advisors"].values()))

    def test_ledger_equation_remains_closed(self):
        ledger = ROOT / "docs" / "reviews" / "phase-2-publication-enrichment" / "publication_identity_ledger.csv"
        with ledger.open(encoding="utf-8-sig", newline="") as handle:
            decisions = Counter(row["decision"] for row in csv.DictReader(handle))
        self.assertEqual(Counter({"adopted": 54, "candidate": 24, "excluded": 6, "identity_pending": 6}), decisions)

    def test_reuse_pack_has_distinct_operational_artifacts(self):
        required = [f"{number:02d}_{name}.md" for number, name in (
            (0, "START_HERE"), (1, "WORKFLOW_SOP"), (2, "SOURCE_HIERARCHY"),
            (3, "AUTHOR_IDENTITY_VERIFICATION"), (4, "PUBLICATION_DECISION_RULES"),
            (5, "FEATURED_SELECTION_RULES"), (6, "AI_SYNTHESIS_BOUNDARIES"),
            (7, "FAILURE_PATTERNS_AND_RECOVERY"), (8, "HUMAN_REVIEW_CHECKLIST"),
            (9, "SCALE_AND_STOP_RULES"), (10, "CODEX_PROMPT_TEMPLATE"),
            (11, "NEW_ADVISOR_BATCH_TEMPLATE"), (12, "ACCEPTANCE_TESTS"),
        )]
        for name in required:
            self.assertTrue((PLAYBOOK / name).is_file(), name)
        combined = "\n".join((PLAYBOOK / name).read_text(encoding="utf-8") for name in required)
        for invariant in (
            "SEARCH_NOT_RUN", "OpenAlex", "article-local", "One ORCID-bearing publication",
            "conflicting ORCIDs", "Hao Jiang E5", "topic fit", "Historical affiliations",
            "formal/preprint", "Featured", "undergraduate tasks", "PUBLICATION-SUPPORTED",
        ):
            self.assertIn(invariant, combined)


if __name__ == "__main__":
    unittest.main()
