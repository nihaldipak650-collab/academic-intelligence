from __future__ import annotations

import copy
import tempfile
import unittest
from pathlib import Path

from src.advisor_production.renderer import render_markdown
from src.advisor_production.validator import validate_package


def sourced(value: str | None, *, authority: str | None = "official_institution", missing_status: str = "available") -> dict:
    return {"value": value, "value_en": None, "source_url": "https://faculty.test.edu.cn/profile" if value else None, "source_ref": None, "source_authority": authority if value else None, "last_verified_at": "2026-07-31" if value else None, "missing_status": missing_status}


def claim(text: str, lane: str = "public_fact") -> dict:
    return {"text": text, "evidence_status": "verified", "confidence": "High", "source_urls": ["https://doi.org/10.1234/test.1"], "evidence_ids": ["E1"], "evidence_lane": lane, "no_evidence_reason": None}


def complete_public_record() -> dict:
    return {
        "schema_version":"1.0.3", "advisor_id":"test-advisor", "record_created_at":"2026-08-01", "migrated_at":None,
        "name_zh":sourced("测试导师"), "name_en":sourced("Test Advisor"), "institution":sourced("测试大学"),
        "school_or_department":sourced("生命科学学院"), "position":sourced("教授"), "public_roles":[sourced("博士生导师")],
        "contact":{"official_profile_url":sourced("https://faculty.test.edu.cn/profile"), "official_lab_url":sourced(None, authority=None, missing_status="no_public_information"), "official_email":sourced("advisor@test.edu.cn"), "official_phone":sourced(None, authority=None, missing_status="no_public_information"), "lab_address":sourced(None, authority=None, missing_status="needs_verification")},
        "research_directions_original":[claim("疾病遗传学")],
        "research_directions_plain_language":[{"term_original":"疾病遗传学", "explanation_zh":"研究遗传变异与疾病之间的关系。", "undergraduate_meaning":"可从公开数据整理入门。", "evidence_ids":["E1"], "confidence":"High", "evidence_lane":"ai_synthesis"}],
        "research_questions":[claim("哪些遗传变异与疾病机制相关？", "ai_synthesis")], "main_techniques":[claim("公开论文使用测序与功能验证方法。")], "research_workflow":[claim("从候选变异到功能验证的公开论文流程。", "ai_synthesis")],
        "adopted_public_evidence_ids":["E1"], "featured_publication_evidence_ids":["E1"], "featured_selection_status":"manually_reviewed", "featured_selection_review":{"status":"approved", "reviewed_at":"2026-08-01", "reviewer_role":"content_reviewer", "selection_criteria":["与公开研究方向直接相关"], "notes":"测试审核。"}, "publication_identity_status":"verified",
        "possible_undergraduate_tasks":[{"task":"公开数据整理", "task_context":"基于公开论文数据", "task_purpose":"理解候选变异证据链", "possible_methods":["文献整理"], "possible_output":"结构化证据表", "evidence_ids":["E1"], "confidence":"Medium", "evidence_lane":"ai_synthesis", "uncertainty_note":"仅为基于公开技术栈的可能任务，不代表实验室真实安排。"}],
        "prerequisite_skills":[claim("基础遗传学与文献阅读。", "ai_synthesis")], "learning_cost":claim("学习成本取决于任务范围，不能据公开论文推断真实时长。", "ai_synthesis"),
        "generic_growth_path":[{"stage":"foundation", "possible_activities":["学习基础遗传学"], "possible_outputs":["文献笔记"], "evidence_ids":["E1"], "confidence":"Medium", "evidence_lane":"ai_synthesis", "uncertainty_note":"通用学习场景，不代表导师官方培养方案。"}],
        "evidence_status":"verified", "confidence":"High", "public_fact_or_ai_synthesis":"mixed_labeled", "no_evidence_reason":None,
        "boundary_statement":"本页仅依据公开学术证据整理，不代表导师评价、招募承诺或真实培养安排。", "update_status":"verified",
        "summary":claim("研究公开证据集中于疾病遗传学。", "ai_synthesis"), "data_status_note":"内容和身份均已完成测试核验。",
        "search_keywords":["疾病遗传学"], "tags":["疾病遗传"], "version":"1.0.3", "publication_status":"approved", "report_path":"reports/test-advisor.md",
    }


def complete_manifest() -> dict:
    return {"schema_version":"1.0.3", "advisor_id":"test-advisor", "candidate_evidence":[{
        "evidence_id":"E1", "evidence_type":"publication", "title":"A verified publication title", "publication_year":2024,
        "doi":"10.1234/test.1", "source_type":"journal_article", "source_url":"https://doi.org/10.1234/test.1",
        "author_position":"middle", "is_co_first":False, "is_corresponding":False, "identity_verified":True,
        "candidate_statuses":["adopted"], "reason":None, "version_group":None, "repository_source_ref":"tests/fixtures/source-record.json",
        "supported_fields":["research_directions_original", "research_directions_plain_language", "research_questions", "main_techniques", "research_workflow", "possible_undergraduate_tasks", "prerequisite_skills", "learning_cost", "generic_growth_path", "summary"],
    }]}


def complete_identity_review() -> dict:
    return {"schema_version":"1.0.3", "advisor_id":"test-advisor", "review_status":"verified", "reviewed_at":"2026-07-31", "reviewer_role":"human_reviewer", "advisor_identity":{"name_match_status":"verified", "institution_match_status":"verified", "orcid_status":"verified", "candidate_orcid":"0000-0000-0000-0001", "notes":"测试身份。"}, "publication_identity":[{"evidence_id":"E1", "identity_status":"verified", "notes":"机构和论文级署名已核验。"}], "p0_blockers":[], "notes":"测试正例。"}


def pending_identity(public: dict, manifest: dict, identity: dict) -> None:
    public["publication_status"] = "review_pending"; public["publication_identity_status"] = "pending_verification"
    manifest["candidate_evidence"][0]["identity_verified"] = False; manifest["candidate_evidence"][0]["candidate_statuses"].append("identity_pending")
    identity["review_status"] = "unresolved"; identity["publication_identity"][0]["identity_status"] = "unresolved"
    identity["p0_blockers"] = [{"code":"IDENTITY_UNRESOLVED", "description":"身份未闭环。", "evidence_ids":["E1"]}]


def error_codes(report: dict) -> set[str]: return {item["code"] for item in report["errors"]}


class AdvisorProductionValidationTests(unittest.TestCase):
    def test_complete_positive_package_is_release_eligible(self):
        report = validate_package(complete_public_record(), complete_manifest(), complete_identity_review()); self.assertTrue(report["valid"], report); self.assertTrue(report["release_eligible"])

    def test_unconfirmed_identity_forces_review_pending(self):
        p,m,i = complete_public_record(),complete_manifest(),complete_identity_review(); pending_identity(p,m,i); report=validate_package(p,m,i); self.assertTrue(report["valid"],report); self.assertFalse(report["release_eligible"]); self.assertEqual(report["effective_publication_status"],"review_pending")

    def test_duplicate_doi_is_rejected(self):
        m=complete_manifest(); duplicate=copy.deepcopy(m["candidate_evidence"][0]); duplicate.update(evidence_id="E2",doi="https://doi.org/10.1234/TEST.1",candidate_statuses=["candidate"]); m["candidate_evidence"].append(duplicate); i=complete_identity_review(); i["publication_identity"].append({"evidence_id":"E2","identity_status":"verified","notes":"测试"}); self.assertIn("DUPLICATE_DOI",error_codes(validate_package(complete_public_record(),m,i)))

    def test_unlinked_preprint_and_formal_version_is_rejected(self):
        m=complete_manifest(); pre=copy.deepcopy(m["candidate_evidence"][0]); pre.update(evidence_id="E2",title="A verified publication title (preprint)",doi="10.1234/test.preprint",source_url="https://doi.org/10.1234/test.preprint",source_type="preprint",candidate_statuses=["candidate"]); m["candidate_evidence"].append(pre); i=complete_identity_review(); i["publication_identity"].append({"evidence_id":"E2","identity_status":"verified","notes":"测试"}); self.assertIn("UNLINKED_PUBLICATION_VERSION",error_codes(validate_package(complete_public_record(),m,i)))

    def test_manifest_missing_required_author_role_is_rejected(self):
        m=complete_manifest(); del m["candidate_evidence"][0]["author_position"]; self.assertIn("MANIFEST_REQUIRED",error_codes(validate_package(complete_public_record(),m,complete_identity_review())))

    def test_adopted_evidence_mismatch_is_rejected(self):
        p=complete_public_record(); p["adopted_public_evidence_ids"].append("E2"); self.assertIn("ADOPTED_EVIDENCE_MISSING",error_codes(validate_package(p,complete_manifest(),complete_identity_review())))

    def test_generated_markdown_evidence_ids_must_match_adopted(self):
        with tempfile.TemporaryDirectory() as d:
            Path(d,"public-advisor-v1.md").write_text("# Test\n\nOnly [E99] is present.\n",encoding="utf-8"); report=validate_package(complete_public_record(),complete_manifest(),complete_identity_review(),package_dir=Path(d))
        self.assertIn("MARKDOWN_EVIDENCE_ID_MISMATCH",error_codes(report))

    def test_manifest_must_declare_each_supported_public_field(self):
        m=complete_manifest(); m["candidate_evidence"][0]["supported_fields"].remove("summary"); self.assertIn("EVIDENCE_FIELD_BINDING_MISMATCH",error_codes(validate_package(complete_public_record(),m,complete_identity_review())))

    def test_publication_status_cannot_bypass_identity_gate(self):
        p,m,i=complete_public_record(),complete_manifest(),complete_identity_review(); pending_identity(p,m,i); p["publication_status"]="approved"; report=validate_package(p,m,i); self.assertIn("PUBLICATION_STATUS_NOT_ALLOWED",error_codes(report))

    def test_experience_content_is_rejected(self):
        p=complete_public_record(); p["student_experience"]="访谈中的学生经历"; self.assertIn("EXPERIENCE_CONTENT_DETECTED",error_codes(validate_package(p,complete_manifest(),complete_identity_review())))

    def test_three_missing_states_are_distinct_and_valid(self):
        p=complete_public_record(); p["research_questions"]=[{"text":"暂无可靠公开证据", "evidence_status":"no_reliable_public_evidence", "confidence":"No Evidence", "source_urls":[], "evidence_ids":[], "evidence_lane":"ai_synthesis", "no_evidence_reason":"现有公开材料不足以支持该分析。"}]; report=validate_package(p,complete_manifest(),complete_identity_review()); self.assertTrue(report["valid"],report)

    def test_markdown_rendering_is_byte_deterministic_and_localized(self):
        first=render_markdown(complete_public_record(),complete_manifest()); second=render_markdown(complete_public_record(),complete_manifest()); self.assertEqual(first.encode(),second.encode()); self.assertIn("| 中间作者 | 否 | 否 |",first); self.assertNotIn("middle",first); self.assertTrue(first.endswith("\n"))

    def test_local_absolute_path_is_rejected(self):
        p=complete_public_record(); p["summary"]["text"]=r"证据文件位于 C:\Users\researcher\private.txt"; self.assertIn("LOCAL_PATH_LEAK",error_codes(validate_package(p,complete_manifest(),complete_identity_review())))

    def test_non_official_contact_source_is_rejected(self):
        p=complete_public_record(); p["contact"]["official_email"]["source_authority"]="publication"; self.assertIn("NON_OFFICIAL_CONTACT_SOURCE",error_codes(validate_package(p,complete_manifest(),complete_identity_review())))


if __name__ == "__main__": unittest.main()
