import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  changelogEntries,
  formatChangelogDate,
  getLatestChangelogEntry,
} from "../data/changelog";
import { PlatformHomePage } from "../pages/PlatformHomePage";
import { UpdatesPage } from "../pages/UpdatesPage";

function renderHome() {
  return render(
    <MemoryRouter>
      <PlatformHomePage />
    </MemoryRouter>,
  );
}

function renderUpdates() {
  return render(
    <MemoryRouter initialEntries={["/updates"]}>
      <Routes>
        <Route path="/updates" element={<UpdatesPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("公开更新日志", () => {
  it("提供 /updates 路由页面并展示全部公开版本", () => {
    renderUpdates();
    expect(screen.getByRole("heading", { name: "更新日志" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "生命科学本科生培养与科研服务平台首版上线",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "导师信息库测试版" })).toBeInTheDocument();
    expect(screen.getByText("v1.0")).toBeInTheDocument();
    expect(screen.getByText("v0.5 Beta")).toBeInTheDocument();
    expect(screen.getByText(formatChangelogDate("2026-08-05"))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← 返回平台首页" })).toHaveAttribute("href", "/");
    expect(changelogEntries).toHaveLength(2);
  });

  it("不在公开更新日志中暴露内部审核或工具信息", () => {
    renderUpdates();
    const page = document.body.textContent ?? "";
    [
      "Review",
      "13位",
      "郭辉",
      "胡正茂",
      "待审核",
      "DTO",
      "门禁",
      "Cursor",
      "Claude",
      "Antigravity",
      "commit",
      "C:\\Users",
    ].forEach((marker) => {
      expect(page).not.toContain(marker);
    });
  });

  it("首页最近更新显示最新版本、日期、核心变化与完整日志入口", () => {
    renderHome();
    const latest = getLatestChangelogEntry();
    const heading = screen.getByRole("heading", { name: "最近更新" });
    const block = heading.closest("section");
    expect(block).not.toBeNull();
    const view = within(block!);
    expect(view.getByText(latest.version)).toBeInTheDocument();
    expect(view.getByText(formatChangelogDate(latest.date))).toBeInTheDocument();
    expect(view.getByRole("heading", { name: latest.title })).toBeInTheDocument();
    latest.highlights.slice(0, 3).forEach((item) => {
      expect(view.getByText(item)).toBeInTheDocument();
    });
    expect(view.getByRole("link", { name: /查看完整更新日志/ })).toHaveAttribute(
      "href",
      "/updates",
    );
  });

  it("导航与页脚提供更新日志入口", () => {
    renderHome();
    const navLinks = screen.getAllByRole("link", { name: "更新日志" });
    expect(navLinks.length).toBeGreaterThanOrEqual(2);
    navLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/updates");
    });
  });

  it("最近更新与更新日志样式声明可收缩宽度，降低横向溢出风险", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const css = readFileSync(
      resolve(process.cwd(), "src/styles/platform-home.css"),
      "utf8",
    );
    expect(css).toMatch(/\.platform-home \.recent-updates-card\s*\{[^}]*min-width:\s*0/s);
    expect(css).toMatch(/\.platform-home \.updates-entry\s*\{[^}]*min-width:\s*0/s);
    expect(css).toMatch(/overflow-wrap:\s*anywhere/);
  });
});
