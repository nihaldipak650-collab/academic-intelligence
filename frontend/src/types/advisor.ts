export type ConfidenceLevel = "High" | "Medium" | "Low" | "Unknown";
export type EvidenceType = "academic_only" | "academic_and_experience";
export type AdvisorStatus = "beta" | "review_pending" | "published";

export interface Advisor {
  id: string;
  nameZh: string;
  nameEn?: string;
  institution?: string;
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

