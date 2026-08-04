import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DTO_VERSION = "1.0.4";
export const SOURCE_SCHEMA_VERSION = "1.0.4";
export const ALLOWED_PUBLICATION_STATUSES = new Set(["approved", "published"]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");

export const defaultDtoPaths = Object.freeze({
  sourceRoot: path.join(repoRoot, "data", "advisors-v1"),
  publicRoot: path.join(frontendDir, "public"),
  outputFile: path.join(frontendDir, "public", "data", "advisors.json"),
  reportRoot: path.join(frontendDir, "public", "reports"),
});

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function stableUniqueStrings(value, label, { allowEmpty = true } = {}) {
  invariant(Array.isArray(value), `${label} 必须是数组`);
  const items = value.map((item) => {
    invariant(typeof item === "string" && item.trim(), `${label} 只能包含非空字符串`);
    return item.trim();
  });
  invariant(allowEmpty || items.length > 0, `${label} 不能为空`);
  return [...new Set(items)].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function requiredText(value, label) {
  invariant(typeof value === "string" && value.trim(), `${label} 必须是非空字符串`);
  return value.trim();
}

function optionalText(value, label) {
  invariant(value === null || value === undefined || typeof value === "string", `${label} 类型无效`);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredSourcedValue(field, label) {
  invariant(field && typeof field === "object" && !Array.isArray(field), `${label} 结构无效`);
  return requiredText(field.value, `${label}.value`);
}

function optionalSourcedValue(field, label) {
  invariant(field && typeof field === "object" && !Array.isArray(field), `${label} 结构无效`);
  return optionalText(field.value, `${label}.value`);
}

function mapEvidenceIds(value, label) {
  invariant(Array.isArray(value), `${label} 必须是数组`);
  invariant(value.length > 0, `${label} 不能为空`);
  const evidenceIds = value.map((evidenceId, index) => {
    invariant(
      typeof evidenceId === "string" && /^E[1-9][0-9]*$/.test(evidenceId),
      `${label}[${index}] 不是有效 Evidence ID`,
    );
    return evidenceId;
  });
  invariant(new Set(evidenceIds).size === evidenceIds.length, `${label} 不得包含重复 Evidence ID`);
  return evidenceIds;
}

function mapTextItems(value, label) {
  invariant(Array.isArray(value), `${label} 必须是数组`);
  return value.map((item, index) => {
    invariant(item && typeof item === "object" && !Array.isArray(item), `${label}[${index}] 结构无效`);
    return {
      text: requiredText(item.text, `${label}[${index}].text`),
      evidenceIds: mapEvidenceIds(item.evidence_ids, `${label}[${index}].evidence_ids`),
    };
  });
}

function mapPlainDirections(value) {
  invariant(Array.isArray(value), "research_directions_plain_language 必须是数组");
  return value.map((item, index) => ({
    term: requiredText(item?.term_original, `research_directions_plain_language[${index}].term_original`),
    explanation: requiredText(item?.explanation_zh, `research_directions_plain_language[${index}].explanation_zh`),
    undergraduateMeaning: requiredText(
      item?.undergraduate_meaning,
      `research_directions_plain_language[${index}].undergraduate_meaning`,
    ),
    evidenceIds: mapEvidenceIds(
      item?.evidence_ids,
      `research_directions_plain_language[${index}].evidence_ids`,
    ),
  }));
}

function mapTasks(value) {
  invariant(Array.isArray(value), "possible_undergraduate_tasks 必须是数组");
  return value.map((item, index) => ({
    task: requiredText(item?.task, `possible_undergraduate_tasks[${index}].task`),
    context: requiredText(item?.task_context, `possible_undergraduate_tasks[${index}].task_context`),
    purpose: requiredText(item?.task_purpose, `possible_undergraduate_tasks[${index}].task_purpose`),
    methods: stableUniqueStrings(item?.possible_methods, `possible_undergraduate_tasks[${index}].possible_methods`),
    output: requiredText(item?.possible_output, `possible_undergraduate_tasks[${index}].possible_output`),
    uncertaintyNote: requiredText(
      item?.uncertainty_note,
      `possible_undergraduate_tasks[${index}].uncertainty_note`,
    ),
    evidenceIds: mapEvidenceIds(item?.evidence_ids, `possible_undergraduate_tasks[${index}].evidence_ids`),
  }));
}

function mapGrowthPath(value) {
  invariant(Array.isArray(value), "generic_growth_path 必须是数组");
  return value.map((item, index) => ({
    stage: requiredText(item?.stage, `generic_growth_path[${index}].stage`),
    possibleActivities: stableUniqueStrings(
      item?.possible_activities,
      `generic_growth_path[${index}].possible_activities`,
    ),
    possibleOutputs: stableUniqueStrings(
      item?.possible_outputs,
      `generic_growth_path[${index}].possible_outputs`,
    ),
    uncertaintyNote: requiredText(item?.uncertainty_note, `generic_growth_path[${index}].uncertainty_note`),
    evidenceIds: mapEvidenceIds(item?.evidence_ids, `generic_growth_path[${index}].evidence_ids`),
  }));
}

function collectEvidenceBindings(value, bindings = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectEvidenceBindings(item, bindings));
    return bindings;
  }
  if (!value || typeof value !== "object") return bindings;

  const hasEvidenceIds = Object.prototype.hasOwnProperty.call(value, "evidence_ids");
  if (hasEvidenceIds) {
    invariant(Array.isArray(value.evidence_ids), "evidence_ids 必须是数组");
    const hasSourceUrls = Object.prototype.hasOwnProperty.call(value, "source_urls");
    if (hasSourceUrls) {
      invariant(Array.isArray(value.source_urls), "source_urls 必须是数组");
      invariant(
        value.evidence_ids.length === value.source_urls.length,
        "evidence_ids 与 source_urls 数量不一致",
      );
    }
    for (const [index, evidenceId] of value.evidence_ids.entries()) {
      invariant(typeof evidenceId === "string" && /^E[1-9][0-9]*$/.test(evidenceId), "Public Advisor 含无效 Evidence ID");
      const entry = bindings.get(evidenceId) ?? { boundSourceUrls: [] };
      if (hasSourceUrls) {
        invariant(
          typeof value.source_urls[index] === "string" && value.source_urls[index].trim(),
          `source_urls[${index}] 必须是非空字符串`,
        );
        entry.boundSourceUrls.push(value.source_urls[index]);
      }
      bindings.set(evidenceId, entry);
    }
  }
  if (typeof value.source_ref === "string" && /^E[1-9][0-9]*$/.test(value.source_ref)) {
    const entry = bindings.get(value.source_ref) ?? { boundSourceUrls: [] };
    if (typeof value.source_url === "string") entry.boundSourceUrls.push(value.source_url);
    bindings.set(value.source_ref, entry);
  }
  Object.values(value).forEach((item) => collectEvidenceBindings(item, bindings));
  return bindings;
}

function validateDoiUrl(evidence, label) {
  const doi = optionalText(evidence.doi, `${label}.doi`);
  if (!doi) return null;
  invariant(/^10\.[0-9]{4,9}\/\S+$/.test(doi), `${label}.doi 格式无效`);
  const match = /^https:\/\/doi\.org\/(.+)$/i.exec(evidence.source_url);
  if (match) {
    invariant(decodeURIComponent(match[1]).toLowerCase() === doi.toLowerCase(), `${label} DOI 与 URL 错绑`);
  }
  return doi;
}

function buildPublicEvidence(publicAdvisor, manifest) {
  invariant(Array.isArray(manifest.candidate_evidence), "Manifest candidate_evidence 必须是数组");
  const manifestById = new Map();
  for (const evidence of manifest.candidate_evidence) {
    const evidenceId = requiredText(evidence?.evidence_id, "Manifest evidence_id");
    invariant(!manifestById.has(evidenceId), `Manifest Evidence ID 重复：${evidenceId}`);
    manifestById.set(evidenceId, evidence);
  }

  const adoptedIds = new Set(
    stableUniqueStrings(publicAdvisor.adopted_public_evidence_ids, "adopted_public_evidence_ids", {
      allowEmpty: false,
    }),
  );
  const bindings = collectEvidenceBindings(publicAdvisor);
  const referencedIds = [...bindings.keys()].sort((a, b) => a.localeCompare(b, "en"));
  invariant(referencedIds.length > 0, "Public Advisor 没有实际引用 Evidence");

  for (const evidenceId of referencedIds) {
    invariant(adoptedIds.has(evidenceId), `Public Advisor 引用了未 adopted 的 Evidence：${evidenceId}`);
  }
  for (const evidenceId of adoptedIds) {
    invariant(bindings.has(evidenceId), `adopted Evidence 未被 Public Advisor 实际引用：${evidenceId}`);
  }

  const usedDois = new Set();
  return referencedIds.map((evidenceId) => {
    const evidence = manifestById.get(evidenceId);
    invariant(evidence, `Public Advisor 引用了 Manifest 不存在的 Evidence：${evidenceId}`);
    invariant(
      Array.isArray(evidence.candidate_statuses) &&
        evidence.candidate_statuses.length === 1 &&
        evidence.candidate_statuses[0] === "adopted",
      `Evidence ${evidenceId} 状态不是 adopted`,
    );
    const sourceUrl = requiredText(evidence.source_url, `Evidence ${evidenceId}.source_url`);
    invariant(evidence.source_url === sourceUrl, `Evidence ${evidenceId}.source_url 不得包含首尾空白`);
    invariant(/^https:\/\//i.test(sourceUrl), `Evidence ${evidenceId}.source_url 必须是 HTTPS`);
    for (const boundSourceUrl of bindings.get(evidenceId).boundSourceUrls) {
      invariant(boundSourceUrl === sourceUrl, `Evidence ${evidenceId} 与 Public Advisor URL 错绑`);
    }
    const doi = validateDoiUrl(evidence, `Evidence ${evidenceId}`);
    if (doi) {
      invariant(!usedDois.has(doi.toLowerCase()), `公开 Evidence DOI 重复：${doi}`);
      usedDois.add(doi.toLowerCase());
    }
    const title =
      evidence.evidence_type === "official_profile"
        ? requiredText(evidence.page_title, `Evidence ${evidenceId}.page_title`)
        : requiredText(evidence.title, `Evidence ${evidenceId}.title`);
    const year = evidence.publication_year;
    invariant(year === null || year === undefined || Number.isInteger(year), `Evidence ${evidenceId}.publication_year 类型无效`);

    return {
      evidenceId,
      title,
      ...(Number.isInteger(year) ? { year } : {}),
      ...(doi ? { doi } : {}),
      sourceUrl,
    };
  });
}

function stableLastUpdated(publicAdvisor) {
  const dates = [];
  function visit(value) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      if (typeof value.last_verified_at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.last_verified_at)) {
        dates.push(value.last_verified_at);
      }
      Object.values(value).forEach(visit);
    }
  }
  visit(publicAdvisor);
  if (typeof publicAdvisor.record_created_at === "string") dates.push(publicAdvisor.record_created_at);
  invariant(dates.length > 0, "Public Advisor 缺少稳定记录日期");
  return dates.sort().at(-1);
}

function buildSafeReport(dto) {
  const lines = [
    `# ${dto.nameZh}`,
    "",
    "## 公开研究摘要",
    "",
    dto.summary.text,
    "",
    "## 公开身份",
    "",
    `- 机构：${dto.institution}`,
    `- 院系：${dto.schoolOrDepartment}`,
    `- 职位：${dto.position}`,
    ...dto.publicRoles.map((role) => `- 公开导师身份：${role}`),
    "",
    "## 科学问题",
    "",
    ...dto.researchQuestions.map((item) => `- ${item.text}`),
    "",
    "## 方法与技术路线",
    "",
    ...dto.mainTechniques.map((item) => `- ${item.text}`),
    ...dto.researchWorkflow.map((item) => `- ${item.text}`),
    "",
    "## 本科生可能参与的公开研究场景",
    "",
    ...dto.possibleUndergraduateTasks.map((item) => `- ${item.task}：${item.purpose}；${item.uncertaintyNote}`),
    "",
    "## 准备建议",
    "",
    ...dto.prerequisiteSkills.map((item) => `- ${item.text}`),
    `- ${dto.learningCost.text}`,
    "",
    "## 成长路径",
    "",
    ...dto.genericGrowthPath.map((item) => `- ${item.stage}：${item.possibleActivities.join("、")}`),
    "",
    "## 公开 Evidence",
    "",
    ...dto.publicEvidence.map((item) =>
      `- [${item.evidenceId}] ${item.title}${item.year ? ` (${item.year})` : ""}${item.doi ? `；DOI: ${item.doi}` : ""}；${item.sourceUrl}`,
    ),
    "",
    "## 公开边界",
    "",
    dto.boundaryStatement,
    "",
  ];
  return lines.join("\n");
}

function assertDtoEvidenceTraceability(dto) {
  const publicEvidenceIds = new Set(dto.publicEvidence.map((item) => item.evidenceId));
  const traceableItems = [
    dto.summary,
    ...dto.researchDirections,
    ...dto.researchDirectionsPlain,
    ...dto.researchQuestions,
    ...dto.mainTechniques,
    ...dto.researchWorkflow,
    ...dto.possibleUndergraduateTasks,
    ...dto.prerequisiteSkills,
    dto.learningCost,
    ...dto.genericGrowthPath,
  ];
  for (const [itemIndex, item] of traceableItems.entries()) {
    invariant(Array.isArray(item?.evidenceIds) && item.evidenceIds.length > 0, `DTO 内容 ${itemIndex} 缺少 evidenceIds`);
    for (const evidenceId of item.evidenceIds) {
      invariant(publicEvidenceIds.has(evidenceId), `DTO 内容引用了 publicEvidence 不存在的 Evidence：${evidenceId}`);
    }
  }
}

export function mapApprovedAdvisor(publicAdvisor, manifest, validation) {
  const advisorId = requiredText(publicAdvisor.advisor_id, "advisor_id");
  invariant(/^([a-z0-9]+)(-[a-z0-9]+)*$/.test(advisorId), `advisor_id 无效：${advisorId}`);
  const reportPath = requiredText(publicAdvisor.report_path, `${advisorId}.report_path`);
  invariant(reportPath === `reports/${advisorId}.md`, `${advisorId}.report_path 必须与 advisor_id 精确对应`);

  const publicEvidence = buildPublicEvidence(publicAdvisor, manifest);
  const researchDirections = mapTextItems(publicAdvisor.research_directions_original, "research_directions_original");
  const researchDirectionsPlain = mapPlainDirections(publicAdvisor.research_directions_plain_language);
  const researchQuestions = mapTextItems(publicAdvisor.research_questions, "research_questions");
  const mainTechniques = mapTextItems(publicAdvisor.main_techniques, "main_techniques");
  const researchWorkflow = mapTextItems(publicAdvisor.research_workflow, "research_workflow");
  const possibleUndergraduateTasks = mapTasks(publicAdvisor.possible_undergraduate_tasks);
  const prerequisiteSkills = mapTextItems(publicAdvisor.prerequisite_skills, "prerequisite_skills");
  invariant(publicAdvisor.learning_cost && typeof publicAdvisor.learning_cost === "object", "learning_cost 结构无效");
  const learningCost = {
    text: requiredText(publicAdvisor.learning_cost.text, "learning_cost.text"),
    evidenceIds: mapEvidenceIds(publicAdvisor.learning_cost.evidence_ids, "learning_cost.evidence_ids"),
  };
  const genericGrowthPath = mapGrowthPath(publicAdvisor.generic_growth_path);
  const nameZh = requiredSourcedValue(publicAdvisor.name_zh, "name_zh");
  const nameEn = optionalSourcedValue(publicAdvisor.name_en, "name_en");
  const institution = requiredSourcedValue(publicAdvisor.institution, "institution");
  const schoolOrDepartment = requiredSourcedValue(publicAdvisor.school_or_department, "school_or_department");
  const position = requiredSourcedValue(publicAdvisor.position, "position");
  invariant(Array.isArray(publicAdvisor.public_roles), "public_roles 必须是数组");
  const publicRoles = publicAdvisor.public_roles
    .map((role, index) => optionalSourcedValue(role, `public_roles[${index}]`))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
  const summary = {
    text: requiredText(publicAdvisor.summary?.text, "summary.text"),
    evidenceIds: mapEvidenceIds(publicAdvisor.summary?.evidence_ids, "summary.evidence_ids"),
  };
  const tags = stableUniqueStrings(publicAdvisor.tags, "tags", { allowEmpty: false });
  const searchKeywords = stableUniqueStrings(publicAdvisor.search_keywords, "search_keywords");
  const boundaryStatement = requiredText(publicAdvisor.boundary_statement, "boundary_statement");
  const publicationStatus = validation.effective_publication_status ?? validation.publication_status;
  const lastUpdated = stableLastUpdated(publicAdvisor);

  const baseDto = {
    dtoVersion: DTO_VERSION,
    id: advisorId,
    nameZh,
    ...(nameEn ? { nameEn } : {}),
    institution,
    schoolOrDepartment,
    position,
    publicRoles,
    summary,
    researchDirections,
    researchDirectionsPlain,
    researchQuestions,
    mainTechniques,
    researchWorkflow,
    possibleUndergraduateTasks,
    prerequisiteSkills,
    learningCost,
    genericGrowthPath,
    tags,
    categoryTags: tags,
    searchKeywords,
    publicEvidence,
    boundaryStatement,
    lastUpdated,
    publicationStatus,
    releaseEligible: true,
    schemaVersion: SOURCE_SCHEMA_VERSION,
    version: SOURCE_SCHEMA_VERSION,
    evidenceType: "academic_only",
    hasExperienceEvidence: false,
    experienceCaseCount: 0,
    reportPath,
    initials: nameZh.slice(0, 1),
    quickSummary: {
      coreDirections: researchDirections.slice(0, 5),
      mainTechniques: mainTechniques.slice(0, 4),
      undergraduatePaths: possibleUndergraduateTasks.slice(0, 3).map((item) => ({
        text: item.task,
        evidenceIds: item.evidenceIds,
      })),
    },
  };
  assertDtoEvidenceTraceability(baseDto);
  const report = buildSafeReport(baseDto);
  return { dto: { ...baseDto, reportSha256: sha256(report) }, report };
}

export async function readPackageFile(directory, name) {
  const file = path.join(directory, name);
  try {
    return { value: JSON.parse(await readFile(file, "utf8")) };
  } catch (error) {
    return { error: error?.code === "ENOENT" ? `${name}_missing` : `${name}_parse_failed` };
  }
}

export function evaluatePackageGate(directoryId, loaded) {
  const reasons = Object.values(loaded).flatMap((item) => (item.error ? [item.error] : []));
  if (reasons.length) return { allowed: false, reasons };
  const publicAdvisor = loaded.publicAdvisor.value;
  const manifest = loaded.manifest.value;
  const validation = loaded.validation.value;
  for (const [label, value] of [["public_advisor", publicAdvisor], ["evidence_manifest", manifest], ["validation_report", validation]]) {
    if (!value || typeof value !== "object" || Array.isArray(value)) reasons.push(`${label}_not_object`);
  }
  if (reasons.length) return { allowed: false, reasons };

  if (publicAdvisor.schema_version !== SOURCE_SCHEMA_VERSION) reasons.push("public_advisor_schema_not_1.0.4");
  if (manifest.schema_version !== SOURCE_SCHEMA_VERSION) reasons.push("manifest_schema_not_1.0.4");
  if (validation.schema_version !== SOURCE_SCHEMA_VERSION) reasons.push("validation_schema_not_1.0.4");
  if (publicAdvisor.advisor_id !== directoryId) reasons.push("public_advisor_id_mismatch");
  if (manifest.advisor_id !== directoryId) reasons.push("manifest_advisor_id_mismatch");
  if (validation.advisor_id !== directoryId) reasons.push("validation_advisor_id_mismatch");
  if (validation.valid !== true) reasons.push("validation_not_valid");
  if (validation.release_eligible !== true) reasons.push("validation_release_eligible_not_true");
  if (!ALLOWED_PUBLICATION_STATUSES.has(publicAdvisor.publication_status)) reasons.push("public_advisor_status_not_allowed");
  const validationStatus = validation.effective_publication_status ?? validation.publication_status;
  if (!ALLOWED_PUBLICATION_STATUSES.has(validationStatus)) reasons.push("validation_status_not_allowed");
  if (validationStatus !== publicAdvisor.publication_status) reasons.push("publication_status_mismatch");
  return { allowed: reasons.length === 0, reasons, publicAdvisor, manifest, validation };
}

export async function buildPublicAdvisorDto({ sourceRoot = defaultDtoPaths.sourceRoot } = {}) {
  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const advisorIds = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const advisors = [];
  const reports = [];
  const rejections = [];

  for (const directoryId of advisorIds) {
    const directory = path.join(sourceRoot, directoryId);
    const [publicAdvisor, manifest, validation] = await Promise.all([
      readPackageFile(directory, "public-advisor-v1.json"),
      readPackageFile(directory, "evidence-manifest-v1.json"),
      readPackageFile(directory, "validation-report-v1.json"),
    ]);
    const gate = evaluatePackageGate(directoryId, { publicAdvisor, manifest, validation });
    if (!gate.allowed) {
      rejections.push({ advisorId: directoryId, reasons: gate.reasons });
      continue;
    }
    const mapped = mapApprovedAdvisor(gate.publicAdvisor, gate.manifest, gate.validation);
    advisors.push(mapped.dto);
    reports.push({ name: path.basename(mapped.dto.reportPath), content: mapped.report });
  }

  advisors.sort((a, b) => a.id.localeCompare(b.id, "en"));
  reports.sort((a, b) => a.name.localeCompare(b.name, "en"));
  return {
    envelope: {
      schemaVersion: 1,
      dtoVersion: DTO_VERSION,
      source: "approved-public-advisor-contract",
      advisorCount: advisors.length,
      advisors,
    },
    reports,
    sourceAdvisorCount: advisorIds.length,
    rejections,
  };
}

function serializedEnvelope(result) {
  return `${JSON.stringify(result.envelope, null, 2)}\n`;
}

export async function writePublicAdvisorDto(pathOverrides = {}) {
  const paths = { ...defaultDtoPaths, ...pathOverrides };
  const result = await buildPublicAdvisorDto(paths);
  await mkdir(path.dirname(paths.outputFile), { recursive: true });
  await mkdir(paths.reportRoot, { recursive: true });
  const expectedReports = new Set(result.reports.map((item) => item.name));
  const existingReports = await readdir(paths.reportRoot).catch(() => []);
  for (const name of existingReports) {
    if (!expectedReports.has(name)) await rm(path.join(paths.reportRoot, name), { recursive: true, force: true });
  }
  for (const report of result.reports) {
    await writeFile(path.join(paths.reportRoot, report.name), report.content, "utf8");
  }
  await writeFile(paths.outputFile, serializedEnvelope(result), "utf8");
  return result;
}

export async function validatePublicAdvisorDto(pathOverrides = {}) {
  const paths = { ...defaultDtoPaths, ...pathOverrides };
  const expected = await buildPublicAdvisorDto(paths);
  const actual = await readFile(paths.outputFile, "utf8").catch(() => null);
  invariant(actual === serializedEnvelope(expected), "公开 DTO 与当前生产输入不一致，请重新运行 export:dto");
  const actualReports = (await readdir(paths.reportRoot).catch(() => [])).sort();
  const expectedReports = expected.reports.map((item) => item.name).sort();
  invariant(JSON.stringify(actualReports) === JSON.stringify(expectedReports), "公开 DTO 报告集合不一致");
  for (const report of expected.reports) {
    const actualReport = await readFile(path.join(paths.reportRoot, report.name), "utf8");
    invariant(actualReport === report.content, `公开 DTO 报告内容不一致：${report.name}`);
  }
  return expected;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const result = checkOnly ? await validatePublicAdvisorDto() : await writePublicAdvisorDto();
  console.log(`DTO source advisors: ${result.sourceAdvisorCount}`);
  console.log(`DTO exported advisors: ${result.envelope.advisorCount}`);
  console.log(`DTO rejected advisors: ${result.rejections.length}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Public advisor DTO failed: ${error.message}`);
    process.exitCode = 1;
  });
}
