import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PlatformHomePage } from "../pages/PlatformHomePage";

function renderHome() {
  return render(
    <MemoryRouter>
      <PlatformHomePage />
    </MemoryRouter>,
  );
}

describe("父平台首页", () => {
  it("渲染平台标题与 Academic Intelligence 旗舰入口", () => {
    renderHome();
    expect(
      screen.getByRole("heading", {
        name: /学习、科研与校园事务/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Academic\s*Intelligence/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /进入导师与研究方向平台/ }),
    ).toHaveAttribute("href", "/advisors");
    expect(
      screen.getByRole("link", { name: /Academic Intelligence/ }),
    ).toHaveAttribute("href", "/advisors");
    expect(screen.getByRole("heading", { name: "最近更新" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看完整更新日志/ })).toHaveAttribute(
      "href",
      "/updates",
    );
  });

  it("未开放服务入口显示即将开放 toast", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("link", { name: /报销指南/ }));
    expect(screen.getByRole("status")).toHaveTextContent("即将开放");
  });
});
