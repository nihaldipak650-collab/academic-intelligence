"use strict";

const listElement = document.querySelector("#advisor-list");
const searchInput = document.querySelector("#advisor-search");
const countElement = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
let advisors = [];

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderCard(advisor) {
  const article = makeElement("article", "advisor-card");
  const headingRow = makeElement("div", "card-heading");
  const titleGroup = makeElement("div");
  titleGroup.append(makeElement("h3", "advisor-name", advisor.name));
  titleGroup.append(makeElement("p", "english-name", advisor.english_name));
  headingRow.append(titleGroup);

  const badgeStack = makeElement("div", "card-badges");
  const isAcademicOnly = advisor.evidence_type === "academic_only";
  badgeStack.append(
    makeElement(
      "span",
      advisor.has_experience_evidence ? "evidence-pill mixed" : "evidence-pill academic",
      advisor.has_experience_evidence
        ? "学术＋经历证据"
        : isAcademicOnly
          ? "Academic-only"
          : "公开学术证据"
    )
  );
  if (advisor.status === "beta") {
    badgeStack.append(makeElement("span", "beta-pill", "0.5 Beta"));
  }
  headingRow.append(badgeStack);
  article.append(headingRow);
  if (advisor.institution) {
    article.append(makeElement("p", "institution-line", advisor.institution));
  }
  article.append(makeElement("p", "card-summary", advisor.summary));

  const tagList = makeElement("ul", "tag-list");
  tagList.setAttribute("aria-label", "研究方向标签");
  advisor.tags.forEach((tag) => tagList.append(makeElement("li", "tag", tag)));
  article.append(tagList);

  const footer = makeElement("div", "card-footer");
  const confidenceValue = advisor.author_match_confidence || advisor.academic_confidence;
  if (confidenceValue) {
    const confidence = makeElement("p", "confidence-line");
    confidence.append(
      makeElement(
        "span",
        "confidence-label",
        advisor.author_match_confidence ? "作者身份匹配" : "学术证据"
      )
    );
    confidence.append(makeElement("strong", "confidence-value", confidenceValue));
    footer.append(confidence);
  }

  const link = makeElement("a", "card-link", "查看详情 →");
  link.href = `advisor.html?id=${encodeURIComponent(advisor.id)}`;
  link.setAttribute("aria-label", `查看${advisor.name}的导师画像详情`);
  footer.append(link);
  article.append(footer);
  return article;
}

function renderAdvisors(items) {
  listElement.replaceChildren(...items.map(renderCard));
  emptyState.hidden = items.length !== 0;
  countElement.textContent = `共 ${items.length} 位导师`;
}

function applySearch() {
  const query = searchInput.value.trim().toLocaleLowerCase("zh-CN");
  if (!query) {
    renderAdvisors(advisors);
    return;
  }
  const filtered = advisors.filter((advisor) => {
    const searchable = [advisor.name, advisor.english_name, advisor.summary, ...advisor.tags]
      .join(" ")
      .toLocaleLowerCase("zh-CN");
    return searchable.includes(query);
  });
  renderAdvisors(filtered);
}

async function loadAdvisors() {
  try {
    const response = await fetch("advisors.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("导师配置格式无效");
    advisors = data;
    renderAdvisors(advisors);
  } catch (error) {
    listElement.innerHTML = "";
    const panel = makeElement("div", "error-panel compact");
    panel.append(makeElement("h3", "", "导师列表读取失败"));
    panel.append(makeElement("p", "", "请通过项目提供的启动命令打开网站，不要直接双击 HTML 文件。"));
    listElement.append(panel);
    countElement.textContent = "";
    console.error(error);
  }
}

searchInput.addEventListener("input", applySearch);
loadAdvisors();
