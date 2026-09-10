"""Build the seven post-Pilot publication-enrichment packages.

Every fact below is advisor-local. Shared code only serializes the same v1.0.6
shape; it does not copy identity conclusions across advisors.
"""

from __future__ import annotations

import csv
import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DATA_ROOT = ROOT / "data" / "advisors-v1"
REVIEW = ROOT / "docs" / "reviews" / "phase-2-publication-enrichment"
DATE = "2026-09-10"


def p(eid, title, doi, year, pos, status="adopted", identity="verified", aff="Central South University", orcid=None, email=None, kind="journal_article", pmid=None, reason=""):
    return dict(id=eid, title=title, doi=doi, year=year, pos=pos, status=status, identity=identity, aff=aff, orcid=orcid, email=email, kind=kind, pmid=pmid, reason=reason)


ADVISORS = {
    "deng-meichun": {
        "name_en": "Meichun Deng", "query_count": 38, "orcid": "0000-0002-3558-1314", "orcid_state": "verified", "chain": ["E8", "E11"],
        "papers": [
            p("E2","SETD2 deficiency in peripheral sensory neurons induces allodynia by promoting NMDA receptor expression through NFAT5 in rodent models.","10.1016/j.ijbiomac.2024.136767",2024,"last",pmid="39476923",email="dengmch@csu.edu.cn",reason="Official representative list plus PubMed DOI, author and current affiliation."),
            p("E3","Overactive PKA signaling underlies the hyperalgesia in an ADHD mouse model.","10.1016/j.isci.2024.111110",2024,"middle",pmid="39507260",reason="Official representative list plus PubMed DOI, author and current affiliation."),
            p("E4","Spider venom-derived peptide JZTX-14 prevents migration and invasion of breast cancer cells via inhibition of sodium channels.","10.3389/fphar.2023.1067665",2023,"last",pmid="37033662",reason="Official representative list plus PubMed DOI, author and current affiliation."),
            p("E5","Comparison of cardiovascular outcomes and cardiometabolic risk factors between patients with type 2 diabetes treated with sodium-glucose cotransporter-2 inhibitors and dipeptidyl peptidase-4 inhibitors: a meta-analysis.","10.1093/eurjpc/zwab099",2022,"last",kind="meta_analysis",pmid="34136913",reason="Official representative list plus PubMed DOI, author and current affiliation."),
            p("E6","α2δ-1-Bound N-Methyl-D-aspartate Receptors Mediate Morphine-induced Hyperalgesia and Analgesic Tolerance by Potentiating Glutamatergic Input in Rodents.","10.1097/aln.0000000000002648",2019,"first",aff="University of Texas MD Anderson Cancer Center",pmid="30839350",reason="Official representative list plus PubMed DOI and publication-time MD Anderson/CSU career affiliation."),
            p("E7","Molecular Basis of the Inhibition of Voltage-Gated Potassium Channel Kv1.1 by Chinese Tarantula Peptide Huwentoxin-XI.","10.3390/toxins18030124",2026,"last",status="candidate",pmid="41893546",reason="Exact current department and established peptide/channel network; retained for Owner selection."),
            p("E8","High-dose polystyrene nanoparticles trigger aberrant activation of the MAPK pathway in spinal cord and pain hypersensitivity.","10.1186/s12951-026-04186-8",2026,"last",status="candidate",orcid="0000-0002-3558-1314",email="dengmch@csu.edu.cn",pmid="41772688",reason="Exact ORCID, official email and current department."),
            p("E9","Spider-derived peptide LCTx-F2 suppresses ASIC channels by occupying the acidic pocket.","10.1016/j.jbc.2025.108286",2025,"middle",status="candidate",pmid="39938802",reason="Exact current department and established peptide/channel coauthor network."),
            p("E10","New advances in Nrf2-mediated analgesic drugs.","10.1016/j.phymed.2022.154598",2023,"last",status="candidate",kind="review",email="dengmch@csu.edu.cn",pmid="36603339",reason="Official email, current department and pain topic agree."),
            p("E11","Structure and Function of Sodium Channel Nav1.3 in Neurological Disorders.","10.1007/s10571-022-01211-w",2023,"last",status="candidate",kind="review",orcid="0000-0002-3558-1314",email="dengmch@csu.edu.cn",pmid="35332400",reason="Exact ORCID, official email and current department."),
        ]},
    "deng-suixin": {
        "name_en": "Suixin Deng", "query_count": 8, "orcid": "0000-0003-4795-2570", "orcid_state": "verified", "chain": ["E3", "E4", "E5", "E7"],
        "papers": [
            p("E2","Knockout of Bmal1 in dopaminergic neurons induces ADHD-like symptoms via hyperactive dopamine signaling in male mice.","10.1186/s12993-025-00287-w",2025,"last",email="sxdeng@csu.edu.cn",pmid="40646562",reason="Official representative list plus official email and current affiliation."),
            p("E3","Deep brain stimulation alleviates Parkinsonian motor deficits through desynchronizing GABA release in mice.","10.1038/s41467-025-59113-6",2025,"middle",orcid="0000-0003-4795-2570",email="sxdeng@csu.edu.cn",pmid="40253429",reason="Official representative list plus exact ORCID, email and current affiliation."),
            p("E4","GDF11 slows excitatory neuronal senescence and brain ageing by repressing p21.","10.1038/s41467-023-43292-1",2023,"middle",aff="Fudan University",orcid="0000-0003-4795-2570",pmid="37978295",reason="Official representative list plus exact ORCID and publication-time Fudan affiliation."),
            p("E5","Human antimicrobial peptide LL-37 contributes to Alzheimer's disease progression.","10.1038/s41380-022-01790-6",2022,"middle",aff="Fudan University",orcid="0000-0003-4795-2570",pmid="36138130",reason="Official representative list plus exact ORCID and publication-time Fudan affiliation."),
            p("E6","Regulation of Recurrent Inhibition by Asynchronous Glutamate Release in Neocortex.","10.1016/j.neuron.2019.10.038",2020,"first",aff="Beijing Normal University",pmid="31806492",reason="Official representative list plus PubMed DOI, first-author position and publication-time BNU affiliation."),
            p("E7","Increased activity of DRD1-MSNs in dorsolateral striatum underlies Cry1Δ11 mutation-induced repetitive behaviors.","10.1038/s41398-026-04219-8",2026,"last",status="candidate",orcid="0000-0003-4795-2570",email="sxdeng@csu.edu.cn",pmid="42443162",reason="Exact ORCID, official email and current affiliation."),
            p("E8","Evidence supporting the role of GIGYF2 in synapse development and autism.","10.1038/s41380-026-03681-6",2026,"middle",status="candidate",pmid="42297935",reason="Exact current unit and official neurodevelopment direction; retained as candidate."),
            p("E9","Spindle neurons in human cortex possess distinctive firing properties and transcriptomic signatures.","10.1038/s41467-026-72935-2",2026,"middle",status="candidate",pmid="42120382",reason="Exact current unit and coherent neuroscience network; retained as candidate."),
        ]},
    "duan-ranhui": {
        "name_en": "Ranhui Duan", "query_count": 63, "orcid": "0000-0001-7117-4487", "orcid_state": "verified", "chain": ["E2", "E3"],
        "papers": [
            p("E2","Modulating CCTG repeat expansion toxicity in DM2 Drosophila model through TDP1 inhibition.","10.1038/s44321-025-00217-3",2025,"last",orcid="0000-0001-7117-4487",email="duanranhui@sklmg.edu.cn",pmid="40133672",reason="Official representative list plus exact ORCID, email and current affiliation."),
            p("E3","Eg5 UFMylation promotes spindle organization during mitosis.","10.1038/s41419-024-06934-w",2024,"last",orcid="0000-0001-7117-4487",email="duanranhui@sklmg.edu.cn",pmid="39085203",reason="Official representative list plus exact ORCID, email and current affiliation; formal article selected over preprint 10.21203/rs.3.rs-3754446/v1."),
            p("E4","Strategic Implementation of Fragile X Carrier Screening in China: A Focused Pilot Study.","10.1016/j.jmoldx.2024.06.005",2024,"last",email="duanranhui@sklmg.edu.cn",pmid="39032823",reason="Official representative list plus official email and current affiliation."),
            p("E5","Loss of Drosophila NUS1 results in cholesterol accumulation and Parkinson's disease-related neurodegeneration.","10.1096/fj.202200212r",2022,"last",pmid="35695805",reason="Official representative list plus current affiliation and Drosophila disease-model continuity."),
            p("E6","Assessment of GGC Repeat Expansion in GIPC1 in Patients with Parkinson's Disease.","10.1002/mds.29041",2022,"middle",pmid="35521937",reason="Official representative list plus current medical-genetics affiliation."),
            p("E7","FYN, a Novel Target of Fragile X Mental Retardation Protein, Potentially Underlies ERK1/2 Hyperactivation in Fragile X Syndrome.","10.1007/s12035-026-06115-0",2026,"middle",status="candidate",pmid="42557527",reason="Exact current unit and fragile-X topic."),
            p("E8","Integrator subunit IntS11 orchestrates the temporal dynamics of neural lineage progression in Drosophila.","10.1186/s13578-026-01578-z",2026,"last",status="candidate",email="duanranhui@sklmg.edu.cn",pmid="42035222",reason="Official email, current unit and Drosophila network."),
            p("E9","Plasma p-tau species are elevated in presymptomatic and symptomatic neuronal intranuclear inclusion disease.","10.1016/j.ebiom.2026.106127",2026,"middle",status="candidate",pmid="41539185",reason="Exact current unit and repeat-expansion neurodegeneration context."),
            p("E10","Genome-wide modulation of alternative splicing by a predicted alpha helix in U2AF2.","10.1093/nar/gkaf1347",2025,"middle",status="candidate",pmid="41404809",reason="Exact current unit and molecular-genetics network."),
            p("E11","UBA5 missense variants disrupt UFM1 activation: Structural, dynamic, and functional dissection.","10.1016/j.ijbiomac.2025.149540",2026,"last",status="candidate",email="duanranhui@sklmg.edu.cn",pmid="41360240",reason="Official email and current unit."),
        ]},
    "fan-liangliang": {
        "name_en": "Liang-Liang Fan", "query_count": 117, "orcid": "0000-0001-7431-1838", "orcid_state": "unresolved", "chain": [],
        "papers": [
            p("E2","Loss of RTN3 phenocopies chronic kidney disease and results in activation of the IGF2-JAK2 pathway in proximal tubular epithelial cells.","10.1038/s12276-022-00763-7",2022,"first",pmid="35596061",reason="Official representative list plus first-author position and publication-time CSU affiliations."),
            p("E3","Haploinsufficiency of syncoilin leads to hypertrophic cardiomyopathy.","10.1016/j.gendis.2022.02.011",2022,"first",pmid="36157493",reason="Official representative list plus first-author position and publication-time CSU affiliations."),
            p("E4","Reticulon 3 regulates sphingosine-1-phosphate synthesis in endothelial cells to control blood pressure.","10.1002/mco2.480",2024,"middle",orcid="0000-0001-7431-1838",pmid="38352050",reason="Official representative list plus exact ORCID and current affiliation."),
            p("E5","Lipin3 deficiency promotes hepatocyte ferroptosis and pyroptosis via activating JAK1-STAT3 pathway during acetaminophen induced acute liver injury.","10.1186/s43556-025-00317-z",2025,"last",email="swfanliangliang@csu.edu.cn",pmid="41071519",reason="Official representative list plus official email and current affiliation."),
            p("E6","Lipin3 deficiency aggravates cisplatin induced acute kidney injury via activating Sirt1-p21-Caspase 3-GSDME pyroptosis pathway.","10.7150/ijbs.110125",2025,"middle",pmid="40959286",reason="Official representative list plus current affiliation and Lipin3 coauthor continuity."),
            p("E7","Novel MORC2 variants in Charcot-Marie-Tooth disease type 2Z: genetic and functional insights.","10.3389/fmed.2026.1864944",2026,"middle",status="candidate",pmid="42656289",reason="Exact current cell-biology unit and medical-genetics topic."),
            p("E8","Clinical and immunological features of a patient exhibiting delayed puberty, microcephaly, scoliosis and epilepsy caused by a novel mutation in IGSF10.","10.3389/fcell.2026.1816964",2026,"middle",status="candidate",pmid="42597489",reason="Exact current cell-biology unit and medical-genetics topic."),
            p("E9","Effects of Thap6 gene knockout on emotional and social behaviors in mice.","10.11817/j.issn.1672-7347.2026.260005",2026,"middle",status="candidate",pmid="42565575",reason="Exact current unit and model-organism method."),
            p("E10","A novel mutation in SETD1A is associated with early-onset epilepsy-a rare case report.","10.3389/fnins.2026.1864983",2026,"middle",status="candidate",pmid="42495272",reason="Exact current unit and medical-genetics topic."),
            p("E11","Whole exome sequencing identified a novel compound heterozygous mutation of nephrocystin 4 in a child with nephronophthisis-a rare case report.","10.3389/fped.2026.1864993",2026,"middle",status="candidate",pmid="42483414",reason="Exact current unit and renal-genetics topic."),
        ]},
    "guo-yi": {
        "name_en": "Yi Guo", "query_count": 73, "orcid": "0000-0003-2727-9809", "orcid_state": "verified", "chain": ["E4", "E5"],
        "papers": [
            p("E2","Research on the influencing factors of users' information processing in online health communities based on heuristic-systematic model.","10.3389/fpsyg.2022.966033",2022,"middle",pmid="36324785",reason="Official representative list plus exact biomedical-informatics affiliation."),
            p("E3","Effect of Information Framing on Wearing Masks During the COVID-19 Pandemic: Interaction With Social Norms and Information Credibility.","10.3389/fpubh.2022.811792",2022,"middle",pmid="35284387",reason="Official representative list plus exact biomedical-informatics affiliation."),
            p("E4","The Uptake and Vaccination Willingness of COVID-19 Vaccine among Chinese Residents: Web-Based Online Cross-Sectional Study.","10.3390/vaccines10010090",2022,"middle",orcid="0000-0003-2727-9809",pmid="35062751",reason="Official representative list plus exact ORCID and biomedical-information affiliation."),
            p("E5","Exploring Users' Health Behavior Changes in Online Health Communities: Heuristic-Systematic Perspective Study.","10.3390/ijerph191811783",2022,"middle",orcid="0000-0003-2727-9809",pmid="36142055",reason="Official representative list plus exact ORCID and biomedical-information affiliation."),
            p("E6","Genetic Analysis and Literature Review of SNCA Variants in Parkinson's Disease.","10.3389/fnagi.2021.648151",2021,"first",kind="review",pmid="34456707",reason="Official representative list plus first-author position and medical-information affiliation."),
            p("E7","Assessing the influence of generative artificial intelligence (GenAI) on awareness and behavior in medical research integrity: An online survey study.","10.1080/08989621.2025.2554696",2025,"middle",status="identity_pending",identity="unresolved",aff=None,pmid="40908928",reason="Name and broad School of Life Sciences affiliation fit, but department/email/ORCID do not close the common-name risk."),
            p("E8","Genetic architecture of amyotrophic lateral sclerosis: a comprehensive review.","10.1016/j.jgg.2025.05.008",2025,"middle",status="candidate",kind="review",pmid="40446958",reason="Exact medical-information unit and genetics topic."),
            p("E9","Factors influencing user's health information discernment abilities in online health communities: based on SEM and fsQCA.","10.3389/fpubh.2024.1379094",2024,"middle",status="candidate",pmid="39351031",reason="Exact biomedical-informatics unit and online-health coauthor/topic continuity."),
            p("E10","Scientific misconduct responsibility attribution: An empirical study on byline position and team identity in Chinese medical papers.","10.1371/journal.pone.0308377",2024,"middle",status="candidate",pmid="39102401",reason="Exact biomedical-informatics unit and research-information topic."),
            p("E11","HOXC10 Protects from Skin Aging by Targeting the FZD6/Wnt/β-Catenin Signaling Pathway.","10.34133/research.0976",2025,"middle",status="excluded",identity="conflict",aff="Xiangya Hospital Department of Dermatology",pmid="41268215",reason="Same-name author is in dermatology with a different department and coauthor network."),
        ]},
    "jiang-hao": {
        "name_en": "Hao Jiang", "query_count": 70, "orcid": "0000-0001-7270-1939", "orcid_state": "unresolved", "chain": [],
        "papers": [
            p("E2","Targeting C21orf58 is a Novel Treatment Strategy of Hepatocellular Carcinoma by Disrupting the Formation of JAK2/C21orf58/STAT3 Complex.","10.1002/advs.202306623",2024,"first",pmid="38342622",reason="Official representative list plus first-author position and exact biomedical-informatics affiliation."),
            p("E3","STAT5a and SH2B3 novel mutations display malignancy roles in a triple-negative primary myelofibrosis patient.","10.1038/s41417-023-00719-7",2024,"last",orcid="0000-0001-7270-1939",email="jianghao1209@csu.edu.cn",pmid="38135698",reason="Official representative list plus exact ORCID, email and biomedical-informatics affiliation."),
            p("E4","Deubiquitinase OTUD3: a double-edged sword in immunity and disease.","10.3389/fcell.2023.1237530",2023,"last",kind="review",pmid="37829187",reason="Official representative list plus exact biomedical-informatics affiliation."),
            p("E5","Immunostimulant nanomodulator boosts antitumor immune response in triple negative breast cancer by synergism of vessel normalization and photothermal therapy.","10.1007/s12274-023-5786-8",2023,"first",status="identity_pending",identity="unresolved",aff=None,reason="Official profile and Crossref close title/first author, but reviewed metadata did not close publication-time affiliation; retained unresolved."),
            p("E6","Upregulated GATA3/miR205-5p Axis Inhibits MFNG Transcription and Reduces the Malignancy of Triple-Negative Breast Cancer.","10.3390/cancers14133057",2022,"last",pmid="35804829",reason="Official representative list plus exact biomedical-informatics affiliation."),
            p("E7","RFC5 and STAT3 form a transcriptional complex to drive NSCLC progression via c-Myc.","10.1016/j.isci.2026.117246",2026,"middle",status="candidate",pmid="42662404",reason="Exact biomedical-informatics unit and established tumor/STAT3 network."),
            p("E8","Durvalumab Consolidation Treatment Following Concurrent Chemoradiotherapy in Limited-Stage SCLC: ADRIATIC China Subgroup Analysis.","10.1016/j.jtocrr.2026.101022",2026,"middle",status="excluded",identity="conflict",aff="First Affiliated Hospital of Bengbu Medical University",pmid="42529258",reason="Same-name author has a different hospital and radiation-oncology network."),
            p("E9","Lattice Geometry Modulation of Heisenberg Superexchange in B/C/N-Substituted MXenes.","10.1021/acs.inorgchem.6c01622",2026,"middle",status="excluded",identity="conflict",aff="Central South University School of Physics",pmid="42443070",reason="Same-name author is in physics and an unrelated field/network."),
            p("E10","Efficacy and safety of toripalimab in combination with cetuximab in patients with recurrent or metastatic head and neck squamous cell carcinoma: a phase 1b/2 study.","10.1038/s41392-026-02707-3",2026,"middle",status="excluded",identity="conflict",aff="First Affiliated Hospital of Bengbu Medical University",pmid="42260304",reason="Same-name author has a different hospital and radiation-oncology network."),
            p("E11","One-pot fabrication and characterization of ZnO nanoflowers using Zanthoxylum simulans and evaluating their biomedical claims.","10.1007/s00604-026-08166-5",2026,"middle",status="identity_pending",identity="unresolved",aff=None,pmid="42246990",reason="Department text fits, but the listed email is jianhao1209@csu.edu.cn rather than the publication identity email; keep unresolved."),
        ]},
    "li-jinchen": {
        "name_en": "Jinchen Li", "query_count": 167, "orcid": None, "orcid_state": "unresolved", "chain": [],
        "papers": [
            p("E2","Prioritizing de novo potential non-canonical splicing variants in neurodevelopmental disorders.","10.1016/j.ebiom.2023.104928",2024,"last",email="lijinchen@csu.edu.cn",pmid="38113761",reason="Official representative list plus official email and multi-unit CSU affiliation."),
            p("E3","VarCards2: an integrated genetic and clinical database for ACMG-AMP variant-interpretation guidelines in the human whole genome.","10.1093/nar/gkad1061",2024,"last",pmid="37956311",reason="Official representative list plus exact author and multi-unit CSU affiliation; publication ORCID conflicts with another official paper and is not adopted as advisor ORCID."),
            p("E4","A metabolomic profile of biological aging in 250,341 individuals from the UK Biobank.","10.1038/s41467-024-52310-9",2024,"middle",email="lijinchen@csu.edu.cn",pmid="39278973",reason="Official representative list plus official email and multi-unit CSU affiliation; ORCID conflicts with E3 and remains unresolved."),
            p("E5","Gene4Denovo2: an updated platform for human de novo mutations discovery and interpretation.","10.1093/nar/gkaf980",2026,"last",pmid="41024706",reason="Official representative list plus exact author and multi-unit CSU affiliation."),
            p("E6","Interactions between rare and common variant genetic risks in determining telomere length.","10.1016/j.scib.2025.10.028",2026,"middle",email="lijinchen@csu.edu.cn",pmid="41203482",reason="Official representative list plus official email and multi-unit CSU affiliation."),
            p("E7","DeNovoSeer: a deep learning framework for pathogenicity prediction of de novo mutations.","10.1093/bib/bbag428",2026,"middle",status="identity_pending",identity="unresolved",aff=None,pmid="42574277",reason="Relevant unit but carries ORCID 0000-0003-3335-9303, one side of the unresolved two-ORCID conflict."),
            p("E8","Genomic landscape of rare variants in a Chinese autism cohort and discovery of novel risk genes.","10.1038/s41380-026-03754-6",2026,"middle",status="identity_pending",identity="unresolved",aff=None,pmid="42463903",reason="Relevant unit but carries ORCID 0000-0001-5522-806X, the other side of the unresolved two-ORCID conflict."),
            p("E9","Biallelic hexose-6-phosphate dehydrogenase variants cause mitochondrial dysfunction underlying Parkinson's disease.","10.1016/j.scib.2026.07.038",2026,"middle",status="candidate",pmid="42463407",reason="Exact multi-unit CSU bioinformatics/medical-genetics affiliation and official disease direction."),
            p("E10","Metabolomic signatures for diagnosis and clinical severity in Parkinson's disease.","10.1016/j.ebiom.2026.106383",2026,"middle",status="candidate",pmid="42447752",reason="Exact multi-unit CSU affiliation and official neuropsychiatric-disease direction."),
            p("E11","Large-scale profiling of blood microbial signatures in patients with Parkinson's disease and its association with disease progression: a cross-sectional study.","10.1016/j.ebiom.2026.106224",2026,"last",status="candidate",email="lijinchen@csu.edu.cn",pmid="41864063",reason="Official email, exact multi-unit CSU affiliation and disease direction."),
        ]},
}


# Candidate-author inventories are audit records, not package identity grants.
# Record-level sources used in this run do not expose stable author-entity IDs
# or trustworthy total-work counts, so those cells are explicitly UNKNOWN
# rather than being backfilled from a name-only database cluster.
AUTHOR_INVENTORIES = {
    "deng-meichun": [
        dict(label="DM-A1", assessment="primary target cluster", source="CSU E1 + PubMed/DOI E2-E11", source_id="NOT_AVAILABLE (record-level sources)", affiliations="Central South University; historical MD Anderson record", orcid="0000-0002-3558-1314", works="10 retained; source-entity total NOT_ACCESSED", coauthors="Full list NOT_EXTRACTED; peptide/channel and pain-network continuity recorded in E7-E11", topics="pain; ion channels; peptides; cancer-cell migration", metadata="OFFICIAL", right="official profile/list, exact email, current/historical affiliation, two-record ORCID chain", wrong="broad name query returned 38 records; no competing cluster was promoted without record-level closure"),
    ],
    "deng-suixin": [
        dict(label="DS-A1", assessment="primary target cluster", source="CSU E1 + PubMed/DOI E2-E9", source_id="NOT_AVAILABLE (record-level sources)", affiliations="Central South University; historical Fudan University and Beijing Normal University", orcid="0000-0003-4795-2570", works="8 retained; source-entity total NOT_ACCESSED", coauthors="Full list NOT_EXTRACTED; longitudinal synapse/circuit network recorded in E2-E9", topics="dopamine; synapses; neural circuits; neurodevelopment", metadata="OFFICIAL", right="official list, exact current email, career-timeline affiliations, multi-paper ORCID chain", wrong="name-only retrieval is not authority; historical affiliations required per-paper timeline checks"),
    ],
    "duan-ranhui": [
        dict(label="DR-A1", assessment="primary target cluster", source="CSU E1 + PubMed/DOI E2-E11", source_id="NOT_AVAILABLE (record-level sources)", affiliations="Central South University / State Key Laboratory of Medical Genetics", orcid="0000-0001-7117-4487", works="10 retained; source-entity total NOT_ACCESSED", coauthors="Full list NOT_EXTRACTED; Drosophila/repeat-expansion and medical-genetics network recorded in E2-E11", topics="repeat expansion; Drosophila disease models; fragile X; UFMylation", metadata="OFFICIAL", right="official list, exact laboratory email, current unit, two-record ORCID chain", wrong="broad query returned 63 records; DOI/version identity had to be separated from author identity"),
    ],
    "fan-liangliang": [
        dict(label="FL-A1", assessment="primary target cluster; advisor ORCID unresolved", source="CSU E1 + PubMed/DOI E2-E11", source_id="NOT_AVAILABLE (record-level sources)", affiliations="Central South University, cell biology / medical genetics units", orcid="0000-0001-7431-1838 (single publication record only)", works="10 retained; source-entity total NOT_ACCESSED", coauthors="Full list NOT_EXTRACTED; renal/cardiac genetics and Lipin3 network recorded in E2-E11", topics="organ fibrosis; renal/cardiac genetics; ferroptosis; pyroptosis", metadata="OFFICIAL", right="official list, first/last-author positions, current unit and official email", wrong="broad query returned 117 records; one ORCID-bearing paper is insufficient for advisor-level verification"),
    ],
    "guo-yi": [
        dict(label="GY-A1", assessment="primary target cluster", source="CSU E1 + PubMed/DOI E2-E6,E8-E10", source_id="NOT_AVAILABLE (record-level sources)", affiliations="Central South University biomedical/medical information unit", orcid="0000-0003-2727-9809", works="8 retained in cluster; source-entity total NOT_ACCESSED", coauthors="Full list NOT_EXTRACTED; online-health and biomedical-information network recorded in E2-E6,E8-E10", topics="online health communities; health information behavior; medical research integrity; genetics", metadata="OFFICIAL", right="official list, exact specialist unit, coherent topic network, two-record ORCID chain", wrong="Yi Guo is highly non-unique; each record required department/network closure"),
        dict(label="GY-A2", assessment="unresolved plausible same-name cluster", source="PubMed/DOI E7", source_id="NOT_AVAILABLE (record-level source)", affiliations="Central South University School of Life Sciences (broad only)", orcid="UNKNOWN", works="1 retained unresolved; source-entity total NOT_ACCESSED", coauthors="NOT_EXTRACTED", topics="generative AI and research integrity", metadata="E7", right="name and broad school affiliation fit", wrong="department, email and ORCID do not close the common-name risk"),
        dict(label="GY-A3", assessment="rejected other person", source="PubMed/DOI E11", source_id="NOT_AVAILABLE (record-level source)", affiliations="Xiangya Hospital Department of Dermatology", orcid="UNKNOWN", works="1 retained rejection; source-entity total NOT_ACCESSED", coauthors="different dermatology network; full list NOT_EXTRACTED", topics="skin aging; Wnt signaling; dermatology", metadata="E11", right="displayed name matches", wrong="different department, field and coauthor network"),
    ],
    "jiang-hao": [
        dict(label="JH-A1", assessment="primary target cluster; advisor ORCID unresolved", source="CSU E1 + PubMed/DOI E2-E4,E6-E7", source_id="NOT_AVAILABLE (record-level sources)", affiliations="Central South University biomedical informatics unit", orcid="0000-0001-7270-1939 (single publication record only)", works="5 retained in closed cluster; source-entity total NOT_ACCESSED", coauthors="Full list NOT_EXTRACTED; tumor/STAT3 and epigenetic network recorded in E2-E7", topics="tumor epigenetics; STAT3; triple-negative breast cancer", metadata="OFFICIAL", right="official list, exact biomedical-informatics unit, exact email on E3", wrong="Hao Jiang is highly non-unique; a single ORCID record cannot verify advisor-level ORCID"),
        dict(label="JH-A2", assessment="unresolved official-title record", source="Crossref/DOI E5 + CSU official list", source_id="NOT_AVAILABLE (record-level source)", affiliations="UNKNOWN at publication-author level", orcid="UNKNOWN", works="1 retained unresolved; source-entity total NOT_ACCESSED", coauthors="NOT_EXTRACTED", topics="nanomodulator; antitumor immunity; breast cancer", metadata="E5", right="official profile lists the exact title and first-author name", wrong="reviewed metadata did not close publication-time affiliation"),
        dict(label="JH-A3", assessment="rejected other-person hospital cluster", source="PubMed/DOI E8,E10", source_id="NOT_AVAILABLE (record-level sources)", affiliations="First Affiliated Hospital of Bengbu Medical University", orcid="UNKNOWN", works="2 retained rejections; source-entity total NOT_ACCESSED", coauthors="radiation-oncology network; full list NOT_EXTRACTED", topics="SCLC; chemoradiotherapy; head-and-neck cancer", metadata="E8", right="displayed name matches", wrong="different hospital, specialty and longitudinal network"),
        dict(label="JH-A4", assessment="rejected other-person physics cluster", source="PubMed/DOI E9", source_id="NOT_AVAILABLE (record-level source)", affiliations="Central South University School of Physics", orcid="UNKNOWN", works="1 retained rejection; source-entity total NOT_ACCESSED", coauthors="physics/materials network; full list NOT_EXTRACTED", topics="MXenes; Heisenberg superexchange", metadata="E9", right="name and university match", wrong="school, field and network are incompatible"),
        dict(label="JH-A5", assessment="unresolved email-conflict cluster", source="PubMed/DOI E11", source_id="NOT_AVAILABLE (record-level source)", affiliations="Central South University department text", orcid="UNKNOWN", works="1 retained unresolved; source-entity total NOT_ACCESSED", coauthors="NOT_EXTRACTED", topics="ZnO nanoflowers; biomedical materials", metadata="E11", right="department text and displayed name fit", wrong="source email jianhao1209@csu.edu.cn differs from target publication-identity email"),
    ],
    "li-jinchen": [
        dict(label="LJ-A1", assessment="primary target cluster; no advisor ORCID selected", source="CSU E1 + PubMed/DOI E2-E6,E9-E11", source_id="NOT_AVAILABLE (record-level sources)", affiliations="Central South University multi-unit medical-genetics/bioinformatics affiliations", orcid="CONFLICT: no candidate selected", works="8 retained in target/plausible cluster; source-entity total NOT_ACCESSED", coauthors="Full list NOT_EXTRACTED; de novo-variant, neuropsychiatric-genetics and bioinformatics network recorded in E2-E11", topics="de novo variants; neurodevelopment; medical genetics; multi-omics", metadata="OFFICIAL", right="official representative list, exact official email, multi-unit CSU affiliations and coherent network", wrong="two incompatible publication ORCIDs prevent advisor-level selection"),
        dict(label="LJ-A2", assessment="unresolved ORCID-side cluster", source="PubMed/DOI E7 and related reviewed records", source_id="NOT_AVAILABLE (record-level source)", affiliations="relevant Central South University unit", orcid="0000-0003-3335-9303", works="1 explicit unresolved row; source-entity total NOT_ACCESSED", coauthors="NOT_EXTRACTED", topics="de novo mutation pathogenicity prediction", metadata="E7", right="name, relevant unit and research topic fit", wrong="ORCID conflicts with LJ-A3; candidate ORCID must remain null"),
        dict(label="LJ-A3", assessment="unresolved ORCID-side cluster", source="PubMed/DOI E8 and related reviewed records", source_id="NOT_AVAILABLE (record-level source)", affiliations="relevant Central South University unit", orcid="0000-0001-5522-806X", works="1 explicit unresolved row; source-entity total NOT_ACCESSED", coauthors="NOT_EXTRACTED", topics="rare variants; autism genetics", metadata="E8", right="name, relevant unit and research topic fit", wrong="ORCID conflicts with LJ-A2; candidate ORCID must remain null"),
    ],
}


def url(x):
    return f"https://doi.org/{x['doi'].lower()}" if x.get("doi") else f"https://pubmed.ncbi.nlm.nih.gov/{x['pmid']}/"


def write_json(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def source_urls(papers, ids, official_url):
    by = {x["id"]: x for x in papers}
    return [official_url if eid == "E1" else url(by[eid]) for eid in ids]


def build_one(advisor_id, cfg):
    package = DATA_ROOT / advisor_id
    public = json.loads((package / "public-advisor-v1.json").read_text(encoding="utf-8"))
    manifest = json.loads((package / "evidence-manifest-v1.json").read_text(encoding="utf-8"))
    identity = json.loads((package / "identity-review-v1.json").read_text(encoding="utf-8"))
    official = manifest["candidate_evidence"][0]
    official_url = official["source_url"]
    papers = cfg["papers"]

    records=[]; identities=[]
    for x in papers:
        u=url(x); verified=x["identity"]=="verified"
        statuses=[x["status"]]
        if not verified and x["status"]=="excluded": statuses.append("identity_pending")
        records.append({
            "evidence_id":x["id"],"evidence_type":"publication","source_url":u,"source_authority":"publication","candidate_statuses":statuses,
            "reason":x["reason"],"supported_fields":["name_en","research_directions_plain_language","research_questions","main_techniques","research_workflow","possible_undergraduate_tasks","prerequisite_skills","learning_cost","generic_growth_path","summary"],
            "repository_source_ref":f"evidence-manifest-v1.json#{x['id']}","last_verified_at":DATE,
            "notes":((f"PubMed PMID {x['pmid']}; " if x.get('pmid') else "Crossref DOI record; ")+x["reason"]+" Candidate/adoption is not a featured or release decision."),
            "title":x["title"],"publication_year":x["year"],"doi":x.get("doi"),"source_type":x["kind"],"author_position":x["pos"],
            "is_co_first":None,"is_corresponding":None,"identity_verified":verified,"version_group":("duan-ranhui-eg5" if advisor_id=="duan-ranhui" and x["id"]=="E3" else None),
            "publication_types":[x["kind"]],"publication_affiliations":[x["aff"]] if x.get("aff") else None,"publication_affiliation_source_url":u if x.get("aff") else None,
        })
        matched_orcid=x.get("orcid") if cfg["orcid"] and x.get("orcid")==cfg["orcid"] else None
        basis=[x["reason"]]
        if x["status"]=="adopted": basis.append("The official CSU profile explicitly lists this publication.")
        identities.append({
            "evidence_id":x["id"],"identity_status":x["identity"],"verification_basis":basis,
            "matched_author_name":cfg["name_en"],"matched_institution":x.get("aff"),"matched_institution_source_url":u if x.get("aff") else None,
            "matched_author_email":x.get("email"),"matched_author_email_source_url":u if x.get("email") else None,
            "matched_orcid":matched_orcid,"orcid_source_url":u if matched_orcid else None,"notes":x["reason"],
        })
    manifest["source_scope"]="Official CSU advisor profile/representative list plus DOI, PubMed and Europe PMC discovery metadata; local Owner review only."
    manifest["candidate_evidence"]=[official]+records

    adopted=[x["id"] for x in papers if x["status"]=="adopted" and x["identity"]=="verified"]
    public["name_en"]={"value":cfg["name_en"],"value_en":cfg["name_en"],"source_url":url(papers[0]),"source_ref":"evidence-manifest-v1.json#E2","source_authority":"publication","last_verified_at":DATE,"missing_status":"available"}
    public["adopted_public_evidence_ids"]=["E1"]+adopted
    public["featured_publication_evidence_ids"]=[]
    public["featured_selection_status"]="pending_manual_review"
    public["featured_selection_review"]={"status":"pending","reviewed_at":None,"reviewer_role":None,"selection_criteria":[],"notes":"FEATURED_CANDIDATE_SHORTLIST is an Owner review aid only; no featured publication has been approved."}
    public["publication_identity_status"]="verified"
    ids=["E1"]+adopted
    urls=source_urls(papers,ids,official_url)
    public["research_questions"]=[{"text":"根据官方方向与已核验论文，可能进一步核对其核心疾病问题、分子或信息学机制及证据链；具体当前项目仍需向导师确认。","evidence_status":"partially_verified","confidence":"Medium","source_urls":urls,"evidence_ids":ids,"evidence_lane":"ai_synthesis","no_evidence_reason":None}]
    public["main_techniques"]=[{"text":"根据官方主页和已核验论文，可能涉及页面已列方法以及论文中公开的方法类型；具体平台、样本和当前使用范围需项目确认。","evidence_status":"partially_verified","confidence":"Medium","source_urls":urls,"evidence_ids":ids,"evidence_lane":"ai_synthesis","no_evidence_reason":None}]
    public["research_workflow"]=[{"text":"可将已核验论文整理为问题、数据或模型、方法、结果与限制的可复核链；这是跨来源AI整理，不代表实验室固定流程。","evidence_status":"partially_verified","confidence":"Low","source_urls":urls,"evidence_ids":ids,"evidence_lane":"ai_synthesis","no_evidence_reason":None}]
    public["possible_undergraduate_tasks"]=[{"task":"建立官方方向与已核验论文的证据矩阵","task_context":"区分论文事实、作者身份、方法线索和跨论文归纳。","task_purpose":"练习可审计文献阅读和不确定性标注。","possible_methods":["结构化摘录","DOI与作者身份复核","证据矩阵"],"possible_output":"一份带Evidence ID和限制说明的审计表","evidence_ids":ids,"confidence":"Low","evidence_lane":"ai_synthesis","uncertainty_note":"这是根据公开研究方向与已核验论文设计的任务类型示例，不代表导师已安排该本科任务、名额、培养方式或结果保证；实际任务必须向导师确认。"}]
    total=len(papers); rejected=sum(x["identity"]=="conflict" for x in papers); unresolved=sum(x["identity"]=="unresolved" for x in papers); verified_candidates=sum(x["status"]=="candidate" and x["identity"]=="verified" for x in papers)
    public["summary"]={"text":f"根据官方主页与{len(adopted)}篇采用论文，可概括该导师的公开身份与研究方向；论文候选共{total}篇，其中另有{verified_candidates}篇身份已核验候选、{rejected}篇同名错配和{unresolved}篇未决。精选论文仍待Owner人工决定。","evidence_status":"partially_verified","confidence":"Medium","source_urls":urls,"evidence_ids":ids,"evidence_lane":"ai_synthesis","no_evidence_reason":None}
    public["boundary_statement"]="官方身份与原始研究方向属于PUBLIC FACT；采用论文题名、作者位置、发表时机构及身份决定由相应Evidence支持；研究问题、流程和本科任务属于条件化AI SYNTHESIS。候选不等于采用、精选或发布，不推断当前招生、在研项目、实验室氛围、带教方式、疗效或结果承诺。"
    public["data_status_note"]=f"Publication enrichment：候选{total}篇，采用{len(adopted)}篇，身份已核验候选{verified_candidates}篇，排除{rejected}篇，未决{unresolved}篇。人工身份审核与featured选择仍pending，publication_status保持review_pending。"
    public["evidence_status"]="partially_verified"; public["confidence"]="Medium"; public["update_status"]="partially_verified"; public["publication_status"]="review_pending"

    identity["review_status"]="unresolved"; identity["reviewed_at"]=None; identity["reviewer_role"]="codex_mechanical_migration"
    identity["advisor_identity"].update({
        "orcid_status":cfg["orcid_state"],"candidate_orcid":cfg["orcid"],"human_review_status":"pending","orcid_verification_evidence_ids":cfg["chain"],
        "orcid_verification_basis":([f"Publication records {', '.join(cfg['chain'])} carry the same ORCID {cfg['orcid']} and at least one current-CSU link."] if cfg["orcid_state"]=="verified" else (["Two incompatible publication ORCIDs remain unresolved; no candidate ORCID is selected."] if advisor_id=="li-jinchen" else ["Only one publication-level ORCID chain record was closed; advisor-level ORCID remains unresolved."])),
        "notes":"Publication identity was checked per paper; human review remains pending. ORCID state follows the recorded chain and is not a release approval.",
    })
    identity["publication_identity"]=identities
    identity["p0_blockers"]=[{"code":"HUMAN_IDENTITY_REVIEW_PENDING","description":"Owner human identity review is pending; machine closure is not approval.","evidence_ids":["E1"]+cfg["chain"]}]
    identity["notes"]="Official-list anchors, publication-time affiliations, email/ORCID where available, and explicit same-name counterexamples were kept advisor-local."

    write_json(package/"public-advisor-v1.json",public); write_json(package/"evidence-manifest-v1.json",manifest); write_json(package/"identity-review-v1.json",identity)

    shortlist=[x for x in papers if x["status"]=="adopted"][:5]
    lines=[f"# {advisor_id} Publication Audit","",f"- Official-profile search seed: {cfg['name_en']}; official profile E1","- Candidate author discovery: PubMed name+CSU query returned "+str(cfg["query_count"])+" records before advisor-local triage.",f"- Candidates retained: {total}",f"- Adopted: {len(adopted)}",f"- Identity-verified candidates not adopted: {verified_candidates}",f"- Rejected/conflict: {rejected}",f"- Unresolved: {unresolved}",f"- ORCID state: {cfg['orcid_state']} ({cfg['orcid'] or 'no candidate selected'})","- Human review: pending; release: false","","## Candidate publications","","| ID | Year | Decision | Identity | DOI | Reason |","| --- | ---: | --- | --- | --- | --- |"]
    lines += [f"| {x['id']} | {x['year']} | {x['status']} | {x['identity']} | {x.get('doi') or 'not found'} | {x['reason']} |" for x in papers]
    lines += [
        "",
        "## Candidate author identities and counterevidence",
        "",
        "This inventory preserves every reasonable author cluster retained after broad discovery. `NOT_AVAILABLE`, `NOT_ACCESSED`, `NOT_EXTRACTED`, and `UNKNOWN` are intentional fail-closed values; no name-only database entity was treated as an identity authority.",
        "",
        "| Candidate | Assessment | Source | Source author ID | Displayed name | Affiliation(s) | ORCID | Works count | Coauthors / network | Topics | Metadata URL | Why candidate | Why maybe wrong |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    paper_by_id = {x["id"]: x for x in papers}
    for candidate in AUTHOR_INVENTORIES[advisor_id]:
        metadata_url = official_url if candidate["metadata"] == "OFFICIAL" else url(paper_by_id[candidate["metadata"]])
        cells = [
            candidate["label"], candidate["assessment"], candidate["source"], candidate["source_id"], cfg["name_en"],
            candidate["affiliations"], candidate["orcid"], candidate["works"], candidate["coauthors"], candidate["topics"],
            metadata_url, candidate["right"], candidate["wrong"],
        ]
        lines.append("| " + " | ".join(str(value).replace("|", "\\|") for value in cells) + " |")
    lines += [
        "",
        f"Broad retrieval produced {cfg['query_count']} record hits before advisor-local triage. That hit count is not an author works count. {rejected} clearly different cluster(s) were rejected and {unresolved} record(s) remain unresolved.",
        "",
        "## FEATURED_CANDIDATE_SHORTLIST",
        "",
        "This is not a featured decision. Owner selection remains pending.",
        "",
    ]
    lines += [f"- {x['id']} — {x['title']} ({x['year']}, {x['doi']}): official-list anchor; Owner should assess direction coverage, role and recency bias." for x in shortlist]
    lines += ["","## Research enrichment boundary","","- PUBLIC FACT: official E1 identity and original research direction.","- Publication-supported: titles, years, author positions, publication-time affiliation and per-paper identity decisions.","- AI SYNTHESIS: cross-paper questions, method grouping, workflow and possible undergraduate evidence-matrix task.","- No claim is made about current recruitment, lab atmosphere, mentoring style, active projects, efficacy or outcomes.","","## Remaining uncertainty","",("- Publication records expose two incompatible ORCIDs (0000-0003-3335-9303 and 0000-0001-5522-806X); neither is selected." if advisor_id=="li-jinchen" else ("- Advisor-level ORCID remains unresolved because fewer than two clean publication-chain records were available." if cfg["orcid_state"]!="verified" else "- ORCID is mechanically closed by the listed chain, but Owner human review remains pending.")),"- Corresponding-author status is null unless separately closed; author position does not substitute for it.","- v1.0.6 expressed all retained states; no schema extension was required.",""]
    (REVIEW/f"{advisor_id}-publication-audit.md").write_text("\n".join(lines),encoding="utf-8",newline="\n")
    return public, manifest, identity


def main():
    owner_decision = REVIEW / "OWNER_PUBLICATION_DECISIONS_2026-09-10.json"
    if owner_decision.exists():
        raise RuntimeError(
            "Owner publication decisions are already applied; refusing to run the historical "
            "pre-Owner builder. Use apply_owner_publication_decisions.py for audited writeback."
        )
    parser=argparse.ArgumentParser()
    parser.add_argument("advisor_id",choices=ADVISORS)
    args=parser.parse_args()
    aid=args.advisor_id; cfg=ADVISORS[aid]
    build_one(aid,cfg)
    ledger=REVIEW/"publication_identity_ledger.csv"
    existing=list(csv.DictReader(ledger.open(encoding="utf-8-sig")))
    rows=[r for r in existing if r["advisor_id"]!=aid]
    fields=list(existing[0])
    for x in cfg["papers"]:
        rows.append({"advisor_id":aid,"publication_candidate_id":x["id"],"title":x["title"],"doi":x.get("doi") or "","year":x["year"],"candidate_source":((f"PubMed PMID {x['pmid']}; " if x.get('pmid') else "")+"DOI/Crossref; official profile for listed publications"),"candidate_author_id":"OFFICIAL_PROFILE_NAME_AFFILIATION_CLUSTER" if x["identity"]=="verified" else ("SAME_NAME_OTHER_CLUSTER" if x["identity"]=="conflict" else "AMBIGUOUS_CLUSTER"),"author_name":cfg["name_en"],"affiliation":x.get("aff") or "","orcid":x.get("orcid") or "","identity_status":x["identity"],"identity_evidence":x["reason"],"counterevidence":x["reason"] if x["identity"]!="verified" else "None found in reviewed records","decision":x["status"],"adopted_evidence_id":x["id"] if x["status"]=="adopted" and x["identity"]=="verified" else "","duplicate_group":"duan-ranhui-eg5" if aid=="duan-ranhui" and x["id"]=="E3" else "","version_relation":"formal article selected over preprint" if aid=="duan-ranhui" and x["id"]=="E3" else "canonical journal record; no linked preprint identified","review_required":"yes","notes":"Featured selection remains pending_manual_review."})
    with ledger.open("w",encoding="utf-8-sig",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)


if __name__=="__main__": main()
