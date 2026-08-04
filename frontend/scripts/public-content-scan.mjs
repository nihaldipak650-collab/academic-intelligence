import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");

export const ALLOWED_PUBLICATION_STATUSES = new Set(["approved", "published"]);
export const REQUIRED_SCHEMA_VERSION = "1.0.4";
export const LEGACY_REPORT_NAMES = new Set([
  "Guo_Hui_profile_academic_zh.md",
  "Hu_Dehua_profile_academic_zh.md",
  "Hu_Zhengmao_profile_academic_zh.md",
  "Li_Jiada_profile_academic_zh.md",
  "Li_advisor_profile_v1_5_demo_display.md",
  "Liu_advisor_profile_v1_5_demo_display.md",
  "Xiang_Rong_profile_zh.md",
]);
export const SENSITIVE_ADVISOR_IDS_BY_NAME = Object.freeze({
  "项荣": "xiang-rong",
  "刘静": "liu-jing",
  "李发祥": "li-faxiang",
  "郭辉": "guo-hui",
  "胡德华": "hu-dehua",
  "胡正茂": "hu-zhengmao",
  "李家大": "li-jiada",
});
export const SENSITIVE_NAMES = Object.freeze(Object.keys(SENSITIVE_ADVISOR_IDS_BY_NAME));

const blockedPathPatterns = [
  /identity-review/i,
  /validation-report/i,
  /evidence-manifest/i,
  /advisor-batches/i,
  /(?:^|\/)private(?:\/|$)/i,
  /(?:^|\/)debug(?:\/|$)/i,
  /review[^/]*\.zip$/i,
];

const experienceContentPatterns = [
  /Undergraduate Research Experience/i,
  /Experience Evidence/i,
  /本科生科研经历/,
  /本科生经历证据/,
  /学生经历正文/,
  /学生个案/,
  /本科生访谈/,
  /授权经历案例/,
  /经历案例/,
];

const nonReportExperienceContentPatterns = experienceContentPatterns.filter(
  (pattern) => pattern.source !== "Experience Evidence",
);

const localAbsolutePathPatterns = [
  /\b[A-Za-z]:[\\/](?:[\\/])?Users[\\/]/i,
  /\b[A-Za-z]:[\\/](?:[\\/])?(?:Documents|Desktop)[\\/]/i,
  /\/(?:Users|home)\/[A-Za-z0-9._-]+\//,
];

const secretPatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bghp_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|password)\s*[:=]\s*["'][^"'\r\n]{8,}["']/i,
  /\bToken\s*[:=]\s*[A-Za-z0-9_./+=-]{8,}\b/i,
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

async function walkFiles(root) {
  const files = [];
  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true }).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(fullPath);
      else if (entry.isFile()) files.push(fullPath);
    }
  }
  await visit(root);
  return files;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function safeReportName(value) {
  return (
    typeof value === "string" &&
    value.endsWith(".md") &&
    path.basename(value) === value &&
    !value.includes("..") &&
    !value.includes("\\")
  );
}

function safePublicReportPath(value) {
  return (
    typeof value === "string" &&
    value.startsWith("reports/") &&
    safeReportName(value.slice("reports/".length))
  );
}

export function findExperienceContentViolations(text) {
  return experienceContentPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.source);
}

function findPatternViolations(text, patterns) {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function countSensitiveNameHits(text, allowedNames = new Set()) {
  return SENSITIVE_NAMES.reduce(
    (total, name) =>
      allowedNames.has(name) ? total : total + text.split(name).length - 1,
    0,
  );
}

function normalizedRelativePath(root, file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function isAllowedGeneratedPath(relativePath, expectedReports) {
  if (
    relativePath === "index.html" ||
    relativePath === "data/advisors.json" ||
    relativePath === "data/site-config.json"
  ) {
    return true;
  }
  if (/^assets\/(?:[^/]+\/)*[^/]+\.(?:js|css)$/i.test(relativePath)) return true;
  return expectedReports.has(relativePath);
}

export function evaluatePublicationGate(raw) {
  const reasons = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { allowed: false, reasons: ["record_not_object"] };
  }
  if (raw.schema_version !== REQUIRED_SCHEMA_VERSION) reasons.push("schema_version_not_1.0.4");
  if (raw.release_eligible !== true) reasons.push("release_eligible_not_true");
  if (!ALLOWED_PUBLICATION_STATUSES.has(raw.publication_status)) {
    reasons.push("publication_status_not_allowed");
  }
  if (raw.has_experience_evidence !== false) reasons.push("experience_not_false");
  if (raw.experience_case_count !== 0) reasons.push("experience_count_not_zero");
  if (raw.evidence_type !== "academic_only") reasons.push("evidence_type_not_academic_only");
  if (typeof raw.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.id)) {
    reasons.push("invalid_id");
  }
  if (typeof raw.name !== "string" || !raw.name.trim()) reasons.push("missing_name");
  if (typeof raw.summary !== "string" || !raw.summary.trim()) reasons.push("missing_summary");
  if (!Array.isArray(raw.tags) || raw.tags.length === 0) reasons.push("missing_tags");
  if (!safeReportName(raw.report)) reasons.push("invalid_report");
  if (LEGACY_REPORT_NAMES.has(raw.report)) reasons.push("legacy_report_name_blocked");
  return { allowed: reasons.length === 0, reasons };
}

export async function evaluateReleaseProvenance(raw, validationRoot) {
  const reasons = [];
  if (!raw || typeof raw.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.id)) {
    return { allowed: false, reasons: ["invalid_validation_record_id"] };
  }
  const validationFile = path.join(validationRoot, raw.id, "validation-report-v1.json");
  const validation = await readJson(validationFile).catch(() => null);
  if (!validation) return { allowed: false, reasons: ["validation_report_missing"] };
  if (validation.valid !== true) reasons.push("validation_not_valid");
  if (validation.release_eligible !== true) reasons.push("validation_release_eligible_not_true");
  const validationStatus =
    validation.effective_publication_status ?? validation.publication_status;
  if (!ALLOWED_PUBLICATION_STATUSES.has(validationStatus)) {
    reasons.push("validation_effective_status_not_allowed");
  }
  if (validationStatus !== raw.publication_status) {
    reasons.push("validation_effective_status_mismatch");
  }
  return { allowed: reasons.length === 0, reasons, validationFile };
}

export function evaluatePublishedAdvisor(advisor) {
  const violations = [];
  if (advisor.schemaVersion !== REQUIRED_SCHEMA_VERSION) {
    violations.push("schema_version_not_1.0.4");
  }
  if (advisor.releaseEligible !== true) violations.push("release_eligible_not_true");
  if (!ALLOWED_PUBLICATION_STATUSES.has(advisor.publicationStatus)) {
    violations.push("publication_status_not_allowed");
  }
  if (advisor.hasExperienceEvidence !== false) violations.push("experience_not_false");
  if (advisor.experienceCaseCount !== 0) violations.push("experience_count_not_zero");
  if (advisor.evidenceType !== "academic_only") violations.push("evidence_type_not_academic_only");
  if (!safePublicReportPath(advisor.reportPath)) violations.push("invalid_report_path");
  if (LEGACY_REPORT_NAMES.has(path.basename(advisor.reportPath ?? ""))) {
    violations.push("legacy_report_name_blocked");
  }
  return violations;
}

function setDifferences(actual, expected) {
  return {
    unexpected: [...actual].filter((item) => !expected.has(item)).sort(),
    missing: [...expected].filter((item) => !actual.has(item)).sort(),
  };
}

async function scanGeneratedAllowlist({ mode, root }) {
  const dataFile = path.join(root, "data", "advisors.json");
  const reportRoot = path.join(root, "reports");
  const [data, allFiles, reportFiles] = await Promise.all([
    readJson(dataFile),
    walkFiles(root),
    walkFiles(reportRoot),
  ]);
  invariant(Array.isArray(data.advisors), `${dataFile} 缺少 advisors 数组`);
  invariant(data.advisorCount === data.advisors.length, `${dataFile} advisorCount 不一致`);

  const advisorViolations = data.advisors.flatMap((advisor) =>
    evaluatePublishedAdvisor(advisor).map((reason) => `${advisor.id ?? "unknown"}:${reason}`),
  );
  const expectedReports = new Set(data.advisors.map((advisor) => advisor.reportPath));
  invariant(expectedReports.size === data.advisors.length, "公开数据存在重复报告路径");
  const relativeFiles = new Map(
    allFiles.map((file) => [normalizedRelativePath(root, file), file]),
  );
  const blockedPaths = [...relativeFiles.keys()].filter((relativePath) =>
    blockedPathPatterns.some((pattern) => pattern.test(relativePath)),
  );
  const unexpectedPaths = [...relativeFiles.keys()].filter(
    (relativePath) => !isAllowedGeneratedPath(relativePath, expectedReports),
  );
  const markdownReports = reportFiles.filter((file) => file.toLowerCase().endsWith(".md"));
  const actualReports = new Set(
    reportFiles.map((file) => normalizedRelativePath(root, file)),
  );
  const differences = setDifferences(actualReports, expectedReports);

  const experienceRecords = data.advisors.filter(
    (advisor) => advisor.hasExperienceEvidence !== false || advisor.experienceCaseCount !== 0,
  );
  const reviewPendingRecords = data.advisors.filter(
    (advisor) => advisor.publicationStatus === "review_pending" || advisor.status === "review_pending",
  );
  const releaseIneligibleRecords = data.advisors.filter((advisor) => advisor.releaseEligible === false);
  const missingUnknownPublished = data.advisors.filter(
    (advisor) => !ALLOWED_PUBLICATION_STATUSES.has(advisor.publicationStatus),
  );

  const approvedSensitiveNames = new Set(
    data.advisors
      .filter(
        (advisor) =>
          SENSITIVE_ADVISOR_IDS_BY_NAME[advisor.nameZh] === advisor.id,
      )
      .map((advisor) => advisor.nameZh),
  );

  const experienceFiles = [];
  const legacyReferenceFiles = [];
  const localPathFiles = [];
  const secretFiles = [];
  let sensitiveNameHits = 0;
  for (const [relativePath, file] of relativeFiles) {
    if (!isAllowedGeneratedPath(relativePath, expectedReports)) continue;
    const text = await readFile(file, "utf8");
    const extension = path.extname(relativePath).toLowerCase();
    if ([".html", ".json", ".md", ".txt"].includes(extension)) {
      const patterns = relativePath.startsWith("reports/")
        ? experienceContentPatterns
        : nonReportExperienceContentPatterns;
      if (findPatternViolations(text, patterns).length) experienceFiles.push(relativePath);
    }
    sensitiveNameHits += countSensitiveNameHits(text, approvedSensitiveNames);
    if ([...LEGACY_REPORT_NAMES].some((name) => text.includes(name))) {
      legacyReferenceFiles.push(relativePath);
    }
    if (findPatternViolations(text, localAbsolutePathPatterns).length) localPathFiles.push(relativePath);
    if (findPatternViolations(text, secretPatterns).length) secretFiles.push(relativePath);
  }

  const failures = [];
  if (advisorViolations.length) failures.push(`公开导师门禁违规：${advisorViolations.join(", ")}`);
  if (blockedPaths.length) failures.push(`可部署目录含禁止路径：${blockedPaths.join(", ")}`);
  if (unexpectedPaths.length) failures.push(`可部署目录含白名单外路径：${unexpectedPaths.join(", ")}`);
  if (differences.unexpected.length) {
    failures.push(`报告目录存在白名单外文件：${differences.unexpected.join(", ")}`);
  }
  if (differences.missing.length) {
    failures.push(`公开记录缺少报告：${differences.missing.join(", ")}`);
  }
  if (experienceFiles.length) failures.push(`可部署内容含 Experience 标记：${experienceFiles.join(", ")}`);
  if (sensitiveNameHits) failures.push(`可部署内容命中受阻敏感姓名：${sensitiveNameHits}`);
  if (legacyReferenceFiles.length) failures.push(`可部署文件引用已封禁旧报告：${legacyReferenceFiles.join(", ")}`);
  if (localPathFiles.length) failures.push(`可部署内容含本地绝对路径：${localPathFiles.join(", ")}`);
  if (secretFiles.length) failures.push(`可部署内容含 Token 或密钥特征：${secretFiles.join(", ")}`);
  invariant(failures.length === 0, failures.join("; "));

  return {
    mode,
    publicAdvisorRecords: data.advisors.length,
    trackedOrArtifactReports: actualReports.size,
    experienceRecords: experienceRecords.length,
    experienceContentFiles: experienceFiles.length,
    sensitiveNames: sensitiveNameHits,
    reviewPendingRecords: reviewPendingRecords.length,
    releaseEligibleFalse: releaseIneligibleRecords.length,
    missingUnknownStatusPublished: missingUnknownPublished.length,
    legacyFallbackReferences: differences.unexpected.length + legacyReferenceFiles.length,
  };
}

async function scanProductionPrebuild({
  validationRoot,
  legacyReportRoot,
  publicRoot,
  buildPublicAdvisorDto: buildFn,
}) {
  const buildPublicAdvisorDto =
    buildFn ?? (await import("./public-advisor-dto.mjs")).buildPublicAdvisorDto;
  const built = await buildPublicAdvisorDto({ sourceRoot: validationRoot });
  const approvedIds = built.envelope.advisors.map((advisor) => advisor.id).sort();
  invariant(built.envelope.advisorCount === approvedIds.length, "正式 DTO advisorCount 不一致");
  invariant(approvedIds.length > 0, "正式公开门禁结果为空，请检查 data/advisors-v1");
  invariant(
    built.envelope.advisors.every(
      (advisor) =>
        advisor.releaseEligible === true &&
        ALLOWED_PUBLICATION_STATUSES.has(advisor.publicationStatus) &&
        advisor.hasExperienceEvidence === false &&
        advisor.experienceCaseCount === 0,
    ),
    "正式 DTO 混入了不可公开发布或 Experience 字段",
  );

  for (const advisor of built.envelope.advisors) {
    const validation = await readJson(path.join(validationRoot, advisor.id, "validation-report-v1.json"));
    invariant(validation.valid === true, `${advisor.id} validation.valid 必须为 true`);
    invariant(validation.release_eligible === true, `${advisor.id} release_eligible 必须为 true`);
    const status = validation.effective_publication_status ?? validation.publication_status;
    invariant(ALLOWED_PUBLICATION_STATUSES.has(status), `${advisor.id} 发布状态未获批`);
  }

  const formalPath = path.join(publicRoot, "data", "advisors.json");
  const formalRaw = await readFile(formalPath, "utf8").catch(() => null);
  if (formalRaw !== null) {
    const formal = JSON.parse(formalRaw);
    invariant(formal.advisorCount === built.envelope.advisorCount, "frontend/public DTO 与生产包门禁结果不一致，请重新 export:dto");
    const formalIds = formal.advisors.map((advisor) => advisor.id).sort();
    invariant(JSON.stringify(formalIds) === JSON.stringify(approvedIds), "frontend/public DTO ID 集合与生产包不一致");
  }

  for (const report of built.reports) {
    const violations = findExperienceContentViolations(report.content);
    invariant(violations.length === 0, `正式安全报告含 Experience 内容标记：${report.name}`);
  }

  const legacyReports = (await walkFiles(legacyReportRoot))
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .map((file) => path.relative(legacyReportRoot, file).replaceAll("\\", "/"))
    .sort();
  invariant(
    legacyReports.length === 0,
    `legacy web/reports 必须为空（已退役）；发现：${legacyReports.join(", ")}`,
  );
  for (const name of legacyReports) {
    invariant(!LEGACY_REPORT_NAMES.has(path.basename(name)), `封禁旧报告不得回潮：${name}`);
  }

  return {
    mode: "prebuild",
    sourceRecords: built.sourceAdvisorCount,
    sourceAllowedRecords: approvedIds.length,
    sourceRejectedRecords: built.rejections.length,
    publicAdvisorRecords: approvedIds.length,
    trackedOrArtifactReports: built.reports.length,
    experienceRecords: 0,
    experienceContentFiles: 0,
    sensitiveNames: 0,
    reviewPendingRecords: built.rejections.filter((item) =>
      item.reasons.some((reason) => /review_pending|release_eligible_not_true/.test(reason)),
    ).length,
    releaseEligibleFalse: built.rejections.filter((item) =>
      item.reasons.includes("validation_release_eligible_not_true"),
    ).length,
    missingUnknownStatusPublished: 0,
    legacyFallbackReferences: 0,
  };
}

export async function scanPublicContent({
  mode,
  publicRoot = path.join(frontendDir, "public"),
  artifactRoot = path.join(frontendDir, "dist"),
  sourceAdvisorFile = path.join(repoRoot, "web", "advisors.json"),
  sourceReportRoot = path.join(repoRoot, "web", "reports"),
  validationRoot = path.join(repoRoot, "data", "advisors-v1"),
  buildPublicAdvisorDto,
} = {}) {
  invariant(
    ["prebuild", "public", "artifact"].includes(mode),
    "扫描模式必须是 prebuild、public 或 artifact",
  );
  // sourceAdvisorFile is retained for call-site compatibility; prebuild no longer
  // treats legacy web/advisors.json as an authoritative allowlist source.
  void sourceAdvisorFile;
  if (mode === "prebuild") {
    return scanProductionPrebuild({
      validationRoot,
      legacyReportRoot: sourceReportRoot,
      publicRoot,
      buildPublicAdvisorDto,
    });
  }
  return scanGeneratedAllowlist({
    mode,
    root: mode === "artifact" ? artifactRoot : publicRoot,
  });
}

async function main() {
  const mode = process.argv[2];
  const metrics = await scanPublicContent({ mode });
  console.log(JSON.stringify(metrics, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Public content scan failed: ${error.message}`);
    process.exitCode = 1;
  });
}
