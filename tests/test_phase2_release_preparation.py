import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PREP = ROOT / "docs" / "releases" / "phase-2-cohort-8-release-prep-2026-09-10"
MANIFEST = json.loads((PREP / "RELEASE_CANDIDATE_MANIFEST.json").read_text(encoding="utf-8"))
FREEZE = json.loads(
    (ROOT / "docs" / "releases" / "phase-2-cohort-8-freeze-2026-09-10" / "FREEZE_MANIFEST.json").read_text(encoding="utf-8")
)


def test_release_candidate_preserves_frozen_identity_and_counts():
    assert MANIFEST["advisor_ids"] == FREEZE["advisor_ids"]
    assert MANIFEST["cohort_totals"] == FREEZE["cohort_totals"]
    assert MANIFEST["canonical_state"]["publication_status"] == "review_pending"
    assert MANIFEST["canonical_state"]["release_eligible"] is False
    assert MANIFEST["canonical_state"]["release_authorized"] is False


def test_release_candidate_uses_non_recursive_containing_commit_marker():
    assert MANIFEST["original_head"] == "fed26decc26a709379b0f087be8d68c1b50f2642"
    assert MANIFEST["release_candidate_sha"] == "RESOLVE_AS_CONTAINING_COMMIT"


def test_proposed_public_path_set_is_exact_and_bounded():
    with (PREP / "PROPOSED_PUBLIC_FILES.csv").open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    assert len(rows) == 29
    assert sum(row["operation"] == "ADD" for row in rows) == 24
    assert sum(row["operation"] == "MODIFY" for row in rows) == 5
    assert not any(row["operation"] == "REMOVE" for row in rows)
    assert {row["advisor_id"] for row in rows if row["operation"] == "ADD"} == set(MANIFEST["advisor_ids"])
    assert all(row["path"].startswith("site-src/") for row in rows)


def test_protected_outputs_are_explicitly_excluded_from_local_commit():
    exclusions = MANIFEST["explicit_exclusions"]
    assert "frontend/public/**" in exclusions
    assert "site-src/**" in exclusions
    assert ".github/workflows/**" in exclusions
    assert MANIFEST["remote_actions"] == {
        "push": False,
        "merge": False,
        "rebase": False,
        "deploy": False,
        "publish": False,
    }


def test_known_risks_remain_unadopted_and_unfeatured():
    expected = {
        "chen-shuhua": {"E21", "E22", "E23"},
        "guo-yi": {"E7", "E11"},
        "jiang-hao": {"E5", "E8", "E9", "E10", "E11"},
        "li-jinchen": {"E7", "E8"},
    }
    for advisor_id, blocked_ids in expected.items():
        advisor = FREEZE["advisors"][advisor_id]
        assert blocked_ids.isdisjoint(advisor["adopted_publication_evidence_ids"])
        assert blocked_ids.isdisjoint(advisor["featured_publication_evidence_ids"])


def test_release_preview_is_isolated_and_ignored():
    assert (ROOT / "frontend" / "scripts" / "release-preview-phase2-cohort8.mjs").is_file()
    gitignore = (ROOT / "frontend" / ".gitignore").read_text(encoding="utf-8")
    assert ".release-preview-phase2-cohort8/" in gitignore
    assert MANIFEST["preview"]["canonical"] is False
    assert MANIFEST["preview"]["production_gate_modified"] is False
