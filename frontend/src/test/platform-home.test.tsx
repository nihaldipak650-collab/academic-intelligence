import { render, screen } from "@testing-library/react";
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
      screen.getByRole("heading", { name: /学习、科研与校园事务/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Academic\s*Intelligence/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /进入导师目录/ }),
    ).toHaveAttribute("href", "academic/");
  });

  it("不再包含原型搜索、学生工作台与即将开放占位", () => {
    renderHome();
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/搜索导师、研究方向/)).not.toBeInTheDocument();
    expect(screen.queryByText(/原型搜索/)).not.toBeInTheDocument();
    expect(screen.queryByText(/学生工作台/)).not.toBeInTheDocument();
    expect(screen.queryByText(/即将开放/)).not.toBeInTheDocument();
  });

  it("Everyday intro 为自然中文，不含内部工作语言", () => {
    renderHome();
    expect(
      screen.getByText(/这些都是我想拿 AI 实际解决的问题/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/AI Reality Map|Capability Preview|Product Catalog|Pre-launch Probe|Pre-launch|product catalog/i),
    ).not.toBeInTheDocument();
  });

  it("Everyday AI 预览卡全部为纯展示：非链接/非按钮/无箭头", () => {
    const { container } = renderHome();
    const mainText = screen.getByRole("main").textContent ?? "";

    const titles = [
      "让 AI 帮你做一份真正能用的 PPT",
      "学生报销，到底怎么报？",
      "Excel 不会做图？把数据交给 AI",
      "如果我要请假，到底应该怎么请？",
      "微信、QQ、电脑里的文件怎么整理？",
      "C 盘爆红了，哪些东西到底能删？",
      "手机到底怎么清，才不会误删？",
      "那些每天重复做的操作，能不能交给 AI？",
      "让 AI 看懂你的整个文件夹",
      "一个长视频，怎么让 AI 帮我真正学进去？",
      "把一学期的辅学资料变成 AI 学习系统",
      "用 AI 把一个脑洞写成第一篇一万字小说",
    ];
    for (const t of titles) expect(mainText).toContain(t);

    // PPT 3 modes
    expect(mainText).toContain("可编辑 PPT");
    expect(mainText).toContain("网页式演示");
    expect(mainText).toContain("学术 PPT");

    // 全部 Everyday 卡均为 div（12 service-item + 2 feature-card），无 <a>/<button>
    const displayOnly = container.querySelectorAll(".service-item.display-only");
    expect(displayOnly.length).toBe(12);
    for (const d of displayOnly) expect(d.tagName.toLowerCase()).toBe("div");
    const featureCards = container.querySelectorAll(".feature-card");
    expect(featureCards.length).toBe(2);
    for (const fc of featureCards) expect(fc.tagName.toLowerCase()).toBe("div");

    // 预览卡区域内无箭头（学科入口除外）
    const previewCards = container.querySelectorAll(
      "#services .service-item.display-only, #services .feature-card",
    );
    for (const card of previewCards) {
      if (card.querySelector(".subject-roster")) continue;
      expect(card.textContent?.includes("→")).toBe(false);
      expect(card.textContent?.includes("›")).toBe(false);
    }

    // 预览卡无链接/按钮语义；学科入口允许一个直达链接
    const servicesSection = container.querySelector("#services");
    const subjectLinks = servicesSection?.querySelectorAll(".subject-roster-item--link") ?? [];
    expect(subjectLinks.length).toBe(1);
    expect(
      servicesSection?.querySelectorAll("a:not(.subject-roster-item--link), button").length ?? 0,
    ).toBe(0);

    // 真实入口保持可点：Academic / 更新日志 / 问卷
    expect(
      screen.getByRole("link", { name: /进入导师目录/ }),
    ).toHaveAttribute("href", "academic/");
    expect(
      screen.getByRole("link", { name: /更新日志/ }),
    ).toHaveAttribute("href", "updates.html");

    // 无死链
    for (const l of screen.getAllByRole("link")) {
      const href = l.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
    }
  });

  it("R5.2.2: Reality Probe 可见，Infinite Talk 隐藏", () => {
    renderHome();
    expect(
      screen.getByRole("heading", { name: /你也有这种问题/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /我也有这个问题/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Infinite Talk/)).not.toBeInTheDocument();
  });
});
