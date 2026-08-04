import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AdvisorDataProvider } from "../data/AdvisorDataContext";
import { blockedMockIds, mockCandidates } from "../mocks/advisors";
import { AdvisorDetailPage } from "../pages/AdvisorDetailPage";
import { AdvisorListPage } from "../pages/AdvisorListPage";
import { emptyPublicDto, syntheticPublicDto } from "./fixtures/advisors";

function renderMockList(options?: { candidates?: typeof mockCandidates; error?: boolean; delayMs?: number }) {
  return render(
    <MemoryRouter>
      <AdvisorDataProvider initialCandidates={options?.candidates ?? mockCandidates} simulatedError={options?.error} delayMs={options?.delayMs}>
        <AdvisorListPage />
      </AdvisorDataProvider>
    </MemoryRouter>,
  );
}

function renderDtoList(dto: unknown) {
  return render(
    <MemoryRouter>
      <AdvisorDataProvider initialDto={dto}><AdvisorListPage /></AdvisorDataProvider>
    </MemoryRouter>,
  );
}

function renderDetail(id: string, source: "mock" | "dto" = "mock") {
  return render(
    <MemoryRouter initialEntries={[`/advisor/${id}`]}>
      <AdvisorDataProvider {...(source === "dto" ? { initialDto: syntheticPublicDto } : { initialCandidates: mockCandidates })}>
        <Routes><Route path="advisor/:id" element={<AdvisorDetailPage />} /></Routes>
      </AdvisorDataProvider>
    </MemoryRouter>,
  );
}

describe("advisor list", () => {
  it("shows only the three admitted synthetic records", () => {
    renderMockList();
    expect(screen.getAllByRole("link", { name: /查看.*详情/ })).toHaveLength(3);
    blockedMockIds.forEach((id) => expect(screen.queryByText(id)).not.toBeInTheDocument());
  });

  it("prioritizes decision-ready research facts on advisor cards", () => {
    renderMockList();
    const card = screen.getByRole("heading", { name: "示例导师甲" }).closest("article");
    expect(card).not.toBeNull();
    const cardView = within(card!);
    expect(cardView.getByText("核心研究主题")).toBeInTheDocument();
    expect(cardView.getByText("围绕细胞图谱建立可复核的公开研究问题。")).toBeInTheDocument();
    expect(cardView.getByText("主要方法")).toBeInTheDocument();
    expect(cardView.getByText("显微成像；细胞标记")).toBeInTheDocument();
    expect(cardView.getByText("本科生可能切入点")).toBeInTheDocument();
    expect(cardView.getByText("构建小型文献证据矩阵")).toBeInTheDocument();
    expect(cardView.queryByText(/演示如何从公开证据理解研究问题/)).not.toBeInTheDocument();
    expect(cardView.queryByText("E1")).not.toBeInTheDocument();
    expect(cardView.getByRole("button", { name: "展开摘要" })).toBeInTheDocument();
  });

  it("searches by technique and returns an empty state", async () => {
    const user = userEvent.setup();
    renderMockList();
    const search = screen.getByRole("searchbox");
    await user.type(search, "统计建模");
    expect(screen.getByRole("heading", { name: "示例导师乙" })).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "不存在的合成方向");
    expect(screen.getByRole("heading", { name: "没有匹配的合成记录" })).toBeInTheDocument();
  });

  it("combines tags with search and exposes no research-mode inference filter", async () => {
    const user = userEvent.setup();
    renderMockList();
    await user.click(screen.getByRole("button", { name: /筛选与排序/ }));
    const expandTags = screen.queryByRole("button", { name: /展开全部/ });
    if (expandTags) await user.click(expandTags);
    await user.click(screen.getByRole("button", { name: /网络分析/ }));
    expect(screen.getByRole("heading", { name: "示例导师乙" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "示例导师甲" })).not.toBeInTheDocument();
    expect(screen.queryByText("导师类型")).not.toBeInTheDocument();
  });

  it("renders real DTO zero as a normal safe empty state without mock records", () => {
    renderDtoList(emptyPublicDto);
    expect(screen.getByRole("heading", { name: "当前暂无获准公开的导师资料" })).toBeInTheDocument();
    expect(screen.getByText("0", { selector: ".result-count strong" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "示例导师甲" })).not.toBeInTheDocument();
  });

  it("renders one synthetic DTO advisor", () => {
    renderDtoList(syntheticPublicDto);
    expect(screen.getByRole("heading", { name: "合成批准导师" })).toBeInTheDocument();
    expect(screen.getByText(/合成研究导师/)).toBeInTheDocument();
  });

  it("fails closed for malformed DTO", () => {
    renderDtoList({ ...emptyPublicDto, advisorCount: 2 });
    expect(screen.getByRole("heading", { name: "数据安全门已关闭" })).toBeInTheDocument();
  });

  it("shows loading and then resolves in configured mock tests", async () => {
    render(
      <MemoryRouter>
        <AdvisorDataProvider delayMs={1}><AdvisorListPage /></AdvisorDataProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText(/正在准备安全的本地演示界面/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("heading", { name: "导师一览" })).toBeInTheDocument());
  });
});

describe("advisor detail", () => {
  it("renders the undergraduate decision snapshot from existing evidence fields", () => {
    renderDetail("synthetic-approved", "dto");
    const heading = screen.getByRole("heading", { name: "本科生决策速览" });
    const section = heading.closest("section");
    expect(section).not.toBeNull();
    const snapshot = within(section!);
    [
      "核心研究问题",
      "研究工作形态",
      "常用技术与数据",
      "本科生可能切入的公开研究场景",
      "建议准备",
      "公开成果与 Evidence",
      "官方公开项目或招生信息状态",
      "公开资料无法判断的事项",
    ].forEach((label) => expect(snapshot.getByRole("heading", { name: label })).toBeInTheDocument());
    expect(snapshot.getByText("合成科学问题如何被公开证据支持？")).toBeInTheDocument();
    expect(snapshot.getByText(/本科生任务仅为根据公开研究内容推导的可能场景/)).toBeInTheDocument();
  });

  it("shows official-information empty states and interview-only boundaries", () => {
    renderDetail("synthetic-approved", "dto");
    const heading = screen.getByRole("heading", { name: "你可能还想知道" });
    const section = heading.closest("section");
    expect(section).not.toBeNull();
    const boundary = within(section!);
    expect(boundary.getByRole("heading", { name: "官方招生信息" })).toBeInTheDocument();
    expect(boundary.getByRole("heading", { name: "公开项目或基金" })).toBeInTheDocument();
    expect(boundary.getAllByText("暂无公开信息")).toHaveLength(2);
    expect(boundary.getByText("导师管理风格与沟通方式")).toBeInTheDocument();
    expect(boundary.getByText("实验室真实氛围与学生体验")).toBeInTheDocument();
    expect(boundary.getByText("当前名额与具体招募安排")).toBeInTheDocument();
    expect(boundary.getByText(/建议通过官方渠道联系/)).toBeInTheDocument();
  });

  it("renders complete DTO fields and Evidence links", async () => {
    const user = userEvent.setup();
    renderDetail("synthetic-approved", "dto");
    expect(screen.getByRole("heading", { name: "合成批准导师" })).toBeInTheDocument();
    expect(screen.getByText("合成研究导师")).toBeInTheDocument();
    const methodsToggle = screen.getByRole("button", { name: /方法与技术路线/ });
    if (methodsToggle.getAttribute("aria-expanded") !== "true") {
      await user.click(methodsToggle);
    }
    expect(screen.getByRole("heading", { name: "公开研究流程" })).toBeInTheDocument();
    const evidenceToggle = screen.getByRole("button", { name: /完整证据/ });
    if (evidenceToggle.getAttribute("aria-expanded") !== "true") {
      await user.click(evidenceToggle);
    }
    expect(screen.getByRole("heading", { name: /一项用于验证超长公开 Evidence 题名/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /DOI：10\.9999\/synthetic-approved/ })).toHaveAttribute(
      "href",
      expect.stringContaining("10.9999/synthetic-approved"),
    );
  });

  it("lets content Evidence tags locate the public Evidence item", async () => {
    const user = userEvent.setup();
    renderDetail("synthetic-approved", "dto");
    const buttons = screen.getAllByRole("button", { name: "定位到 Evidence E1" });
    await user.click(buttons[0]);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /完整证据/ })).toHaveAttribute("aria-expanded", "true");
    });
    await waitFor(() => {
      expect(document.getElementById("public-evidence-e1")).toHaveFocus();
    });
  });

  it("expands collapsed sections when page nav is clicked", async () => {
    const user = userEvent.setup();
    renderDetail("synthetic-approved", "dto");
    const methodsToggle = screen.getByRole("button", { name: /方法与技术路线/ });
    expect(methodsToggle).toHaveAttribute("aria-expanded", "false");
    await user.click(screen.getByRole("link", { name: "方法路线" }));
    await waitFor(() => {
      expect(methodsToggle).toHaveAttribute("aria-expanded", "true");
    });
    expect(screen.getByLabelText("页面目录").querySelector('a[href="#methods"]')).toHaveClass("is-active");
  });

  it.each(blockedMockIds)("returns the same unavailable page for blocked direct link %s", (id) => {
    renderDetail(id);
    expect(screen.getByRole("heading", { name: "此导师资料不可用" })).toBeInTheDocument();
  });

  it("returns the unavailable page for an invalid DTO id", () => {
    renderDetail("not-a-record", "dto");
    expect(screen.getByRole("heading", { name: "此导师资料不可用" })).toBeInTheDocument();
  });

  it("renders an explicit empty Evidence state", () => {
    renderDetail("demo-compute");
    expect(screen.getByRole("heading", { name: "暂无可靠公开证据" })).toBeInTheDocument();
  });

  it("renders long synthetic content without truncating it", async () => {
    const user = userEvent.setup();
    renderDetail("demo-long-record");
    const evidenceToggle = screen.getByRole("button", { name: /完整证据/ });
    if (evidenceToggle.getAttribute("aria-expanded") !== "true") {
      await user.click(evidenceToggle);
    }
    expect(screen.getByText(/一项用于验证超长论文标题/)).toBeInTheDocument();
    const methodsToggle = screen.getByRole("button", { name: /方法与技术路线/ });
    if (methodsToggle.getAttribute("aria-expanded") !== "true") {
      await user.click(methodsToggle);
    }
    expect(screen.getAllByText(/超长技术名称：多尺度时空特征提取/).length).toBeGreaterThan(0);
  });
});
