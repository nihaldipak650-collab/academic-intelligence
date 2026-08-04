import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  doiHref,
  extractHeadings,
  MarkdownReport,
  slugifyHeading,
} from "../components/MarkdownReport";

describe("合成 Markdown 报告渲染", () => {
  it("为重复中文标题生成稳定且唯一的锚点", () => {
    const headings = extractHeadings("## 公开证据\n### 技术路线\n### 技术路线\n");
    expect(headings.map((heading) => heading.id)).toEqual([
      "公开证据",
      "技术路线",
      "技术路线-2",
    ]);
    expect(slugifyHeading("Boundary Statement")).toBe("boundary-statement");
  });

  it("将 DOI 转为安全的新窗口链接且保留文本", () => {
    render(<MarkdownReport markdown={"DOI: 10.1038/s41586-024-00001-1"} />);
    const link = screen.getByRole("link", { name: "10.1038/s41586-024-00001-1" });
    expect(link).toHaveAttribute("href", "https://doi.org/10.1038/s41586-024-00001-1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(doiHref("10.1000/example")).toBe("https://doi.org/10.1000/example");
  });

  it("呈现 Evidence Tag、表格和 No Evidence 文本", () => {
    render(
      <MarkdownReport
        markdown={"| 项目 | Confidence |\n|---|---|\n| 公开方法 | No Evidence |\n\n**Confidence: Medium**"}
      />,
    );
    expect(screen.getByRole("region", { name: "证据表格" })).toBeInTheDocument();
    expect(screen.getByLabelText("Evidence Confidence：No Evidence")).toBeInTheDocument();
    expect(screen.getByLabelText("Evidence Confidence：Medium")).toBeInTheDocument();
  });

  it("保留合成学术章节及标题结构", () => {
    const markdown = [
      "## 公开学术事实",
      "合成的公开内容。",
      "## 学术分析",
      "合成的分析内容。",
      "### Evidence Boundary",
      "仅用于测试。",
    ].join("\n\n");
    render(<MarkdownReport markdown={markdown} />);
    expect(screen.getByText("合成的公开内容。")).toBeInTheDocument();
    expect(screen.getByText("合成的分析内容。")).toBeInTheDocument();
    expect(extractHeadings(markdown).map((heading) => heading.text)).toEqual([
      "公开学术事实",
      "学术分析",
      "Evidence Boundary",
    ]);
  });
});
