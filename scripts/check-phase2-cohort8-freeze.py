"""Read-only drift checker for the Phase 2 Cohort 8 freeze."""

from __future__ import annotations

import csv
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FREEZE = ROOT / "docs" / "releases" / "phase-2-cohort-8-freeze-2026-09-10"
MANIFEST = FREEZE / "FREEZE_MANIFEST.json"
HASHES = FREEZE / "FREEZE_FILE_HASHES.csv"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify() -> tuple[str, list[dict[str, str]]]:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    with HASHES.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))

    results: list[dict[str, str]] = []
    expected_paths = {row["path"] for row in rows}
    if len(expected_paths) != len(rows):
        results.append({"status": "UNEXPECTED", "path": str(HASHES.relative_to(ROOT)), "detail": "duplicate path in hash inventory"})

    manifest_paths = set(manifest["source_artifact_paths"])
    for path in sorted(expected_paths - manifest_paths):
        results.append({"status": "MISSING", "path": path, "detail": "hash inventory path missing from manifest"})
    for path in sorted(manifest_paths - expected_paths):
        results.append({"status": "UNEXPECTED", "path": path, "detail": "manifest path missing from hash inventory"})

    for row in rows:
        path = ROOT / Path(row["path"])
        if not path.is_file():
            results.append({"status": "MISSING", "path": row["path"], "detail": "expected file is absent"})
        else:
            actual = sha256(path)
            status = "MATCH" if actual == row["sha256"] else "DRIFT"
            results.append({"status": status, "path": row["path"], "detail": actual})

    embedded_hashes = (
        (manifest["owner_review"]["publication_decision_artifact"], manifest["owner_review"]["publication_decision_sha256"]),
        (manifest["ledger"]["path"], manifest["ledger"]["sha256"]),
    )
    for relative, expected in embedded_hashes:
        path = ROOT / relative
        if path.is_file() and sha256(path) != expected:
            results.append({"status": "DRIFT", "path": relative, "detail": "embedded manifest hash mismatch"})

    canonical_names = set(manifest["canonical_package_files"])
    for advisor_id in manifest["advisor_ids"]:
        package = ROOT / "data" / "advisors-v1" / advisor_id
        actual_names = {path.name for path in package.iterdir() if path.is_file()} if package.is_dir() else set()
        for name in sorted(actual_names - canonical_names):
            results.append({"status": "UNEXPECTED", "path": f"data/advisors-v1/{advisor_id}/{name}", "detail": "unlisted package file"})

    status = "MATCH" if results and all(row["status"] == "MATCH" for row in results) else "DRIFT"
    return status, results


def main() -> int:
    status, results = verify()
    counts = {name: sum(row["status"] == name for row in results) for name in ("MATCH", "DRIFT", "MISSING", "UNEXPECTED")}
    print(json.dumps({"freeze": "phase-2-cohort-8-freeze-2026-09-10", "status": status, "counts": counts}, ensure_ascii=False))
    for row in results:
        if row["status"] != "MATCH":
            print(json.dumps(row, ensure_ascii=False))
    return 0 if status == "MATCH" else 1


if __name__ == "__main__":
    raise SystemExit(main())
