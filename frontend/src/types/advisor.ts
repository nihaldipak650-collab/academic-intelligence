export type ConfidenceLevel = "高" | "中" | "有限";

export interface Paper {
  title: string;
  journal: string;
  year: number;
  doi?: string;
}

export interface TimelineItem {
  period: string;
  title: string;
  tasks: string[];
}

export interface Advisor {
  id: string;
  name: string;
  englishName: string;
  initials: string;
  summary: string;
  confidence: ConfidenceLevel;
  confidenceNote: string;
  directions: string[];
  methods: string[];
  researchQuestion: string;
  timeline: TimelineItem[];
  risks: string[];
  papers: Paper[];
  experiences: string[];
  boundary: string;
  updatedAt: string;
}

