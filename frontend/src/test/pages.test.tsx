import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import advisorJson from "../../public/data/advisors.json";
import { AdvisorDataProvider } from "../data/AdvisorDataContext";
import { AdvisorDetailPage } from "../pages/AdvisorDetailPage";
import { AdvisorListPage } from "../pages/AdvisorListPage";
import type { AdvisorDataEnvelope } from "../types/advisor";

const data = advisorJson as AdvisorDataEnvelope;
const config = { feedbackUrl: "https://v.wjx.cn/vm/Pw7GGmz.aspx" };

function renderList() {
  return render(
    <AdvisorDataProvider initialData={data} initialConfig={config}>
      <MemoryRouter>
        <AdvisorListPage />
      </MemoryRouter>
    </AdvisorDataProvider>,
  );
}

function renderDetail(path: string, initialData = data) {
  return render(
    <AdvisorDataProvider initialData={initialData} initialConfig={config}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/advisor/:id" element={<AdvisorDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AdvisorDataProvider>,
  );
}

describe("导师列表页", () => {
  it("显示全部真实导师和明确证据边界", () => {
    renderList();
    expect(screen.getAllByRole("link", { name: /查看完整证据报告/ })).toHaveLength(
      7,
    );
    expect(screen.queryByText("职位 / 身份：暂无公开信息")).not.toBeInTheDocument();
    expect(screen.getAllByText("公开学术证据 + AI整理")).toHaveLength(7);
    expect(screen.queryByText(/经授权的本科生经历/)).not.toBeInTheDocument();
  });

  it("实时搜索并显示无结果 Empty State", async () => {
    const user = userEvent.setup();
    renderList();
    await user.type(
      screen.getByRole("searchbox", {
        name: "搜索姓名、机构、摘要、研究方向或技术",
      }),
      "不存在的导师",
    );
    expect(
      screen.getByText("当前筛选条件没有匹配导师"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "清除筛选" }));
    expect(screen.getAllByRole("link", { name: /查看完整证据报告/ })).toHaveLength(
      7,
    );
  });

  it("筛选按钮可与搜索组合", async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(screen.getByRole("button", { name: "孤独症 2" }));
    expect(screen.getAllByRole("link", { name: /查看完整证据报告/ })).toHaveLength(
      2,
    );
    await user.type(
      screen.getByRole("searchbox", {
        name: "搜索姓名、机构、摘要、研究方向或技术",
      }),
      "高度近视",
    );
    expect(screen.getByRole("heading", { name: /胡正茂/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /郭辉/ })).not.toBeInTheDocument();
  });

  it("多标签使用 OR 并可一键恢复全部", async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(screen.getByRole("button", { name: "孤独症 2" }));
    await user.click(screen.getByRole("button", { name: "结构生物学 1" }));
    expect(screen.getAllByRole("link", { name: /查看完整证据报告/ })).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "全部 7" }));
    expect(screen.getAllByRole("link", { name: /查看完整证据报告/ })).toHaveLength(7);
  });
});

describe("导师详情页", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          [
            "# 导师画像",
            "## 公开学术事实",
            "保留的学术内容。Confidence: Medium。 DOI: 10.1000/test",
            "## 第二部分：本科生科研经历参考（Undergraduate Research Experience）",
            "### 本科生科研经历证据（Experience Evidence）",
            "代表性：Unknown。具体学生经历正文。",
            "## 第三部分：学术分析",
            "保留的后续学术内容。",
          ].join("\n\n"),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("按 ID 呈现正确导师并加载报告", async () => {
    renderDetail("/advisor/guo-hui");
    expect(screen.getByRole("heading", { name: /郭辉/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "先看这里" })).toBeInTheDocument();
    expect(screen.getAllByText("待核验").length).toBeGreaterThanOrEqual(1);
    await waitFor(() =>
      expect(screen.getByText("完整学术报告与论文证据")).toBeInTheDocument(),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/reports\/Guo_Hui_profile_academic_zh\.md$/),
    );
  });

  it("Experience 来源导师不公开案例正文、数量或 Unknown", async () => {
    renderDetail("/advisor/liu-jing");
    await waitFor(() =>
      expect(screen.getByText("保留的后续学术内容。")).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/学生经历信息暂未纳入1\.0公开展示/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/具体学生经历正文/)).not.toBeInTheDocument();
    expect(screen.queryByText(/包含 1 个/)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Unknown|null|undefined/i);
  });

  it("联系方式缺失、动态状态和任务证据缺失均显示规范空状态", () => {
    renderDetail("/advisor/liu-jing");
    expect(screen.getAllByText("暂无公开信息").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole("heading", { name: "暂无可靠公开证据" })).toBeInTheDocument();
    expect(screen.getAllByText("待核验").length).toBeGreaterThanOrEqual(2);
  });

  it("结构化官方主页和来源使用安全的新窗口链接", () => {
    const first = data.advisors[0];
    const contactData: AdvisorDataEnvelope = {
      ...data,
      advisors: data.advisors.map((advisor) =>
        advisor.id === first.id
          ? {
              ...advisor,
              position: "教授",
              contact: {
                officialEmail: "public@example.edu.cn",
                officialPhone: null,
                officialHomepage: "https://example.edu.cn/advisor",
                laboratoryAddress: "校本部公开地址",
                sourceUrl: "https://example.edu.cn/source",
              },
            }
          : advisor,
      ),
    };
    renderDetail(`/advisor/${first.id}`, contactData);
    const homepage = screen.getByRole("link", { name: "打开官方页面" });
    expect(homepage).toHaveAttribute("target", "_blank");
    expect(homepage).toHaveAttribute("rel", "noopener noreferrer");
    expect(homepage).toHaveAttribute("href", "https://example.edu.cn/advisor");
  });

  it("成长路线保持折叠，完整报告无需点击即可直接阅读", async () => {
    renderDetail("/advisor/guo-hui");
    const growthSummary = screen.getByText("科研成长路线与前置技能");
    expect(growthSummary.closest("details")).not.toHaveAttribute("open");
    await waitFor(() =>
      expect(screen.getByText("完整学术报告与论文证据")).toBeInTheDocument(),
    );
    expect(screen.getByText("保留的后续学术内容。")).toBeVisible();
    expect(
      screen.getByText("完整学术报告与论文证据").closest("details"),
    ).toBeNull();
  });

  it("网站版本与真实档案版本语义分离", () => {
    renderDetail("/advisor/guo-hui");
    expect(screen.getByText("网站版本")).toBeInTheDocument();
    expect(screen.getByText("1.0 RC1")).toBeInTheDocument();
    expect(screen.getByText("档案版本")).toBeInTheDocument();
    expect(screen.getByText("0.5-beta")).toBeInTheDocument();
  });

  it("主要技术先显示三项，并可展开查看全部四项", async () => {
    const user = userEvent.setup();
    const advisor = data.advisors.find((item) => item.id === "li-faxiang")!;
    renderDetail("/advisor/li-faxiang");
    const disclosure = screen.getByText("查看全部技术（共4项）");
    expect(advisor.quickSummary.mainTechniques).toHaveLength(4);
    expect(screen.getByText(advisor.quickSummary.mainTechniques[3])).toBeInTheDocument();
    await user.click(disclosure);
    expect(disclosure.closest("details")).toHaveAttribute("open");
  });

  it("7 位导师的详情路由均能呈现正确姓名", () => {
    data.advisors.forEach((advisor) => {
      const view = renderDetail(`/advisor/${advisor.id}`);
      expect(screen.getByRole("heading", { name: new RegExp(advisor.nameZh) })).toBeInTheDocument();
      view.unmount();
    });
  });

  it("无效 ID 显示错误页而不是空白或跳转", () => {
    renderDetail("/advisor/not-a-real-id");
    expect(screen.getByText("没有找到这位导师")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "返回导师列表" }),
    ).toHaveAttribute("href", "/advisors");
  });

  it("报告请求失败显示可恢复错误", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    renderDetail("/advisor/guo-hui");
    await waitFor(() =>
      expect(screen.getByText("完整报告暂时无法读取")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: "返回导师列表" }),
    ).toHaveAttribute("href", "/advisors");
  });
});
