import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "../components/AppShell";

vi.mock("../data/AdvisorDataContext", () => ({
  useAdvisorData: () => ({
    snapshot: { mode: "staging", advisors: [], rejectedCount: 0 },
    siteConfig: { feedbackUrl: null },
    loading: false,
    error: null,
  }),
}));

describe("local staging status notice", () => {
  it("shows the local-only and not-yet-public status prominently", () => {
    render(<MemoryRouter><AppShell /></MemoryRouter>);
    const banner = screen.getByLabelText("本地预发布状态");
    expect(banner).toHaveTextContent("本地预发布验证");
    expect(banner).toHaveTextContent("尚未正式上线");
  });
});
