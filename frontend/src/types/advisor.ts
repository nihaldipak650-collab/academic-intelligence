export type PublicationStatus =
  | "draft"
  | "review_pending"
  | "approved"
  | "published"
  | "retracted";

export type AdvisorDataMode = "mock" | "dto" | "review";
export type Confidence = "High" | "Medium" | "Low" | "No Evidence" | "Unknown";

export interface TraceableText {
  text: string;
  evidenceIds: string[];
}

export interface PlainResearchDirection {
  term: string;
  explanation: string;
  undergraduateMeaning: string;
  evidenceIds: string[];
}

export interface PublicEvidenceItem {
  evidenceId: string;
  title: string;
  year?: number;
  doi?: string;
  sourceUrl: string | null;
  journal?: string;
}

export interface UndergraduateScenario {
  task: string;
  context: string;
  purpose: string;
  methods: string[];
  output: string;
  uncertaintyNote: string;
  evidenceIds: string[];
}

export interface GrowthStage {
  stage: "基础准备" | "边界任务" | "独立模块" | string;
  period: string | null;
  possibleActivities: string[];
  possibleOutputs: string[];
  uncertaintyNote: string;
  evidenceIds: string[];
}

export interface PublicAdvisor {
  id: string;
  name: string;
  nameEn: string | null;
  institution: string;
  department: string;
  position: string | null;
  publicRoles: string[];
  summary: string;
  summaryEvidenceIds: string[];
  tags: string[];
  searchKeywords: string[];
  researchDirections: TraceableText[];
  researchDirectionsPlain: PlainResearchDirection[];
  researchQuestions: TraceableText[];
  techniques: TraceableText[];
  researchWorkflow: TraceableText[];
  publicEvidence: PublicEvidenceItem[];
  undergraduateScenarios: UndergraduateScenario[];
  prerequisiteSkills: TraceableText[];
  learningCost: TraceableText;
  growthPath: GrowthStage[];
  boundaryStatement: string;
  updatedAt: string;
  publicationStatus: "review_pending" | "approved" | "published";
  dataStatusNote?: string;
}

export interface PublicAdvisorDto extends Record<string, unknown> {
  dtoVersion: string;
  id: string;
  nameZh: string;
  nameEn?: string;
  institution: string;
  schoolOrDepartment: string;
  position: string;
  publicRoles: string[];
  summary: TraceableText;
  researchDirections: TraceableText[];
  researchDirectionsPlain: PlainResearchDirection[];
  researchQuestions: TraceableText[];
  mainTechniques: TraceableText[];
  researchWorkflow: TraceableText[];
  possibleUndergraduateTasks: UndergraduateScenario[];
  prerequisiteSkills: TraceableText[];
  learningCost: TraceableText;
  genericGrowthPath: Array<Omit<GrowthStage, "period"> & { stage: string }>;
  tags: string[];
  searchKeywords: string[];
  publicEvidence: PublicEvidenceItem[];
  boundaryStatement: string;
  lastUpdated: string;
  publicationStatus: "approved" | "published";
  releaseEligible: true;
  schemaVersion: "1.0.4";
  evidenceType: "academic_only";
  hasExperienceEvidence: false;
  experienceCaseCount: 0;
}

export interface PublicAdvisorDtoEnvelope {
  schemaVersion: 1;
  dtoVersion: "1.0.4";
  source: "approved-public-advisor-contract";
  advisorCount: number;
  advisors: PublicAdvisorDto[];
}

export interface V104Candidate {
  record: unknown;
  validation: unknown;
}

export interface AdvisorDataSnapshot {
  mode: AdvisorDataMode;
  advisors: PublicAdvisor[];
  rejectedCount: number;
}

export interface SiteConfig {
  feedbackUrl: string | null;
}
