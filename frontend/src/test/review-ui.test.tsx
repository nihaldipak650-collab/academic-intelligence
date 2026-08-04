import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "../components/AppShell";
import { AdvisorDetailPage } from "../pages/AdvisorDetailPage";

const REVIEW_NOTE = "待项目负责人人工审核，仅用于本地预览，未经公开批准。";

const pendingAdvisor = {
  id: "guo-hui",
  name: "郭辉",
  nameEn: "Hui Guo",
  institution: "中南大学",
  department: "生命科学学院",
  position: "研究员",
  publicRoles: ["博士生导师"],
  summary: "公开研究摘要",
  summaryEvidenceIds: ["E1"],
  tags: ["遗传学"],
  searchKeywords: ["遗传学"],
  researchDirections: [{ text: "方向", evidenceIds: ["E1"] }],
  researchDirectionsPlain: [
    { term: "方向", explanation: "说明", undergraduateMeaning: "含义", evidenceIds: ["E1"] },
  ],
  researchQuestions: [{ text: "问题", evidenceIds: ["E1"] }],
  techniques: [{ text: "方法", evidenceIds: ["E1"] }],
  researchWorkflow: [{ text: "流程", evidenceIds: ["E1"] }],
  publicEvidence: [{ evidenceId: "E1", title: "论文", sourceUrl: "https://doi.org/10.1000/test" }],
  undergraduateScenarios: [
    {
      task: "任务",
      context: "背景",
      purpose: "目的",
      methods: ["方法"],
      output: "产出",
      uncertaintyNote: "不确定",
      evidenceIds: ["E1"],
    },
  ],
  prerequisiteSkills: [{ text: "准备", evidenceIds: ["E1"] }],
  learningCost: { text: "成本", evidenceIds: ["E1"] },
  growthPath: [
    {
      stage: "基础准备",
      period: "0—3个月",
      possibleActivities: ["阅读"],
      possibleOutputs: ["笔记"],
      uncertaintyNote: "不确定",
      evidenceIds: ["E1"],
    },
  ],
  boundaryStatement: "公开边界",
  updatedAt: "2026-08-03",
  publicationStatus: "review_pending" as const,
  dataStatusNote: REVIEW_NOTE,
};

vi.mock("../data/AdvisorDataContext", () => ({
  useAdvisorData: () => ({
    snapshot: { mode: "review", advisors: [pendingAdvisor], rejectedCount: 0 },
    siteConfig: { feedbackUrl: null },
    loading: false,
    error: null,
  }),
}));

describe("local review UI", () => {
  it("shows the review banner on AppShell", () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    const banner = screen.getByLabelText("本地审核预览状态");
    expect(banner).toHaveTextContent("本地审核预览");
    expect(banner).toHaveTextContent("尚未正式上线");
  });

  it("shows the pending human-review note on detail pages", () => {
    render(
      <MemoryRouter initialEntries={["/advisor/guo-hui"]}>
        <Routes>
          <Route path="advisor/:id" element={<AdvisorDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("待审核状态说明")).toHaveTextContent(REVIEW_NOTE);
    expect(screen.getByRole("link", { name: "← 返回导师目录" })).toHaveAttribute("href", "/advisors");
  });
});
