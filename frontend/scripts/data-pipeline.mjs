import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const frontendDir = path.resolve(scriptDir, "..");
export const repoRoot = path.resolve(frontendDir, "..");
export const sourceAdvisorFile = path.join(repoRoot, "web", "advisors.json");
export const sourceReportDir = path.join(repoRoot, "web", "reports");
export const sourceSiteConfigFile = path.join(
  repoRoot,
  "web",
  "site-config.json",
);
export const publicDataDir = path.join(frontendDir, "public", "data");
export const publicReportDir = path.join(frontendDir, "public", "reports");
export const generatedAdvisorFile = path.join(
  publicDataDir,
  "advisors.json",
);
export const generatedSiteConfigFile = path.join(
  publicDataDir,
  "site-config.json",
);

const forbiddenPatterns = [
  [/placeholder/i, "placeholder"],
  [/example\.com/i, "example.com"],
  [/10\.0000\//i, "10.0000/"],
  [/lorem ipsum/i, "lorem ipsum"],
  [/mock advisor/i, "mock advisor"],
  [/待人工核验后补充/i, "待人工核验后补充"],
  [/demo doi/i, "demo DOI"],
];

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function normalizeConfidence(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized.startsWith("high")) return "High";
  if (normalized.startsWith("medium")) return "Medium";
  if (normalized.startsWith("low")) return "Low";
  return "Unknown";
}

function stripMarkdown(value) {
  return value
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "")
    .replace(/\[E\d+(?:,\s*E\d+)*\]/gi, "")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionBody(markdown, headingPattern) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => {
    const match = /^(#{2,4})\s+(.+)$/.exec(line);
    return match && headingPattern.test(match[2]);
  });
  if (start < 0) return "";
  const level = /^(#+)/.exec(lines[start])?.[1].length ?? 2;
  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const heading = /^(#+)\s+/.exec(lines[index]);
    if (heading && heading[1].length <= level) break;
    body.push(lines[index]);
  }
  return body.join("\n");
}

function listItems(section, limit = 3) {
  return section
    .split(/\r?\n/)
    .filter((line) => /^\s*(?:[-*+]|\d+[.)])\s+/.test(line))
    .map(stripMarkdown)
    .filter(Boolean)
    .slice(0, limit);
}

function extractTechniques(markdown) {
  const directLine = markdown
    .split(/\r?\n/)
    .find((line) => /[*_]*技术路线[*_]*[：:]/.test(line));
  if (directLine) {
    const content = stripMarkdown(directLine).replace(/^技术路线[：:]\s*/, "");
    return content
      .split(/[、，,；;]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }
  return listItems(
    sectionBody(markdown, /(Main Technical Routes|技术路线)/i),
    4,
  );
}

function extractUndergraduatePaths(markdown) {
  return listItems(
    sectionBody(
      markdown,
      /(Possible Undergraduate Tasks|本科生可能参与的任务|可能参与的任务)/i,
    ),
    3,
  );
}

function extractVersion(raw, markdown) {
  if (raw.version) return raw.version;
  const title = markdown.split(/\r?\n/, 1)[0] ?? "";
  const match = /\bv(\d+(?:\.\d+)?)\s*(Demo)?\b/i.exec(title);
  return match
    ? `${match[1]}${match[2] ? "-demo" : ""}`
    : "source-not-specified";
}

function assertNoPlaceholder(label, text) {
  const hit = forbiddenPatterns.find(([pattern]) => pattern.test(text));
  invariant(!hit, `${label} 包含禁止的演示占位内容：${hit?.[1]}`);
}

function assertRelativeWebPath(label, value) {
  invariant(typeof value === "string" && value.length > 0, `${label} 不能为空`);
  invariant(!value.startsWith("/"), `${label} 不能以 / 开头`);
  invariant(!value.includes("\\"), `${label} 不能包含 Windows 路径分隔符`);
  invariant(!/^[a-z]:/i.test(value), `${label} 不能包含 Windows 绝对路径`);
  invariant(!value.includes(".."), `${label} 不能包含父目录跳转`);
}

export async function buildAdvisorData() {
  const sourceAdvisors = await readJson(sourceAdvisorFile);
  invariant(Array.isArray(sourceAdvisors), "web/advisors.json 必须是数组");
  invariant(sourceAdvisors.length > 0, "导师配置为空");

  const seenIds = new Set();
  const seenReports = new Set();
  const advisors = [];
  const reports = [];
  const warnings = [];

  for (const raw of sourceAdvisors) {
    invariant(raw && typeof raw === "object", "导师配置项必须是对象");
    invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.id), `ID 非法：${raw.id}`);
    invariant(!seenIds.has(raw.id), `导师 ID 重复：${raw.id}`);
    invariant(typeof raw.name === "string" && raw.name.trim(), `导师 ${raw.id} 缺少姓名`);
    invariant(
      typeof raw.summary === "string" && raw.summary.trim(),
      `导师 ${raw.id} 缺少摘要`,
    );
    invariant(
      Array.isArray(raw.tags) && raw.tags.length > 0,
      `导师 ${raw.id} 缺少研究标签`,
    );
    invariant(
      typeof raw.report === "string" && raw.report.endsWith(".md"),
      `导师 ${raw.id} 报告路径无效`,
    );
    invariant(!seenReports.has(raw.report), `报告路径重复：${raw.report}`);
    invariant(
      typeof raw.has_experience_evidence === "boolean",
      `导师 ${raw.id} 缺少 Experience 状态`,
    );

    seenIds.add(raw.id);
    seenReports.add(raw.report);

    const reportFile = path.join(sourceReportDir, raw.report);
    const markdown = await readFile(reportFile, "utf8").catch(() => {
      throw new Error(`导师 ${raw.id} 的报告不存在：web/reports/${raw.report}`);
    });
    invariant(
      markdown.split(/\r?\n/, 1)[0].includes(raw.name),
      `报告与导师姓名不匹配：${raw.id} -> ${raw.report}`,
    );
    assertNoPlaceholder(`导师 ${raw.id} 配置`, JSON.stringify(raw));
    assertNoPlaceholder(`导师 ${raw.id} 报告`, markdown);

    const hasExperience = raw.has_experience_evidence;
    const experienceCaseCount =
      raw.experience_case_count ?? (hasExperience ? 1 : 0);
    invariant(
      Number.isInteger(experienceCaseCount) && experienceCaseCount >= 0,
      `导师 ${raw.id} 的 experience_case_count 非法`,
    );
    invariant(
      hasExperience === (experienceCaseCount > 0),
      `导师 ${raw.id} 的 Experience 布尔值与案例数量不一致`,
    );
    const evidenceType =
      raw.evidence_type ??
      (hasExperience ? "academic_and_experience" : "academic_only");
    invariant(
      ["academic_only", "academic_and_experience"].includes(evidenceType),
      `导师 ${raw.id} 的 evidence_type 非法`,
    );
    invariant(
      (evidenceType === "academic_only") === !hasExperience,
      `导师 ${raw.id} 的 Evidence 类型与 Experience 状态不一致`,
    );

    const authorConfidenceRaw =
      raw.author_match_confidence ?? raw.academic_confidence;
    const authorMatchConfidence = normalizeConfidence(authorConfidenceRaw);
    if (!raw.author_match_confidence) {
      warnings.push(
        `${raw.name}：来源缺少 author_match_confidence，保留 legacy academic_confidence 等级。`,
      );
    }
    if (!raw.last_updated) {
      warnings.push(`${raw.name}：来源缺少 last_updated，前端显示“来源未标注”。`);
    }

    const reportPath = `reports/${raw.report}`;
    assertRelativeWebPath(`导师 ${raw.id} reportPath`, reportPath);

    advisors.push({
      id: raw.id,
      nameZh: raw.name.trim(),
      ...(raw.english_name ? { nameEn: raw.english_name.trim() } : {}),
      ...(raw.institution ? { institution: raw.institution.trim() } : {}),
      initials: raw.name.trim().slice(0, 1),
      summary: raw.summary.trim(),
      tags: [...new Set(raw.tags.map((tag) => String(tag).trim()).filter(Boolean))],
      categoryTags: [
        ...new Set(raw.tags.map((tag) => String(tag).trim()).filter(Boolean)),
      ],
      authorMatchConfidence,
      authorConfidenceSource: raw.author_match_confidence
        ? "author_match_confidence"
        : "legacy_academic_confidence",
      evidenceType,
      hasExperienceEvidence: hasExperience,
      experienceCaseCount,
      version: extractVersion(raw, markdown),
      status: raw.status ?? "published",
      lastUpdated: raw.last_updated ?? null,
      reportPath,
      reportSha256: sha256(markdown),
      sourceTypeLabel:
        evidenceType === "academic_only"
          ? "仅公开学术证据"
          : `学术证据 + ${experienceCaseCount} 个授权经历案例`,
      sourceLabel: `web/advisors.json + web/reports/${raw.report}`,
      quickSummary: {
        coreDirections: raw.tags.slice(0, 5),
        mainTechniques: extractTechniques(markdown),
        undergraduatePaths: extractUndergraduatePaths(markdown),
      },
    });
    reports.push({ name: raw.report, source: reportFile, markdown });
  }

  return {
    envelope: {
      schemaVersion: 1,
      source: "web/advisors.json + web/reports",
      advisorCount: advisors.length,
      advisors,
    },
    reports,
    warnings,
  };
}

export async function syncAdvisorData() {
  const result = await buildAdvisorData();
  const sourceSiteConfig = await readJson(sourceSiteConfigFile).catch(() => ({}));
  const siteConfig = {
    feedbackUrl:
      typeof sourceSiteConfig.feedback_url === "string"
        ? sourceSiteConfig.feedback_url.trim()
        : "",
  };

  await mkdir(publicDataDir, { recursive: true });
  await mkdir(publicReportDir, { recursive: true });

  const expectedReports = new Set(result.reports.map((report) => report.name));
  const existingReports = await readdir(publicReportDir).catch(() => []);
  for (const name of existingReports) {
    if (name.endsWith(".md") && !expectedReports.has(name)) {
      await rm(path.join(publicReportDir, name));
    }
  }

  await Promise.all(
    result.reports.map((report) =>
      copyFile(report.source, path.join(publicReportDir, report.name)),
    ),
  );
  await writeFile(
    generatedAdvisorFile,
    `${JSON.stringify(result.envelope, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    generatedSiteConfigFile,
    `${JSON.stringify(siteConfig, null, 2)}\n`,
    "utf8",
  );

  return { ...result, siteConfig };
}

export async function validateGeneratedData() {
  const expected = await buildAdvisorData();
  const generated = await readJson(generatedAdvisorFile).catch(() => {
    throw new Error("缺少 frontend/public/data/advisors.json，请先运行 sync:data");
  });
  invariant(
    JSON.stringify(generated) === JSON.stringify(expected.envelope),
    "生成的 advisors.json 与当前 web 源数据不一致，请重新运行 sync:data",
  );
  invariant(
    generated.advisorCount === generated.advisors.length,
    "advisorCount 与实际导师数不一致",
  );

  const ids = new Set();
  const reportPaths = new Set();
  for (const advisor of generated.advisors) {
    invariant(!ids.has(advisor.id), `生成数据存在重复 ID：${advisor.id}`);
    invariant(
      !reportPaths.has(advisor.reportPath),
      `生成数据存在重复报告路径：${advisor.reportPath}`,
    );
    ids.add(advisor.id);
    reportPaths.add(advisor.reportPath);
    assertRelativeWebPath(`${advisor.id} reportPath`, advisor.reportPath);
    invariant(advisor.tags.length > 0, `${advisor.id} 没有标签`);
    invariant(advisor.summary.trim(), `${advisor.id} 没有摘要`);
    invariant(
      advisor.hasExperienceEvidence === (advisor.experienceCaseCount > 0),
      `${advisor.id} 的 Experience 状态不一致`,
    );

    const publicFile = path.join(frontendDir, "public", advisor.reportPath);
    const sourceName = path.basename(advisor.reportPath);
    const sourceFile = path.join(sourceReportDir, sourceName);
    const [publicContent, sourceContent] = await Promise.all([
      readFile(publicFile, "utf8"),
      readFile(sourceFile, "utf8"),
    ]);
    invariant(
      publicContent === sourceContent,
      `${advisor.id} 的网页报告副本与源报告不一致`,
    );
    invariant(
      sha256(publicContent) === advisor.reportSha256,
      `${advisor.id} 的报告哈希不一致`,
    );
    invariant(
      publicContent.split(/\r?\n/, 1)[0].includes(advisor.nameZh),
      `${advisor.id} 的报告标题姓名不匹配`,
    );
    assertNoPlaceholder(`${advisor.id} 生成数据`, JSON.stringify(advisor));
    assertNoPlaceholder(`${advisor.id} 网页报告`, publicContent);
  }

  const generatedText = await readFile(generatedAdvisorFile, "utf8");
  invariant(
    !/[a-z]:\\/i.test(generatedText),
    "生成的前端数据包含 Windows 绝对路径",
  );

  const actualReports = (await readdir(publicReportDir))
    .filter((name) => name.endsWith(".md"))
    .sort();
  const expectedReports = expected.reports.map((item) => item.name).sort();
  invariant(
    JSON.stringify(actualReports) === JSON.stringify(expectedReports),
    "frontend/public/reports 中存在缺失或多余报告",
  );

  const generatedConfig = await readJson(generatedSiteConfigFile).catch(() => {
    throw new Error("缺少 frontend/public/data/site-config.json");
  });
  const sourceConfig = await readJson(sourceSiteConfigFile).catch(() => ({}));
  invariant(
    generatedConfig.feedbackUrl === (sourceConfig.feedback_url ?? "").trim(),
    "反馈链接未与 web/site-config.json 同步",
  );

  return expected;
}
