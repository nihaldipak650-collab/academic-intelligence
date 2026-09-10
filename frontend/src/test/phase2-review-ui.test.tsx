import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "../components/AppShell";
import { AdvisorDataProvider } from "../data/AdvisorDataContext";
import { AdvisorDetailPage } from "../pages/AdvisorDetailPage";
import { AdvisorListPage } from "../pages/AdvisorListPage";
import type { AdvisorDataEnvelope } from "../types/advisor";

const outputRoot = path.join(process.cwd(), ".local-review-phase2-8", "public");
const envelope = JSON.parse(
  readFileSync(path.join(outputRoot, "data", "advisors.json"), "utf8"),
) as AdvisorDataEnvelope;
const publicationNotice = "当前未纳入论文候选证据，代表论文及作者身份尚待检索与核验。";
const forbidden = /HUMAN_APPROVED|READY_FOR_RELEASE|PUBLICATION_APPROVED|论文已核验|publication verified|代表论文已确认/i;

function ReviewRoute({ route }: { route: string }) {
  return (
    <AdvisorDataProvider initialData={envelope} initialConfig={{ feedbackUrl: "" }}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="advisors" element={<AdvisorListPage />} />
            <Route path="advisor/:id" element={<AdvisorDetailPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AdvisorDataProvider>
  );
}

describe("Phase 2 Owner review UI", () => {
  it("shows exactly eight pending advisors and the local-only status bar", () => {
    const { container } = render(<ReviewRoute route="/advisors" />);
    expect(screen.getByLabelText("本地 Owner 审核状态")).toHaveTextContent("LOCAL REVIEW ONLY");
    expect(screen.getByLabelText("本地 Owner 审核状态")).toHaveTextContent("RELEASE ELIGIBLE: FALSE");
    expect(screen.getAllByText("待 Owner 人工审核 · 不可发布")).toHaveLength(8);
    expect(screen.getAllByText(publicationNotice)).toHaveLength(8);
    for (const advisor of envelope.advisors) {
      expect(screen.getByRole("heading", { name: advisor.nameZh })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("link", { name: /查看完整证据报告/ })).toHaveLength(8);
    expect(container.textContent).not.toMatch(forbidden);
  });

  it("opens all eight detail routes without hiding or upgrading pending state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `# Review\n\n## 代表性论文\n\n${publicationNotice}`,
    }));
    for (const advisor of envelope.advisors) {
      const view = render(<ReviewRoute route={`/advisor/${advisor.id}`} />);
      expect(screen.getByRole("heading", { name: advisor.nameZh })).toBeInTheDocument();
      expect(screen.getByLabelText("Phase 2 待审核状态")).toHaveTextContent("RELEASE ELIGIBLE: FALSE");
      expect(screen.getByLabelText("Phase 2 待审核状态")).toHaveTextContent("本轮未执行论文检索");
      expect(screen.getByLabelText("Phase 2 待审核状态")).toHaveTextContent(publicationNotice);
      expect(screen.getByText("pending_verification · 候选 0 · 已采用 0")).toBeInTheDocument();
      expect(view.container.textContent).not.toMatch(forbidden);
      view.unmount();
    }
    vi.unstubAllGlobals();
  });
});
