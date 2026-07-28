export type ConfidenceLevel = "High" | "Medium" | "Low" | "Unknown";
export type EvidenceType = "academic_only" | "academic_and_experience";
export type AdvisorStatus = "beta" | "review_pending" | "published";
export type EvidenceStatus = "High" | "Medium" | "No Evidence";
export type EvidenceLane = "public_fact" | "ai_summary" | "not_verified";

export interface AdvisorContact {
  officialEmail: string | null;
  officialPhone: string | null;
  officialHomepage: string | null;
  laboratoryAddress: string | null;
  sourceUrl: string | null;
}

export interface AdvisorFreshness {
  lastVerifiedAt: string | null;
  dataStatus: "已核验" | "部分信息待补充";
  opportunityStatus: "待核验";
}

export interface UndergraduateTask {
  id: string;
  title: string;
  description: string;
  background: string;
  whyItMatters: string;
  methods: string[];
  expectedOutput: string;
  evidenceStatus: EvidenceStatus;
  evidenceLane: "ai_summary";
}

export interface ResearchTermExplanation {
  term: string;
  plainLanguage: string;
  undergraduateMeaning: string;
}

export interface Advisor {
  id: string;
  nameZh: string;
  nameEn?: string;
  institution?: string;
  position?: string;
  contact?: AdvisorContact;
  initials: string;
  summary: string;
  tags: string[];
  categoryTags: string[];
  authorMatchConfidence: ConfidenceLevel;
  authorConfidenceSource:
    | "author_match_confidence"
    | "legacy_academic_confidence";
  evidenceType: EvidenceType;
  hasExperienceEvidence: boolean;
  experienceCaseCount: number;
  version: string;
  status: AdvisorStatus;
  lastUpdated: string | null;
  reportPath: string;
  reportSha256: string;
  sourceTypeLabel: string;
  sourceLabel: string;
  quickSummary: {
    coreDirections: string[];
    mainTechniques: string[];
    undergraduatePaths: string[];
  };
}

export interface AdvisorDataEnvelope {
  schemaVersion: 1;
  source: "web/advisors.json + web/reports";
  advisorCount: number;
  advisors: Advisor[];
}

export interface SiteConfig {
  feedbackUrl: string;
}

