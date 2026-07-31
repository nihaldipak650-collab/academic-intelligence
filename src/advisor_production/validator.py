"""Validate a public advisor package and its release gates.

The structural validator implements every JSON Schema keyword used by the
v1.0.3 contract.  Semantic checks then enforce cross-file Evidence, identity,
privacy, provenance, and publication rules that JSON Schema cannot express.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse


REPO_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIR = REPO_ROOT / "docs" / "advisor-template-v1"
DEFAULT_SCHEMA_PATH = SCHEMA_DIR / "public-advisor-schema-v1.0.3.json"
DEFAULT_MANIFEST_SCHEMA_PATH = SCHEMA_DIR / "evidence-manifest-schema-v1.0.3.json"
DEFAULT_IDENTITY_SCHEMA_PATH = SCHEMA_DIR / "identity-review-schema-v1.0.3.json"

PUBLIC_STATUSES = {"approved", "published"}
OFFICIAL_AUTHORITIES = {
    "official_institution",
    "official_advisor",
    "official_lab",
}
EXPERIENCE_KEY_PATTERN = re.compile(
    r"(?:^|_)(?:experience|interview|participant|student_case|verbatim|"
    r"consent|anonymity|recording|transcript)(?:_|$)",
    re.IGNORECASE,
)
EXPERIENCE_TEXT_PATTERN = re.compile(
    r"学生经历|访谈原话|访谈记录|受访者|录音转写|participant_id|"
    r"verbatim_quote|student experience",
    re.IGNORECASE,
)
LOCAL_PATH_PATTERN = re.compile(
    r"(?:[A-Za-z]:\\(?:Users|Documents|Desktop|tmp)\\|/Users/|/home/|/tmp/)",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class ValidationIssue:
    code: str
    path: str
    message: str
    severity: str = "error"


def _issue(code: str, path: str, message: str, severity: str = "error") -> ValidationIssue:
    return ValidationIssue(code=code, path=path, message=message, severity=severity)


def _json_type_matches(value: Any, expected: str) -> bool:
    if expected == "null":
        return value is None
    if expected == "object":
        return isinstance(value, dict)
    if expected == "array":
        return isinstance(value, list)
    if expected == "string":
        return isinstance(value, str)
    if expected == "boolean":
        return isinstance(value, bool)
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    return True


def _resolve_ref(root_schema: dict[str, Any], ref: str) -> dict[str, Any]:
    if not ref.startswith("#/"):
        raise ValueError(f"Only local JSON Schema references are supported: {ref}")
    current: Any = root_schema
    for segment in ref[2:].split("/"):
        current = current[segment.replace("~1", "/").replace("~0", "~")]
    return current


def _format_valid(value: str, format_name: str) -> bool:
    if format_name == "uri":
        parsed = urlparse(value)
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)
    if format_name == "email":
        return bool(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value))
    if format_name == "date":
        try:
            date.fromisoformat(value)
            return bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", value))
        except ValueError:
            return False
    return True


def _validate_schema_node(
    value: Any,
    schema: dict[str, Any],
    root_schema: dict[str, Any],
    path: str,
) -> list[ValidationIssue]:
    if "$ref" in schema:
        return _validate_schema_node(value, _resolve_ref(root_schema, schema["$ref"]), root_schema, path)

    issues: list[ValidationIssue] = []
    if "oneOf" in schema:
        matches = [
            branch
            for branch in schema["oneOf"]
            if not _validate_schema_node(value, branch, root_schema, path)
        ]
        if len(matches) != 1:
            return [_issue("SCHEMA_ONE_OF", path, "Value must match exactly one allowed schema branch.")]
        return issues

    if "const" in schema and value != schema["const"]:
        issues.append(_issue("SCHEMA_CONST", path, f"Expected constant {schema['const']!r}."))
    if "enum" in schema and value not in schema["enum"]:
        issues.append(_issue("SCHEMA_ENUM", path, f"Value is not in {schema['enum']!r}."))

    expected_types = schema.get("type")
    if expected_types is not None:
        if isinstance(expected_types, str):
            expected_types = [expected_types]
        if not any(_json_type_matches(value, item) for item in expected_types):
            issues.append(_issue("SCHEMA_TYPE", path, f"Expected JSON type {expected_types!r}."))
            return issues

    if isinstance(value, dict):
        required = schema.get("required", [])
        for key in required:
            if key not in value:
                issues.append(_issue("SCHEMA_REQUIRED", f"{path}.{key}", "Required field is missing."))
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            for key in value:
                if key not in properties:
                    issues.append(_issue("SCHEMA_ADDITIONAL_PROPERTY", f"{path}.{key}", "Unknown field is forbidden."))
        for key, child in value.items():
            if key in properties:
                issues.extend(_validate_schema_node(child, properties[key], root_schema, f"{path}.{key}"))

    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            issues.append(_issue("SCHEMA_MIN_ITEMS", path, "Array has fewer items than allowed."))
        if schema.get("uniqueItems"):
            serialized = [json.dumps(item, sort_keys=True, ensure_ascii=False) for item in value]
            if len(serialized) != len(set(serialized)):
                issues.append(_issue("SCHEMA_UNIQUE_ITEMS", path, "Array items must be unique."))
        item_schema = schema.get("items")
        if item_schema:
            for index, child in enumerate(value):
                issues.extend(_validate_schema_node(child, item_schema, root_schema, f"{path}[{index}]"))

    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            issues.append(_issue("SCHEMA_MIN_LENGTH", path, "String is shorter than allowed."))
        if "pattern" in schema and not re.search(schema["pattern"], value):
            issues.append(_issue("SCHEMA_PATTERN", path, "String does not match the required pattern."))
        if "format" in schema and not _format_valid(value, schema["format"]):
            issues.append(_issue("SCHEMA_FORMAT", path, f"Invalid {schema['format']} value."))

    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            issues.append(_issue("SCHEMA_MINIMUM", path, "Number is below the allowed minimum."))
        if "maximum" in schema and value > schema["maximum"]:
            issues.append(_issue("SCHEMA_MAXIMUM", path, "Number is above the allowed maximum."))
    return issues


def validate_against_schema(data: dict[str, Any], schema_path: Path = DEFAULT_SCHEMA_PATH) -> list[ValidationIssue]:
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    return _validate_schema_node(data, schema, schema, "$")


def _schema_issues(data: dict[str, Any], schema_path: Path, root_name: str) -> list[ValidationIssue]:
    """Validate one document and make its error paths unambiguous."""
    return [
        ValidationIssue(
            code=issue.code,
            path=root_name + issue.path.removeprefix("$"),
            message=issue.message,
            severity=issue.severity,
        )
        for issue in validate_against_schema(data, schema_path)
    ]


def _walk(value: Any, path: str = "$") -> Iterable[tuple[str, str | None, Any]]:
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            yield child_path, key, child
            yield from _walk(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            child_path = f"{path}[{index}]"
            yield child_path, None, child
            yield from _walk(child, child_path)


def _normalize_doi(value: str | None) -> str | None:
    if not value:
        return None
    normalized = value.strip().lower()
    normalized = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", normalized)
    return normalized.removeprefix("doi:").strip()


def _normalize_title(value: str) -> str:
    without_version_label = re.sub(r"\(?\bpreprint\b\)?", "", value, flags=re.IGNORECASE)
    return re.sub(r"\W+", "", without_version_label.casefold(), flags=re.UNICODE)


def _collect_claim_evidence_ids(public: dict[str, Any]) -> set[str]:
    result: set[str] = set()
    for _path, key, value in _walk(public):
        if key == "evidence_ids" and isinstance(value, list):
            result.update(item for item in value if isinstance(item, str))
    return result


def _ids_below(value: Any) -> set[str]:
    result: set[str] = set()
    for _path, key, child in _walk(value):
        if key == "evidence_ids" and isinstance(child, list):
            result.update(item for item in child if isinstance(item, str))
    return result


def _evidence_field_binding_issues(public: dict[str, Any], evidence: list[dict[str, Any]]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    by_id = {item.get("evidence_id"): item for item in evidence if isinstance(item, dict)}
    for field, value in public.items():
        if field in {"adopted_public_evidence_ids", "featured_publication_evidence_ids"}:
            continue
        for evidence_id in _ids_below(value):
            item = by_id.get(evidence_id)
            if item is not None and field not in item.get("supported_fields", []):
                issues.append(_issue("EVIDENCE_FIELD_BINDING_MISMATCH", f"$.{field}", f"{evidence_id} does not declare support for {field}."))
    return issues


def _privacy_issues(values: Iterable[tuple[str, Any]]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    for root_name, value in values:
        for path, key, child in _walk(value, root_name):
            if key and EXPERIENCE_KEY_PATTERN.search(key):
                issues.append(_issue("EXPERIENCE_CONTENT_DETECTED", path, "Experience or internal-only field is forbidden in the public package."))
            if isinstance(child, str):
                if EXPERIENCE_TEXT_PATTERN.search(child):
                    issues.append(_issue("EXPERIENCE_CONTENT_DETECTED", path, "Experience or interview content is forbidden in the public package."))
                if LOCAL_PATH_PATTERN.search(child):
                    issues.append(_issue("LOCAL_PATH_LEAK", path, "Local absolute path is forbidden in the public package."))
                if re.search(r"(?:api[_-]?key|token|cookie)\s*[:=]\s*\S+", child, re.IGNORECASE):
                    issues.append(_issue("SECRET_LIKE_CONTENT", path, "Secret-like content is forbidden in the public package."))
    return issues


def _missing_state_issues(public: dict[str, Any]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    for path, key, value in _walk(public):
        if isinstance(value, dict) and {"value", "value_en", "source_url", "source_ref", "source_authority", "last_verified_at", "missing_status"}.issubset(value):
            status = value["missing_status"]
            if value.get("source_authority") == "repository_existing_public_report" and value.get("last_verified_at") is not None:
                issues.append(_issue("MIGRATION_DATE_AS_VERIFICATION", path, "Repository migration material cannot claim a source verification date."))
            if status == "available":
                if value["value"] is None or not (value["source_url"] or value["source_ref"]) or not value["last_verified_at"]:
                    issues.append(_issue("INVALID_MISSING_STATE", path, "Available sourced values require a value, source URL/ref, and verification date."))
            elif status == "no_public_information":
                if any(value[item] is not None for item in ("value", "value_en", "source_url", "source_ref", "source_authority", "last_verified_at")):
                    issues.append(_issue("INVALID_MISSING_STATE", path, "No-public-information values must use null value and provenance fields."))
            elif status == "needs_verification":
                if value["last_verified_at"] is not None:
                    issues.append(_issue("INVALID_MISSING_STATE", path, "Needs-verification values cannot claim a verification date."))
                if value["value"] is not None and not (value["source_url"] or value["source_ref"]):
                    issues.append(_issue("INVALID_MISSING_STATE", path, "A retained candidate value requires a source URL or repository source ref."))

        if isinstance(value, dict) and {"evidence_status", "confidence", "evidence_ids", "no_evidence_reason"}.issubset(value):
            no_evidence = value["evidence_status"] == "no_reliable_public_evidence"
            if no_evidence:
                if value["confidence"] != "No Evidence" or value["evidence_ids"] or not value["no_evidence_reason"]:
                    issues.append(_issue("INVALID_NO_EVIDENCE_STATE", path, "No Evidence claims require no IDs, Confidence No Evidence, and a reason."))
            elif value["confidence"] == "No Evidence":
                issues.append(_issue("INVALID_NO_EVIDENCE_STATE", path, "Confidence No Evidence requires no_reliable_public_evidence status."))
    return issues


def _contact_issues(public: dict[str, Any]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    contact = public.get("contact", {})
    for key in ("official_profile_url", "official_lab_url", "official_email", "official_phone", "lab_address"):
        value = contact.get(key)
        if isinstance(value, dict) and value.get("value") is not None:
            if value.get("source_authority") not in OFFICIAL_AUTHORITIES:
                issues.append(_issue("NON_OFFICIAL_CONTACT_SOURCE", f"$.contact.{key}", "Public contact fields require an official institution, advisor, or lab source."))
    return issues


def _required_identity_issues(public: dict[str, Any]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    for key in ("name_zh", "institution"):
        field = public.get(key)
        if not isinstance(field, dict) or not field.get("value"):
            issues.append(_issue("REQUIRED_IDENTITY_VALUE_MISSING", f"$.{key}", "Name and institution require a retained source-backed value."))
    return issues


def _dedup_issues(evidence: list[dict[str, Any]]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    doi_owner: dict[str, str] = {}
    for item in evidence:
        normalized = _normalize_doi(item.get("doi"))
        if normalized:
            if normalized in doi_owner:
                issues.append(_issue("DUPLICATE_DOI", f"manifest.{item.get('evidence_id', '?')}.doi", f"DOI duplicates {doi_owner[normalized]}."))
            else:
                doi_owner[normalized] = item.get("evidence_id", "?")

    for index, left in enumerate(evidence):
        for right in evidence[index + 1 :]:
            if _normalize_title(left.get("title", "")) != _normalize_title(right.get("title", "")):
                continue
            types = {left.get("source_type"), right.get("source_type")}
            if "preprint" in types and len(types) > 1:
                if not left.get("version_group") or left.get("version_group") != right.get("version_group"):
                    issues.append(_issue("UNLINKED_PUBLICATION_VERSION", "manifest.candidate_evidence", "Matching preprint and formal titles must share a version_group."))
                if "adopted" in left.get("candidate_statuses", []) and "adopted" in right.get("candidate_statuses", []):
                    issues.append(_issue("DUPLICATE_PUBLICATION_VERSION", "manifest.candidate_evidence", "Only one record in a publication version group may be adopted."))
    return issues


def _manifest_structure_issues(manifest: dict[str, Any]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    for key in ("schema_version", "advisor_id", "candidate_evidence"):
        if key not in manifest:
            issues.append(_issue("MANIFEST_REQUIRED", f"manifest.{key}", "Required Manifest field is missing."))
    if manifest.get("schema_version") != "1.0.3":
        issues.append(_issue("MANIFEST_VERSION", "manifest.schema_version", "Manifest must use v1.0.3."))
    evidence = manifest.get("candidate_evidence")
    if not isinstance(evidence, list) or not evidence:
        issues.append(_issue("MANIFEST_EVIDENCE_REQUIRED", "manifest.candidate_evidence", "Manifest requires at least one candidate Evidence record."))
        return issues
    required = {
        "evidence_id", "evidence_type", "title", "publication_year", "doi",
        "source_type", "source_url", "author_position", "is_co_first",
        "is_corresponding", "identity_verified", "candidate_statuses", "reason",
        "version_group", "supported_fields", "repository_source_ref",
    }
    allowed_positions = {"first", "middle", "last", "unknown"}
    allowed_types = {"journal_article", "preprint", "conference", "review", "other"}
    allowed_statuses = {"candidate", "adopted", "excluded", "duplicate_candidate", "identity_pending"}
    for index, item in enumerate(evidence):
        path = f"manifest.candidate_evidence[{index}]"
        if not isinstance(item, dict):
            issues.append(_issue("MANIFEST_RECORD_TYPE", path, "Evidence record must be an object."))
            continue
        for key in required - item.keys():
            issues.append(_issue("MANIFEST_REQUIRED", f"{path}.{key}", "Required Evidence field is missing."))
        if "advisor_author_role" in item:
            issues.append(_issue("LEGACY_AUTHOR_ROLE", f"{path}.advisor_author_role", "Merged author role is forbidden in v1.0.3."))
        if item.get("author_position") not in allowed_positions:
            issues.append(_issue("AUTHOR_POSITION", f"{path}.author_position", "Invalid author_position."))
        for key in ("is_co_first", "is_corresponding"):
            if item.get(key) not in {True, False, None}:
                issues.append(_issue("AUTHOR_ROLE_FLAG", f"{path}.{key}", "Author role flag must be true, false, or null when unresolved."))
        if item.get("source_type") not in allowed_types:
            issues.append(_issue("SOURCE_TYPE", f"{path}.source_type", "Invalid publication source_type."))
        if not isinstance(item.get("source_url"), str) or not _format_valid(item["source_url"], "uri"):
            issues.append(_issue("MANIFEST_SOURCE_URL", f"{path}.source_url", "Evidence requires an HTTP(S) source URL."))
        doi = item.get("doi")
        if doi is not None and (not isinstance(doi, str) or not re.fullmatch(r"10\.[0-9]{4,9}/\S+", doi)):
            issues.append(_issue("MANIFEST_DOI", f"{path}.doi", "DOI must preserve the valid source value or be null."))
        if not isinstance(item.get("identity_verified"), bool):
            issues.append(_issue("IDENTITY_FLAG", f"{path}.identity_verified", "identity_verified must be boolean."))
        if not isinstance(item.get("supported_fields"), list) or not item.get("supported_fields"):
            issues.append(_issue("SUPPORTED_FIELDS", f"{path}.supported_fields", "Each Evidence record must list supported public fields."))
        statuses = item.get("candidate_statuses")
        if not isinstance(statuses, list) or not statuses or len(statuses) != len(set(statuses)) or any(status not in allowed_statuses for status in statuses):
            issues.append(_issue("CANDIDATE_STATUSES", f"{path}.candidate_statuses", "Candidate statuses must be a non-empty unique list of allowed states."))
            statuses = []
        if "adopted" in statuses and ({"excluded", "duplicate_candidate"} & set(statuses)):
            issues.append(_issue("CONFLICTING_CANDIDATE_STATUS", f"{path}.candidate_statuses", "Adopted Evidence cannot also be excluded or a duplicate candidate."))
        if ({"excluded", "duplicate_candidate"} & set(statuses)) and not item.get("reason"):
            issues.append(_issue("EXCLUSION_REASON_REQUIRED", f"{path}.reason", "Excluded and duplicate candidate records require a reason."))
        if "duplicate_candidate" in statuses and not item.get("version_group"):
            issues.append(_issue("VERSION_GROUP_REQUIRED", f"{path}.version_group", "Duplicate candidates require a version_group."))
        if item.get("identity_verified") is False and "identity_pending" not in statuses:
            issues.append(_issue("IDENTITY_PENDING_STATUS_REQUIRED", f"{path}.candidate_statuses", "Unverified candidate Evidence must include identity_pending."))
        if item.get("identity_verified") is True and "identity_pending" in statuses:
            issues.append(_issue("IDENTITY_STATUS_CONFLICT", f"{path}.candidate_statuses", "Verified Evidence cannot remain identity_pending."))
    return issues


def _identity_structure_issues(identity_review: dict[str, Any]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    required = {"schema_version", "advisor_id", "review_status", "reviewed_at", "reviewer_role", "advisor_identity", "publication_identity", "p0_blockers", "notes"}
    for key in required - identity_review.keys():
        issues.append(_issue("IDENTITY_REVIEW_REQUIRED", f"identity.{key}", "Required Identity Review field is missing."))
    if identity_review.get("schema_version") != "1.0.3":
        issues.append(_issue("IDENTITY_REVIEW_VERSION", "identity.schema_version", "Identity Review must use v1.0.3."))
    if identity_review.get("review_status") not in {"verified", "unresolved", "conflict"}:
        issues.append(_issue("IDENTITY_REVIEW_STATUS", "identity.review_status", "Invalid Identity Review status."))
    advisor_identity = identity_review.get("advisor_identity")
    advisor_required = {"name_match_status", "institution_match_status", "orcid_status", "candidate_orcid", "notes"}
    if not isinstance(advisor_identity, dict) or not advisor_required.issubset(advisor_identity):
        issues.append(_issue("ADVISOR_IDENTITY_REQUIRED", "identity.advisor_identity", "Advisor identity requires name, institution, ORCID, and notes fields."))
    items = identity_review.get("publication_identity")
    if not isinstance(items, list) or not items:
        issues.append(_issue("IDENTITY_RECORDS_REQUIRED", "identity.publication_identity", "Identity Review requires publication-level records."))
    else:
        seen: set[str] = set()
        for index, item in enumerate(items):
            path = f"identity.publication_identity[{index}]"
            if not isinstance(item, dict) or not {"evidence_id", "identity_status", "notes"}.issubset(item):
                issues.append(_issue("IDENTITY_RECORD_REQUIRED", path, "Identity record requires evidence_id, identity_status, and notes."))
                continue
            if item["evidence_id"] in seen:
                issues.append(_issue("DUPLICATE_IDENTITY_RECORD", path, "Identity Evidence IDs must be unique."))
            seen.add(item["evidence_id"])
            if item["identity_status"] not in {"verified", "unresolved", "conflict"}:
                issues.append(_issue("IDENTITY_RECORD_STATUS", f"{path}.identity_status", "Invalid publication identity status."))
    blockers = identity_review.get("p0_blockers")
    if not isinstance(blockers, list):
        issues.append(_issue("P0_BLOCKERS_TYPE", "identity.p0_blockers", "p0_blockers must be an array."))
    else:
        for index, blocker in enumerate(blockers):
            if not isinstance(blocker, dict) or not {"code", "description", "evidence_ids"}.issubset(blocker):
                issues.append(_issue("P0_BLOCKER_REQUIRED", f"identity.p0_blockers[{index}]", "P0 blocker requires code, description, and Evidence IDs."))
    return issues


def validate_package(
    public: dict[str, Any],
    manifest: dict[str, Any],
    identity_review: dict[str, Any],
    *,
    package_dir: Path | None = None,
    schema_path: Path = DEFAULT_SCHEMA_PATH,
    manifest_schema_path: Path = DEFAULT_MANIFEST_SCHEMA_PATH,
    identity_schema_path: Path = DEFAULT_IDENTITY_SCHEMA_PATH,
) -> dict[str, Any]:
    public_schema_errors = _schema_issues(public, schema_path, "public")
    manifest_schema_errors = _schema_issues(manifest, manifest_schema_path, "manifest")
    identity_schema_errors = _schema_issues(identity_review, identity_schema_path, "identity")
    errors = public_schema_errors + manifest_schema_errors + identity_schema_errors
    warnings: list[ValidationIssue] = []

    errors.extend(_manifest_structure_issues(manifest))
    errors.extend(_identity_structure_issues(identity_review))
    errors.extend(_privacy_issues((("public", public), ("manifest", manifest), ("identity", identity_review))))
    errors.extend(_missing_state_issues(public))
    errors.extend(_contact_issues(public))
    errors.extend(_required_identity_issues(public))

    advisor_ids = {public.get("advisor_id"), manifest.get("advisor_id"), identity_review.get("advisor_id")}
    if len(advisor_ids) != 1:
        errors.append(_issue("ADVISOR_ID_MISMATCH", "$", "All package files must have the same advisor_id."))

    evidence = manifest.get("candidate_evidence", [])
    manifest_ids = [item.get("evidence_id") for item in evidence if isinstance(item, dict)]
    if len(manifest_ids) != len(set(manifest_ids)):
        errors.append(_issue("DUPLICATE_EVIDENCE_ID", "manifest.candidate_evidence", "Manifest Evidence IDs must be unique."))

    manifest_id_set = set(manifest_ids)
    by_id = {item.get("evidence_id"): item for item in evidence if isinstance(item, dict)}
    adopted_ids = set(public.get("adopted_public_evidence_ids", []))
    featured_ids = set(public.get("featured_publication_evidence_ids", []))
    claim_ids = _collect_claim_evidence_ids(public)
    if not adopted_ids.issubset(manifest_id_set):
        errors.append(_issue("ADOPTED_EVIDENCE_MISSING", "$.adopted_public_evidence_ids", "Every adopted public Evidence ID must exist in the candidate Manifest."))
    if claim_ids != adopted_ids:
        errors.append(_issue("ADOPTED_CLAIM_MISMATCH", "$", f"Public claim IDs {sorted(claim_ids)} must exactly equal adopted IDs {sorted(adopted_ids)}."))
    if not featured_ids.issubset(adopted_ids):
        errors.append(_issue("FEATURED_NOT_ADOPTED", "$.featured_publication_evidence_ids", "Featured publications must be a subset of adopted public Evidence."))
    selection_status = public.get("featured_selection_status")
    selection_review = public.get("featured_selection_review", {})
    if selection_status == "pending_manual_review" and featured_ids:
        errors.append(_issue("FEATURED_SELECTION_NOT_REVIEWED", "$.featured_publication_evidence_ids", "Pending manual review requires an empty featured publication list."))
    if selection_status == "pending_manual_review" and selection_review.get("status") != "pending":
        errors.append(_issue("FEATURED_REVIEW_STATUS_MISMATCH", "$.featured_selection_review.status", "Pending manual review requires featured review status pending."))
    if selection_status == "manually_reviewed" and not featured_ids:
        errors.append(_issue("FEATURED_SELECTION_EMPTY", "$.featured_publication_evidence_ids", "A manually reviewed featured selection cannot be empty."))
    if selection_status == "manually_reviewed" and selection_review.get("status") != "approved":
        errors.append(_issue("FEATURED_REVIEW_STATUS_MISMATCH", "$.featured_selection_review.status", "Manually reviewed selection requires featured review status approved."))
    if selection_review.get("status") == "approved":
        if not selection_review.get("reviewed_at") or selection_review.get("reviewer_role") not in {"user", "content_reviewer"} or not selection_review.get("selection_criteria"):
            errors.append(_issue("FEATURED_APPROVAL_INCOMPLETE", "$.featured_selection_review", "Approved selection requires date, user/content reviewer role, and non-empty criteria."))
    if selection_review.get("status") == "pending":
        if selection_review.get("reviewed_at") is not None or selection_review.get("reviewer_role") is not None or selection_review.get("selection_criteria"):
            errors.append(_issue("FEATURED_PENDING_METADATA", "$.featured_selection_review", "Pending selection cannot claim reviewer approval metadata."))
    for evidence_id in adopted_ids:
        item = by_id.get(evidence_id)
        statuses = set(item.get("candidate_statuses", [])) if item else set()
        if item and ("adopted" not in statuses or statuses & {"excluded", "duplicate_candidate"}):
            errors.append(_issue("INVALID_ADOPTED_STATUS", f"manifest.{evidence_id}.candidate_statuses", "Publicly adopted Evidence must have only an eligible adopted state."))
    for evidence_id in featured_ids:
        item = by_id.get(evidence_id)
        if item and "duplicate_candidate" in item.get("candidate_statuses", []):
            errors.append(_issue("DUPLICATE_FEATURED_PUBLICATION", f"manifest.{evidence_id}", "Duplicate candidates cannot be featured."))
    errors.extend(_evidence_field_binding_issues(public, evidence))

    identity_items = identity_review.get("publication_identity", [])
    identity_ids = {item.get("evidence_id") for item in identity_items if isinstance(item, dict)}
    if identity_ids != set(manifest_ids):
        errors.append(_issue("IDENTITY_EVIDENCE_MISMATCH", "identity.publication_identity", "Identity review must cover every Manifest Evidence ID exactly once."))

    errors.extend(_dedup_issues(evidence))

    adopted_items = [by_id[item] for item in adopted_ids if item in by_id]
    identity_by_id = {item.get("evidence_id"): item for item in identity_items if isinstance(item, dict)}
    unresolved_identity = (
        identity_review.get("review_status") != "verified"
        or bool(identity_review.get("p0_blockers"))
        or any(not item.get("identity_verified") for item in adopted_items)
        or any(identity_by_id.get(item, {}).get("identity_status") != "verified" for item in adopted_ids)
    )

    publication_identity_status = public.get("publication_identity_status")
    if unresolved_identity and publication_identity_status == "verified":
        errors.append(_issue("PUBLIC_IDENTITY_STATUS_INVALID", "$.publication_identity_status", "Unresolved adopted records cannot be labelled identity verified."))
    if not unresolved_identity and publication_identity_status != "verified":
        errors.append(_issue("PUBLIC_IDENTITY_STATUS_INVALID", "$.publication_identity_status", "Fully verified adopted records must use publication identity status verified."))

    requested_status = public.get("publication_status", "review_pending")
    effective_status = "review_pending" if unresolved_identity else requested_status
    if unresolved_identity:
        warnings.append(_issue("IDENTITY_REVIEW_PENDING", "identity", "Unresolved identity or P0 blockers force review_pending.", "warning"))
        if requested_status in PUBLIC_STATUSES:
            errors.append(_issue("PUBLICATION_STATUS_NOT_ALLOWED", "$.publication_status", "approved/published requires all identities verified and no P0 blockers."))

    if package_dir is not None and package_dir.exists():
        for file_path in sorted(package_dir.rglob("*")):
            if file_path.is_file() and file_path.suffix.lower() in {".json", ".md", ".txt"}:
                text = file_path.read_text(encoding="utf-8", errors="replace")
                if LOCAL_PATH_PATTERN.search(text):
                    errors.append(_issue("LOCAL_PATH_LEAK", str(file_path), "Local absolute path found in package file."))
                if EXPERIENCE_TEXT_PATTERN.search(text):
                    errors.append(_issue("EXPERIENCE_CONTENT_DETECTED", str(file_path), "Experience content found in package file."))
        markdown_path = package_dir / "public-advisor-v1.md"
        if markdown_path.exists():
            markdown_text = markdown_path.read_text(encoding="utf-8")
            markdown_ids = set(re.findall(r"\bE[1-9][0-9]*\b", markdown_text))
            if markdown_ids != adopted_ids:
                errors.append(_issue("MARKDOWN_EVIDENCE_ID_MISMATCH", str(markdown_path), "Generated Markdown Evidence IDs must exactly match adopted public Evidence IDs."))
            if re.search(r"web/(?:advisors\.json|reports/)|source_ref|repository_source_ref|:[0-9]+\b", markdown_text, re.IGNORECASE):
                errors.append(_issue("INTERNAL_REFERENCE_LEAK", str(markdown_path), "Internal repository references are forbidden in public Markdown."))

    unique_errors = list({(item.code, item.path, item.message): item for item in errors}.values())
    unique_warnings = list({(item.code, item.path, item.message): item for item in warnings}.values())
    valid = not unique_errors
    release_eligible = valid and effective_status in PUBLIC_STATUSES and not unresolved_identity
    return {
        "schema_version": "1.0.3",
        "advisor_id": public.get("advisor_id"),
        "valid": valid,
        "release_eligible": release_eligible,
        "requested_publication_status": requested_status,
        "effective_publication_status": effective_status,
        "candidate_evidence_count": len(manifest_ids),
        "adopted_public_evidence_count": len(adopted_ids),
        "featured_publication_count": len(featured_ids),
        "pending_version_group_count": len({item.get("version_group") for item in evidence if item.get("version_group") and "duplicate_candidate" in item.get("candidate_statuses", [])}),
        "schema_results": {
            "public_advisor": "failed" if public_schema_errors else "passed",
            "evidence_manifest": "failed" if manifest_schema_errors else "passed",
            "identity_review": "failed" if identity_schema_errors else "passed",
        },
        "schema_and_field_binding_status": "passed" if not any(item.code.startswith("SCHEMA_") or item.code == "EVIDENCE_FIELD_BINDING_MISMATCH" for item in unique_errors) else "failed",
        "errors": [asdict(item) for item in unique_errors],
        "warnings": [asdict(item) for item in unique_warnings],
    }


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate an advisor production package.")
    parser.add_argument("package_dir", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    package_dir = args.package_dir.resolve()
    report = validate_package(
        _load_json(package_dir / "public-advisor-v1.json"),
        _load_json(package_dir / "evidence-manifest-v1.json"),
        _load_json(package_dir / "identity-review-v1.json"),
        package_dir=package_dir,
    )
    output = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        args.report.write_text(output, encoding="utf-8", newline="\n")
    else:
        print(output, end="")
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
