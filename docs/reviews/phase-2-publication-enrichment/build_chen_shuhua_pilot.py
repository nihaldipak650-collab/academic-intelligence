"""Reproducibly build the Chen Shuhua publication-enrichment Pilot.

This script is intentionally scoped to one advisor package and the Pilot review
artifacts. It does not touch schemas, production assets, or other advisors.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
PACKAGE = ROOT / "data" / "advisors-v1" / "chen-shuhua"
REVIEW = ROOT / "docs" / "reviews" / "phase-2-publication-enrichment"
VERIFIED_AT = "2026-09-10"
OFFICIAL_URL = "https://life.csu.edu.cn/info/1042/2536.htm"
ORCID = "0000-0003-2373-3402"


PUBLICATIONS = [
    # Five publications explicitly listed by the official profile.
    dict(id="E2", title="Research progress of endothelial-mesenchymal transition in diabetic kidney disease.", doi="10.1111/jcmm.17356", year=2022, position="last", kind="review", status="adopted", identity="verified", affiliation="Department of Biochemistry and Molecular Biology, School of Life Sciences, Central South University", orcid=ORCID, pmid="35560773", reason="Official profile representative-publication list; DOI and PubMed author metadata agree."),
    dict(id="E3", title="Glucolipotoxicity induces endothelial cell dysfunction by activating autophagy and inhibiting autophagic flow.", doi="10.1177/14791641221102513", year=2022, position="middle", kind="journal_article", status="adopted", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences, Central South University", pmid="35549572", reason="Official profile representative-publication list; DOI and PubMed author metadata agree."),
    dict(id="E4", title="Vildagliptin improves high glucose-induced endothelial mitochondrial dysfunction via inhibiting mitochondrial fission.", doi="10.1111/jcmm.13975", year=2019, position="middle", kind="journal_article", status="adopted", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences, Central South University", pmid="30444033", reason="Official profile representative-publication list; DOI and PubMed author metadata agree."),
    dict(id="E5", title="S1PR2 antagonist ameliorate high glucose-induced fission and dysfunction of mitochondria in HRGECs via regulating ROCK1.", doi="10.1186/s12882-019-1323-0", year=2019, position="middle", kind="journal_article", status="adopted", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="30999892", reason="Official profile representative-publication list; DOI and PubMed author metadata agree."),
    dict(id="E6", title="NK1.1+ cells promote sustained tissue injury and inflammation after trauma with hemorrhagic shock.", doi="10.1189/jlb.3a0716-333r", year=2017, position="first", kind="journal_article", status="adopted", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences, Central South University", pmid="28515228", reason="Official profile representative-publication list; DOI and PubMed author metadata agree."),
    # Second ORCID-bearing publication closes a two-record ORCID chain.
    dict(id="E7", title="Quercetin Alleviates Endothelial Dysfunction in Atherosclerosis by Inhibiting Ferroptosis Through PACS2/HMOX-1 Pathway.", doi="10.1142/s0192415x26500229", year=2026, position="middle", kind="journal_article", status="adopted", identity="verified", affiliation="Central South University", full_affiliation="Department of Biochemistry and Molecular Biology, School of Life Sciences, Central South University", orcid=ORCID, pmid="41692703", reason="Exact ORCID, current department, topic, and coauthor network agree across DOI and PubMed metadata."),
    # Identity-verified discovery candidates retained for Owner selection, not adopted.
    dict(id="E8", title="PACS2 deficiency ameliorates hepatic steatosis via inhibition of the JNK signaling pathway in diabetic mice.", doi="10.1016/j.bcp.2026.117794", year=2026, position="last", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry and Molecular Biology, School of Life Sciences, Central South University", email="shuhuachen@csu.edu.cn", pmid="41687826", reason="Exact official email and current department in PubMed metadata."),
    dict(id="E9", title="Macrophage FTO deficiency accelerates atherosclerosis via PACS2-mediated activation of the PPARγ lipid signaling pathway.", doi="10.1186/s12967-026-08076-3", year=2026, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="41917949", reason="Current department, vascular topic, and established PACS2/coauthor cluster agree."),
    dict(id="E10", title="Association of the atherogenic index of plasma combined with obesity indices with cardiovascular disease and mortality.", doi="10.1186/s12944-026-02932-3", year=2026, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences, Central South University", pmid="41851760", reason="Current department, vascular topic, and established coauthor cluster agree."),
    dict(id="E11", title="PACS2 initiates foam cell formation in macrophages through the ROS-PPARγ-CD36 positive feedback loop.", doi="10.1016/j.bcp.2025.117164", year=2025, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="40653022", reason="Current department and established PACS2/vascular coauthor cluster agree."),
    dict(id="E12", title="SRSF3 Inhibits High Glucose and Palmitic Acid-Induced Cardiomyocyte Apoptosis Through the PI3K/AKT and NF-κB Pathways.", doi="10.1002/jbt.70395", year=2025, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="40631627", reason="Current department and established high-glucose/cardiovascular coauthor cluster agree."),
    dict(id="E13", title="S1PR2 Mediates Smooth Muscle Cell Proliferation and Endothelial Cell Permeability via Akt/mTOR and RhoA/ROCK1 in Atherosclerosis.", doi="10.1002/jbt.70351", year=2025, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="40495705", reason="Current department and established S1PR2/vascular coauthor cluster agree."),
    dict(id="E14", title="S1PR3 in hippocampal neurons improves synaptic plasticity and decreases depressive behavior via downregulation of RhoA/ROCK1.", doi="10.1016/j.pnpbp.2025.111256", year=2025, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="39828081", reason="Current department and established S1PR/RhoA/ROCK1 coauthor cluster agree; topical shift retained for Owner review."),
    dict(id="E15", title="PACS2/CPT1A/DHODH signaling promotes cardiomyocyte ferroptosis in diabetic cardiomyopathy.", doi="10.1186/s12933-024-02514-6", year=2024, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="39633391", reason="Current department and established PACS2/cardiovascular coauthor cluster agree."),
    dict(id="E16", title="S1PR1 suppresses lung adenocarcinoma progression through p-STAT1/miR-30c-5p/FOXA1 pathway.", doi="10.1186/s13046-024-03230-5", year=2024, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="39551792", reason="Current department and established S1PR coauthor cluster agree; cancer topic retained for Owner review."),
    dict(id="E17", title="Associations between Life's Essential 8 and abdominal aortic calcification among US Adults: a cross-sectional study.", doi="10.1186/s12889-024-18622-7", year=2024, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences, Central South University", pmid="38641579", reason="Current department and cardiovascular topic agree; observational-method shift retained for Owner review."),
    dict(id="E18", title="Association of the triglyceride-glucose index with all-cause and cardiovascular mortality in patients with cardiometabolic syndrome: a national cohort study.", doi="10.1186/s12933-024-02152-y", year=2024, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences, Central South University", pmid="38402393", reason="Current department and cardiovascular topic agree; observational-method shift retained for Owner review."),
    dict(id="E19", title="S1PR2/Wnt3a/RhoA/ROCK1/β-catenin signaling pathway promotes diabetic nephropathy by inducting endothelial mesenchymal transition and impairing endothelial barrier function.", doi="10.1016/j.lfs.2023.121853", year=2023, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="37307963", reason="Current department and established S1PR2/EndMT coauthor cluster agree."),
    dict(id="E20", title="S1PR1 attenuates pulmonary fibrosis by inhibiting EndMT and improving endothelial barrier function.", doi="10.1016/j.pupt.2023.102228", year=2023, position="middle", kind="journal_article", status="candidate", identity="verified", affiliation="Department of Biochemistry, School of Life Sciences of Central South University", pmid="37295666", reason="Current department and established S1PR1/EndMT coauthor cluster agree."),
    # Explicit negative controls from the broad name query.
    dict(id="E21", title="Resective Surgery for Drug-Resistant Epilepsy in Patients With Tuberous Sclerosis Complex: A Prospective Nationwide Multicenter Cohort Study.", doi="10.1212/wnl.0000000000214260", year=2025, position="middle", kind="journal_article", status="excluded", identity="conflict", affiliation="Neurology Department, Beijing Children's Hospital, Capital Medical University", pmid="41100778", reason="Same-name author belongs to a different institution, department, field, and coauthor network."),
    dict(id="E22", title="Oncogenic super-enhancer formation in tumorigenesis and its molecular mechanisms.", doi="10.1038/s12276-020-0428-7", year=2020, position="middle", kind="review", status="excluded", identity="conflict", affiliation="Department of Otolaryngology, The Second People's Hospital of Foshan", pmid="32382065", reason="Same-name author belongs to a different institution and clinical department."),
    # Plausible historical record, but author-level affiliation/identity cannot be closed.
    dict(id="E23", title="MEF2A gene and susceptibility to coronary artery disease in the Chinese people.", doi=None, year=2006, position="middle", kind="journal_article", status="identity_pending", identity="unresolved", affiliation=None, pmid="16951497", reason="Topic and some record-level CSU context are plausible, but the target author lacks a directly closed affiliation, email, or ORCID."),
]


def source_url(item: dict) -> str:
    return f"https://doi.org/{item['doi']}" if item["doi"] else f"https://pubmed.ncbi.nlm.nih.gov/{item['pmid']}/"


def manifest_record(item: dict) -> dict:
    url = source_url(item)
    verified = item["identity"] == "verified"
    return {
        "evidence_id": item["id"],
        "evidence_type": "publication",
        "source_url": url,
        "source_authority": "publication",
        "candidate_statuses": ([item["status"], "identity_pending"] if item["identity"] == "conflict" else [item["status"]]),
        "reason": item["reason"],
        "supported_fields": [
            "name_en",
            "research_directions_plain_language",
            "research_questions",
            "main_techniques",
            "research_workflow",
            "possible_undergraduate_tasks",
            "prerequisite_skills",
            "learning_cost",
            "generic_growth_path",
            "summary",
        ],
        "repository_source_ref": f"evidence-manifest-v1.json#{item['id']}",
        "last_verified_at": VERIFIED_AT,
        "notes": f"PubMed PMID {item['pmid']}; {item['reason']} Candidate status is not a featured or release decision.",
        "title": item["title"],
        "publication_year": item["year"],
        "doi": item["doi"],
        "source_type": item["kind"],
        "author_position": item["position"],
        "is_co_first": None,
        "is_corresponding": None,
        "identity_verified": verified,
        "version_group": None,
        "publication_types": [item["kind"]],
        "publication_affiliations": ([item["affiliation"], item["full_affiliation"]] if item.get("full_affiliation") else ([item["affiliation"]] if item["affiliation"] else None)),
        "publication_affiliation_source_url": url if item["affiliation"] else None,
    }


def identity_record(item: dict) -> dict:
    url = source_url(item)
    verified = item["identity"] == "verified"
    basis = [item["reason"]]
    if item["status"] == "adopted" and item["id"] in {"E2", "E3", "E4", "E5", "E6"}:
        basis.append("The official CSU profile explicitly lists this title among representative publications.")
    if item.get("orcid"):
        basis.append("The publication record carries the exact candidate ORCID.")
    if verified and item.get("affiliation"):
        basis.append("The publication-time affiliation is recorded separately and matches the documented career context.")
    return {
        "evidence_id": item["id"],
        "identity_status": item["identity"],
        "verification_basis": basis,
        "matched_author_name": "Shuhua Chen" if verified else ("Shuhua Chen" if item["identity"] == "conflict" else "Shu-hua Chen"),
        "matched_institution": item["affiliation"],
        "matched_institution_source_url": url if item["affiliation"] else None,
        "matched_author_email": item.get("email"),
        "matched_author_email_source_url": url if item.get("email") else None,
        "matched_orcid": item.get("orcid"),
        "orcid_source_url": url if item.get("orcid") else None,
        "notes": item["reason"],
    }


def sourced_name_en() -> dict:
    return {
        "value": "Shuhua Chen",
        "value_en": "Shuhua Chen",
        "source_url": source_url(PUBLICATIONS[0]),
        "source_ref": "evidence-manifest-v1.json#E2",
        "source_authority": "publication",
        "last_verified_at": VERIFIED_AT,
        "missing_status": "available",
    }


def claim(text: str, ids: list[str], lane: str = "ai_synthesis", confidence: str = "Medium") -> dict:
    urls = [source_url(next(item for item in PUBLICATIONS if item["id"] == evidence_id)) if evidence_id != "E1" else OFFICIAL_URL for evidence_id in ids]
    return {
        "text": text,
        "evidence_status": "partially_verified" if lane == "ai_synthesis" else "verified",
        "confidence": confidence,
        "source_urls": urls,
        "evidence_ids": ids,
        "evidence_lane": lane,
        "no_evidence_reason": None,
    }


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def main() -> None:
    owner_decision = REVIEW / "OWNER_PUBLICATION_DECISIONS_2026-09-10.json"
    if owner_decision.exists():
        raise RuntimeError(
            "Owner publication decisions are already applied; refusing to run the historical "
            "pre-Owner pilot builder. Use apply_owner_publication_decisions.py for audited writeback."
        )
    public_path = PACKAGE / "public-advisor-v1.json"
    manifest_path = PACKAGE / "evidence-manifest-v1.json"
    identity_path = PACKAGE / "identity-review-v1.json"
    public = json.loads(public_path.read_text(encoding="utf-8"))
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    identity = json.loads(identity_path.read_text(encoding="utf-8"))

    manifest["source_scope"] = "中南大学官方导师主页、官方代表论文列表、DOI/publisher 与 PubMed 元数据；仅用于本地 publication enrichment 人工审核包。"
    manifest["candidate_evidence"] = [manifest["candidate_evidence"][0]] + [manifest_record(item) for item in PUBLICATIONS]

    public["name_en"] = sourced_name_en()
    public["adopted_public_evidence_ids"] = ["E1", "E2", "E3", "E4", "E5", "E6", "E7"]
    public["featured_publication_evidence_ids"] = []
    public["featured_selection_status"] = "pending_manual_review"
    public["featured_selection_review"] = {
        "status": "pending",
        "reviewed_at": None,
        "reviewer_role": None,
        "selection_criteria": [],
        "notes": "已生成独立 FEATURED_CANDIDATE_SHORTLIST，但 Owner 尚未人工选择；不得视为正式精选。",
    }
    public["publication_identity_status"] = "verified"
    public["research_questions"] = [
        claim("公开方向与已核验论文共同支持关注高糖/糖尿病环境下的内皮损伤、EndMT、线粒体动力学及血管屏障机制；具体当前项目仍需向导师确认。", ["E1", "E2", "E3", "E4", "E5"]),
        claim("从已核验论文可归纳出创伤失血后的持续性炎症与组织损伤，以及PACS2/铁死亡相关血管机制；这不等于当前全部在研方向。", ["E6", "E7"]),
    ]
    public["main_techniques"] = [
        claim("论文支持的公开方法线索包括细胞与分子生物学实验、内皮功能与线粒体功能检测、自噬通量分析及动物/疾病模型；具体平台条件需项目确认。", ["E3", "E4", "E5", "E6", "E7"]),
        claim("官方主页另明确提及生物信息学和临床医学结合；其在当前具体项目中的使用范围不能由这些论文单独确定。", ["E1"], confidence="Low"),
    ]
    public["research_workflow"] = [
        claim("可从疾病或炎症表型出发，提出候选通路，使用细胞/动物模型与分子指标验证，再把机制结果与血管功能表型对照；这是对已核验论文的流程性归纳。", ["E3", "E4", "E5", "E6", "E7"]),
    ]
    public["possible_undergraduate_tasks"] = [
        {
            "task": "建立已核验论文的机制—模型—指标证据矩阵",
            "task_context": "围绕EndMT、自噬、线粒体动力学、S1PR2/ROCK1或PACS2/铁死亡等已公开主题，区分论文事实与跨论文归纳。",
            "task_purpose": "练习文献证据闭合、方法分类和不确定性标注。",
            "possible_methods": ["结构化文献摘录", "DOI与作者身份复核", "机制图与证据矩阵"],
            "possible_output": "一份带Evidence ID、原始来源和限制说明的研究证据表",
            "evidence_ids": ["E2", "E3", "E4", "E5", "E6", "E7"],
            "confidence": "Low",
            "evidence_lane": "ai_synthesis",
            "uncertainty_note": "这是根据公开方向与已核验论文设计的任务类型示例，不代表导师已提供该本科任务、名额、培养安排或结果保证；实际任务必须向导师确认。",
        }
    ]
    public["summary"] = claim("根据官方主页与六篇采用论文，可概括为：陈淑华是中南大学生命科学学院教授、硕士生导师，研究炎症与血管疾病机制；这些采用论文的作者身份已由官方代表论文列表或ORCID、发表时机构、邮箱与共作者网络闭合。其余候选、排除项和歧义项保留在审计材料中，精选论文仍待Owner人工决定。", ["E1", "E2", "E3", "E4", "E5", "E6", "E7"])
    public["boundary_statement"] = "官方身份与原始研究方向属于PUBLIC FACT；论文题名、作者位置、发表时机构和采用决定由E2-E7支撑；研究问题、技术路线和本科任务属于明确标注的AI SYNTHESIS。候选论文不等于采用、精选或公开发布，不推断当前招生、在研项目、实验室氛围、带教方式、疗效或结果承诺。"
    public["data_status_note"] = "Publication enrichment Pilot：发现22篇候选；采用6篇、保留13篇identity-verified候选、排除2篇同名错配、1篇身份未决。采用论文身份为verified；人工身份审核与featured选择仍pending，publication_status保持review_pending。"
    public["evidence_status"] = "partially_verified"
    public["confidence"] = "Medium"
    public["update_status"] = "partially_verified"
    public["publication_status"] = "review_pending"

    identity["review_status"] = "unresolved"
    identity["reviewed_at"] = None
    identity["reviewer_role"] = "codex_mechanical_migration"
    identity["advisor_identity"].update({
        "orcid_status": "verified",
        "candidate_orcid": ORCID,
        "human_review_status": "pending",
        "notes": "官方身份字段已机械核对；两篇论文记录携带同一ORCID并至少一篇闭合当前中南大学生命科学学院身份。人工审核仍pending。",
        "orcid_verification_evidence_ids": ["E2", "E7"],
        "orcid_verification_basis": [
            "E2与E7的正式论文元数据均为作者Shuhua/Shu-Hua Chen提供ORCID 0000-0003-2373-3402。",
            "两篇均记录中南大学生命科学学院发表时机构，研究主题与官方方向及长期共作者网络一致。",
            "ORCID记录本身未提供足够完整的公开任职/作品列表，因此结论依赖逐论文闭合而非ORCID页面单点。",
        ],
    })
    identity["publication_identity"] = [identity_record(item) for item in PUBLICATIONS]
    identity["p0_blockers"] = [{
        "code": "HUMAN_IDENTITY_REVIEW_PENDING",
        "description": "人工审核尚未完成；机器完成的论文身份闭合不能替代Owner批准。",
        "evidence_ids": ["E1", "E2", "E7"],
    }]
    identity["notes"] = "Pilot逐篇保留verified、conflict与unresolved结论；OpenAlex同名实体存在错误合并和碎片化，未作为单点授予verified的依据。"

    write_json(public_path, public)
    write_json(manifest_path, manifest)
    write_json(identity_path, identity)

    ledger_path = REVIEW / "publication_identity_ledger.csv"
    fields = ["advisor_id", "publication_candidate_id", "title", "doi", "year", "candidate_source", "candidate_author_id", "author_name", "affiliation", "orcid", "identity_status", "identity_evidence", "counterevidence", "decision", "adopted_evidence_id", "duplicate_group", "version_relation", "review_required", "notes"]
    with ledger_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for item in PUBLICATIONS:
            writer.writerow({
                "advisor_id": "chen-shuhua",
                "publication_candidate_id": item["id"],
                "title": item["title"],
                "doi": item["doi"] or "",
                "year": item["year"],
                "candidate_source": f"PubMed PMID {item['pmid']}; Crossref/DOI when DOI exists; official profile for E2-E6",
                "candidate_author_id": f"ORCID:{ORCID}" if item.get("orcid") else "PUBMED_NAME_AFFILIATION_CLUSTER",
                "author_name": "Shuhua Chen",
                "affiliation": item["affiliation"] or "",
                "orcid": item.get("orcid") or "",
                "identity_status": item["identity"],
                "identity_evidence": item["reason"],
                "counterevidence": "Different institution/field/network" if item["identity"] == "conflict" else ("No author-level affiliation, email, or ORCID" if item["identity"] == "unresolved" else "None found in reviewed records"),
                "decision": item["status"],
                "adopted_evidence_id": item["id"] if item["status"] == "adopted" else "",
                "duplicate_group": "",
                "version_relation": "canonical journal record; no linked preprint identified",
                "review_required": "yes",
                "notes": "Featured selection remains pending_manual_review.",
            })


if __name__ == "__main__":
    main()
