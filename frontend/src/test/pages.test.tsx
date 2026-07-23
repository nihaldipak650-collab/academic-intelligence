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

function renderDetail(path: string) {
  return render(
    <AdvisorDataProvider initialData={data} initialConfig={config}>
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
    expect(screen.getAllByText("暂无经授权的本科生经历证据")).toHaveLength(5);
    expect(
      screen.getAllByText(/包含 1 个经授权的本科生经历案例/),
    ).toHaveLength(2);
  });

  it("实时搜索并显示无结果 Empty State", async () => {
    const user = userEvent.setup();
    renderList();
    await user.type(
      screen.getByRole("searchbox", {
        name: "搜索姓名、摘要或研究方向",
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
        name: "搜索姓名、摘要或研究方向",
      }),
      "高度近视",
    );
    expect(screen.getByRole("heading", { name: /胡正茂/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /郭辉/ })).not.toBeInTheDocument();
  });
});

describe("导师详情页", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          "# 导师画像：郭辉\n\n## 🔎 Evidence Confidence\n\nConfidence: Medium。\n\nDOI: 10.1000/test",
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("按 ID 呈现正确导师并加载报告", async () => {
    renderDetail("/advisor/guo-hui");
    expect(screen.getByRole("heading", { name: /郭辉/ })).toBeInTheDocument();
    expect(
      screen.getByText(
        "当前仅包含公开学术证据，暂无经过授权的本科生经历材料。",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("完整审核报告")).toBeInTheDocument(),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/reports\/Guo_Hui_profile_academic_zh\.md$/),
    );
  });

  it("有经历导师显示单案例边界", () => {
    renderDetail("/advisor/liu-jing");
    expect(
      screen.getByText("包含 1 个经授权的本科生经历案例"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^代表性为 Unknown。经历内容/),
    ).toBeInTheDocument();
  });

  it("无效 ID 显示错误页而不是空白或跳转", () => {
    renderDetail("/advisor/not-a-real-id");
    expect(screen.getByText("没有找到这位导师")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "返回导师列表" }),
    ).toBeInTheDocument();
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
    ).toBeInTheDocument();
  });
});
