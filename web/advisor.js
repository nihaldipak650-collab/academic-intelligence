"use strict";

const loadingElement = document.querySelector("#detail-loading");
const errorElement = document.querySelector("#detail-error");
const errorMessage = document.querySelector("#detail-error-message");
const contentElement = document.querySelector("#detail-content");
const reportElement = document.querySelector("#report-content");
const academicOnlyNote = document.querySelector("#academic-only-note");
const feedbackLink = document.querySelector("#feedback-link");
const feedbackUnavailable = document.querySelector("#feedback-unavailable");

function showError(message) {
  loadingElement.hidden = true;
  contentElement.hidden = true;
  errorMessage.textContent = message;
  errorElement.hidden = false;
}

function addMetaChip(container, label, value, modifier = "") {
  const chip = document.createElement("span");
  chip.className = `meta-chip ${modifier}`.trim();
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = value;
  chip.append(labelElement, valueElement);
  container.append(chip);
}

function sanitizeRenderedMarkdown(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("script, iframe, object, embed, form").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((element) => {
    for (const attribute of [...element.attributes]) {
      if (attribute.name.toLowerCase().startsWith("on")) element.removeAttribute(attribute.name);
    }
    if (element.hasAttribute("href")) {
      const href = element.getAttribute("href").trim();
      if (/^javascript:/i.test(href)) element.removeAttribute("href");
    }
  });
  template.content.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (/^https?:/i.test(href)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });
  return template.innerHTML;
}

function renderMarkdown(markdown) {
  if (!window.marked || typeof window.marked.parse !== "function") {
    throw new Error("Markdown 渲染组件未加载");
  }
  window.marked.setOptions({ gfm: true, breaks: false });
  const rendered = window.marked.parse(markdown);
  reportElement.innerHTML = sanitizeRenderedMarkdown(rendered);

  const firstHeading = reportElement.querySelector("h1");
  if (firstHeading) firstHeading.remove();
  reportElement.querySelectorAll("table").forEach((table) => {
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "可横向滚动的数据表格");
    table.before(wrapper);
    wrapper.append(table);
  });

  reportElement.querySelectorAll("table").forEach((table) => {
    const headers = [...table.querySelectorAll("thead th")];
    const doiColumn = headers.findIndex((header) => header.textContent.trim().toUpperCase() === "DOI");
    if (doiColumn < 0) return;
    table.querySelectorAll("tbody tr").forEach((row) => {
      const cell = row.children[doiColumn];
      if (!cell || cell.querySelector("a")) return;
      const doi = cell.textContent.trim();
      if (!/^10\.\d{4,9}\/\S+$/i.test(doi)) return;
      const link = document.createElement("a");
      link.href = `https://doi.org/${doi}`;
      link.textContent = doi;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      cell.replaceChildren(link);
    });
  });
}

async function loadSiteConfig() {
  try {
    const response = await fetch("site-config.json", { cache: "no-store" });
    if (!response.ok) return;
    const config = await response.json();
    if (typeof config.feedback_url !== "string" || !config.feedback_url.trim()) return;
    feedbackLink.href = config.feedback_url.trim();
    feedbackLink.hidden = false;
    feedbackUnavailable.hidden = true;
  } catch (error) {
    console.warn("反馈入口配置读取失败", error);
  }
}

async function loadAdvisor() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    showError("链接中缺少导师编号，请返回导师列表重新选择。");
    return;
  }

  try {
    const configResponse = await fetch("advisors.json", { cache: "no-store" });
    if (!configResponse.ok) throw new Error("导师配置读取失败");
    const advisors = await configResponse.json();
    const advisor = advisors.find((item) => item.id === id);
    if (!advisor) {
      showError("没有找到对应的导师，请返回导师列表重新选择。");
      return;
    }

    const reportResponse = await fetch(`reports/${encodeURIComponent(advisor.report)}`, { cache: "no-store" });
    if (!reportResponse.ok) throw new Error(`导师报告读取失败（HTTP ${reportResponse.status}）`);
    const markdown = await reportResponse.text();
    renderMarkdown(markdown);

    document.title = `${advisor.name}导师画像 · Academic Intelligence 0.5 Beta`;
    document.querySelector("#advisor-name").textContent = `${advisor.name}导师画像`;
    document.querySelector("#advisor-summary").textContent = advisor.summary;
    const meta = document.querySelector("#advisor-meta");
    if (advisor.author_match_confidence) {
      addMetaChip(meta, "作者身份匹配", advisor.author_match_confidence, "confidence");
    } else if (advisor.academic_confidence) {
      addMetaChip(meta, "学术证据", advisor.academic_confidence, "confidence");
    }
    addMetaChip(
      meta,
      "经历证据",
      advisor.has_experience_evidence
        ? "包含单案例"
        : advisor.evidence_type === "academic_only"
          ? `${advisor.experience_case_count ?? 0} 条（暂无授权材料）`
          : "未包含",
      advisor.has_experience_evidence ? "experience" : ""
    );
    if (advisor.evidence_type === "academic_only") {
      addMetaChip(meta, "证据类型", "Academic-only");
      academicOnlyNote.hidden = false;
    }
    if (advisor.version) {
      addMetaChip(meta, "版本", advisor.version === "0.5-beta" ? "0.5 Beta 测试版" : advisor.version);
    }
    if (advisor.last_updated) {
      const updatedDate = new Date(advisor.last_updated);
      const displayedDate = Number.isNaN(updatedDate.getTime())
        ? advisor.last_updated
        : new Intl.DateTimeFormat("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Shanghai"
          }).format(updatedDate);
      addMetaChip(meta, "最后更新", displayedDate);
    }
    advisor.tags.forEach((tag) => addMetaChip(meta, "", tag));

    loadingElement.hidden = true;
    contentElement.hidden = false;
  } catch (error) {
    console.error(error);
    showError("报告暂时无法读取。请确认使用启动命令运行网站，并检查报告文件是否已同步。");
  }
}

loadSiteConfig();
loadAdvisor();
