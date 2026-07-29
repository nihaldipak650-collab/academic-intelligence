import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  doiHref,
  extractHeadings,
  MarkdownReport,
  slugifyHeading,
} from "../components/MarkdownReport";

describe("Markdown 报告渲染", () => {
  it("为重复中文标题生成稳定且唯一的锚点", () => {
    const headings = extractHeadings(
      "## 证据置信度\n### 技术路线\n### 技术路线\n",
    );
    expect(headings.map((heading) => heading.id)).toEqual([
      "证据置信度",
      "技术路线",
      "技术路线-2",
    ]);
    expect(slugifyHeading("🧾 Boundary Statement")).toBe(
      "boundary-statement",
    );
  });

  it("将 DOI 转为安全的新窗口链接且保留文本", () => {
    render(<MarkdownReport markdown={"DOI: 10.1038/s41586-024-00001-1"} />);
    const link = screen.getByRole("link", {
      name: "10.1038/s41586-024-00001-1",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://doi.org/10.1038/s41586-024-00001-1",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(doiHref("10.1000/example")).toBe(
      "https://doi.org/10.1000/example",
    );
  });

  it("不重复转换已经存在的 doi.org 链接", () => {
    render(
      <MarkdownReport
        markdown={"https://doi.org/10.1038/s41586-024-00001-1"}
      />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("呈现 Evidence Tag、表格和 No Evidence 文本", () => {
    render(
      <MarkdownReport
        markdown={
          "| 项目 | Confidence |\n|---|---|\n| 指导频率 | No Evidence |\n\n**Confidence: Medium**"
        }
      />,
    );
    expect(screen.getByRole("region", { name: "证据表格" })).toBeInTheDocument();
    expect(
      screen.getByLabelText("Evidence Confidence：No Evidence"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Evidence Confidence：Medium"),
    ).toBeInTheDocument();
  });

  it("按标题级 AST 隐藏学生经历章节并保留后续学术内容", () => {
    const markdown = [
      "## 公开学术事实",
      "保留的公开内容。",
      "## 第二部分：本科生科研经历参考（Undergraduate Research Experience）",
      "### 本科生科研经历证据（Experience Evidence）",
      "代表性：Unknown。具体学生经历正文。",
      "## 第三部分：学术分析",
      "保留的后续学术内容。",
      "### 本科生经历证据（Experience Evidence）",
      "另一段具体经历。",
      "### Evidence Boundary",
      "边界继续保留。",
    ].join("\n\n");

    render(<MarkdownReport markdown={markdown} hideExperienceSections />);
    expect(screen.getByText("保留的公开内容。")).toBeInTheDocument();
    expect(screen.getByText("保留的后续学术内容。")).toBeInTheDocument();
    expect(screen.getByText("边界继续保留。")).toBeInTheDocument();
    expect(screen.queryByText(/具体学生经历正文/)).not.toBeInTheDocument();
    expect(screen.queryByText(/另一段具体经历/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Unknown/)).not.toBeInTheDocument();

    expect(
      extractHeadings(markdown, true).map((heading) => heading.text),
    ).toEqual(["公开学术事实", "第三部分：学术分析", "Evidence Boundary"]);
  });

  it("混合报告按标题边界隐藏后续个案复述并保留使用边界", () => {
    const markdown = [
      "# 混合证据报告",
      "> 用途声明：Experience Evidence 来自一名本科生访谈。",
      "## 第一部分：学术基础",
      "### 公开科研事实",
      "保留的论文与技术内容。",
      "## 第二部分：本科生科研经历参考（Undergraduate Research Experience）",
      "具体经历正文。",
      "## 第三部分：成长分析",
      "### 成长路线",
      "通用成长说明。",
      "#### 3–6个月",
      "该个案曾独立完成一次具体实验。",
      "#### 6–12个月",
      "保留的通用成长说明。",
      "## 第四部分：证据与边界",
      "### 学术证据与经历证据交叉",
      "Experience Evidence 补充了该学生的具体经历。",
      "### 使用边界声明（Boundary Statement）",
      "不把单个学生经历推广为实验室事实；Academic Evidence 与 Experience Evidence 必须分开阅读。",
    ].join("\n\n");

    render(<MarkdownReport markdown={markdown} hideExperienceSections />);
    expect(screen.getByText("保留的论文与技术内容。")).toBeInTheDocument();
    expect(screen.getByText("通用成长说明。")).toBeInTheDocument();
    expect(screen.getByText("保留的通用成长说明。")).toBeInTheDocument();
    expect(screen.getByText(/不把单个学生经历推广/)).toBeInTheDocument();
    expect(screen.queryByText(/一名本科生访谈/)).not.toBeInTheDocument();
    expect(screen.queryByText(/独立完成一次具体实验/)).not.toBeInTheDocument();
    expect(screen.queryByText(/补充了该学生的具体经历/)).not.toBeInTheDocument();

    expect(
      extractHeadings(markdown, true).map((heading) => heading.text),
    ).toEqual([
      "第一部分：学术基础",
      "公开科研事实",
      "第三部分：成长分析",
      "成长路线",
      "6–12个月",
      "第四部分：证据与边界",
      "使用边界声明（Boundary Statement）",
    ]);
  });
});
