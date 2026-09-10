import csv
import json
import unittest
from collections import Counter
from pathlib import Path

from src.advisor_production.renderer import render_markdown
from src.advisor_production.validator import validate_package


ROOT = Path(__file__).resolve().parents[1]
IDS = ["chen-shuhua", "deng-meichun", "deng-suixin", "duan-ranhui", "fan-liangliang", "guo-yi", "jiang-hao", "li-jinchen"]
EXPECTED = {
    "chen-shuhua": (22, 6, 2, 1, "verified"),
    "deng-meichun": (10, 9, 0, 0, "verified"),
    "deng-suixin": (8, 7, 0, 0, "verified"),
    "duan-ranhui": (10, 8, 0, 0, "verified"),
    "fan-liangliang": (10, 5, 0, 0, "unresolved"),
    "guo-yi": (10, 7, 1, 1, "verified"),
    "jiang-hao": (10, 5, 3, 2, "unresolved"),
    "li-jinchen": (10, 7, 0, 2, "unresolved"),
}
DECISIONS = json.loads((ROOT / "docs" / "reviews" / "phase-2-publication-enrichment" / "OWNER_PUBLICATION_DECISIONS_2026-09-10.json").read_text(encoding="utf-8"))["advisors"]


class Phase2PublicationEnrichmentTests(unittest.TestCase):
    def load(self, advisor_id):
        package = ROOT / "data" / "advisors-v1" / advisor_id
        values = [json.loads((package / name).read_text(encoding="utf-8")) for name in ("public-advisor-v1.json", "evidence-manifest-v1.json", "identity-review-v1.json")]
        return package, *values

    def test_each_package_matches_matrix_and_stays_closed(self):
        for advisor_id in IDS:
            with self.subTest(advisor_id=advisor_id):
                package, public, manifest, identity = self.load(advisor_id)
                publications = [x for x in manifest["candidate_evidence"] if x["evidence_type"] == "publication"]
                candidates, adopted, rejected, unresolved, orcid = EXPECTED[advisor_id]
                self.assertEqual(candidates, len(publications))
                self.assertEqual(adopted, sum("adopted" in x["candidate_statuses"] for x in publications))
                self.assertEqual(rejected, sum("excluded" in x["candidate_statuses"] for x in publications))
                self.assertEqual(unresolved, sum(not x["identity_verified"] and "excluded" not in x["candidate_statuses"] for x in publications))
                self.assertEqual(orcid, identity["advisor_identity"]["orcid_status"])
                decision = DECISIONS[advisor_id]
                self.assertEqual(decision["keep_adopted"] + decision["promote"], [x for x in public["adopted_public_evidence_ids"] if x != "E1"])
                self.assertEqual(decision["featured"], public["featured_publication_evidence_ids"])
                self.assertEqual("manually_reviewed", public["featured_selection_status"])
                self.assertEqual("approved", public["featured_selection_review"]["status"])
                self.assertEqual("user", public["featured_selection_review"]["reviewer_role"])
                self.assertEqual("pending", identity["advisor_identity"]["human_review_status"])
                self.assertEqual("review_pending", public["publication_status"])
                report = validate_package(public, manifest, identity, package_dir=package)
                self.assertTrue(report["valid"], report)
                self.assertFalse(report["release_eligible"])
                self.assertEqual([], report["errors"])

    def test_renderer_saved_bytes_are_fresh_and_deterministic(self):
        for advisor_id in IDS:
            with self.subTest(advisor_id=advisor_id):
                package, public, manifest, _ = self.load(advisor_id)
                first = render_markdown(public, manifest).encode("utf-8")
                second = render_markdown(public, manifest).encode("utf-8")
                self.assertEqual(first, second)
                self.assertEqual(first, (package / "public-advisor-v1.md").read_bytes())

    def test_advisor_names_and_evidence_do_not_cross_contaminate(self):
        english_names = {}
        for advisor_id in IDS:
            _, public, _, _ = self.load(advisor_id)
            english_names[advisor_id] = public["name_en"]["value"]
        for advisor_id in IDS:
            _, public, manifest, identity = self.load(advisor_id)
            self.assertEqual(advisor_id, public["advisor_id"])
            self.assertEqual(advisor_id, manifest["advisor_id"])
            self.assertEqual(advisor_id, identity["advisor_id"])
            expected = "".join(c for c in english_names[advisor_id].casefold() if c.isalnum())
            for record in identity["publication_identity"]:
                actual = "".join(c for c in record["matched_author_name"].casefold() if c.isalnum())
                self.assertEqual(expected, actual)

    def test_dois_are_unique_within_and_across_packages(self):
        seen = {}
        for advisor_id in IDS:
            _, _, manifest, _ = self.load(advisor_id)
            for item in manifest["candidate_evidence"]:
                if item["evidence_type"] == "publication" and item["doi"]:
                    doi = item["doi"].lower()
                    self.assertNotIn(doi, seen, f"{doi} reused by {seen.get(doi)} and {advisor_id}")
                    seen[doi] = advisor_id

    def test_ledger_is_closed_to_all_packages(self):
        ledger = ROOT / "docs" / "reviews" / "phase-2-publication-enrichment" / "publication_identity_ledger.csv"
        with ledger.open(encoding="utf-8-sig") as handle:
            rows = list(csv.DictReader(handle))
        self.assertEqual(90, len(rows))
        self.assertEqual(Counter({advisor_id: EXPECTED[advisor_id][0] for advisor_id in IDS}), Counter(row["advisor_id"] for row in rows))
        self.assertTrue(all(row["review_required"] == "yes" for row in rows))
        self.assertEqual(Counter({"adopted": 54, "candidate": 24, "excluded": 6, "identity_pending": 6}), Counter(row["decision"] for row in rows))

    def test_promotions_were_verified_and_owner_partitions_are_exact(self):
        for advisor_id in IDS:
            with self.subTest(advisor_id=advisor_id):
                _, _, manifest, identity = self.load(advisor_id)
                by_id = {item["evidence_id"]: item for item in manifest["candidate_evidence"]}
                identity_by_id = {item["evidence_id"]: item for item in identity["publication_identity"]}
                decision = DECISIONS[advisor_id]
                for evidence_id in decision["promote"]:
                    self.assertTrue(by_id[evidence_id]["identity_verified"])
                    self.assertEqual("verified", identity_by_id[evidence_id]["identity_status"])
                    self.assertEqual(["adopted"], by_id[evidence_id]["candidate_statuses"])
                for evidence_id in decision["rejected"]:
                    self.assertIn("excluded", by_id[evidence_id]["candidate_statuses"])
                    self.assertEqual("conflict", identity_by_id[evidence_id]["identity_status"])
                for evidence_id in decision["unresolved"]:
                    self.assertNotIn("adopted", by_id[evidence_id]["candidate_statuses"])
                    self.assertEqual("unresolved", identity_by_id[evidence_id]["identity_status"])

    def test_owner_decision_scope_remains_non_release(self):
        artifact = json.loads((ROOT / "docs" / "reviews" / "phase-2-publication-enrichment" / "OWNER_PUBLICATION_DECISIONS_2026-09-10.json").read_text(encoding="utf-8"))
        self.assertFalse(artifact["release_authorized"])
        self.assertFalse(artifact["global_human_approved"])
        self.assertTrue(artifact["final_website_visual_review_required"])

    def test_known_version_and_orcid_conflicts_remain_explicit(self):
        _, _, duan_manifest, _ = self.load("duan-ranhui")
        eg5 = next(x for x in duan_manifest["candidate_evidence"] if x["evidence_id"] == "E3")
        self.assertEqual("duan-ranhui-eg5", eg5["version_group"])
        _, _, _, jinchen_identity = self.load("li-jinchen")
        self.assertEqual("unresolved", jinchen_identity["advisor_identity"]["orcid_status"])
        self.assertIsNone(jinchen_identity["advisor_identity"]["candidate_orcid"])
        self.assertTrue(all(x["matched_orcid"] is None for x in jinchen_identity["publication_identity"]))

    def test_remaining_seven_preserve_candidate_author_inventories(self):
        review_root = ROOT / "docs" / "reviews" / "phase-2-publication-enrichment"
        for advisor_id in IDS[1:]:
            with self.subTest(advisor_id=advisor_id):
                audit = (review_root / f"{advisor_id}-publication-audit.md").read_text(encoding="utf-8")
                for heading in (
                    "Source author ID",
                    "Affiliation(s)",
                    "ORCID",
                    "Works count",
                    "Coauthors / network",
                    "Topics",
                    "Metadata URL",
                    "Why candidate",
                    "Why maybe wrong",
                ):
                    self.assertIn(heading, audit)
                self.assertIn("source-entity total NOT_ACCESSED", audit)
                self.assertIn("name-only database entity", audit)
        self.assertIn("GY-A3", (review_root / "guo-yi-publication-audit.md").read_text(encoding="utf-8"))
        self.assertIn("JH-A5", (review_root / "jiang-hao-publication-audit.md").read_text(encoding="utf-8"))
        self.assertIn("LJ-A3", (review_root / "li-jinchen-publication-audit.md").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
