import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STAGING_DTO_VERSION = "1.0.4";
export const STAGING_SCOPE = "local_staging_only";
export const STAGING_SOURCE = "local-staging-advisor-contract";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");

export const defaultStagingPaths = Object.freeze({
  sourceRoot: path.join(repoRoot, "data", "advisors-v1"),
  cohortFile: path.join(frontendDir, "config", "local-staging-cohort-01.json"),
  outputFile: path.join(frontendDir, ".local-staging", "public", "data", "advisors.json"),
});

export const STAGING_ADVISOR_KEYS = Object.freeze([
  "dtoVersion",
  "id",
  "nameZh",
  "nameEn",
  "institution",
  "schoolOrDepartment",
  "position",
  "publicRoles",
  "summary",
  "researchDirections",
  "researchDirectionsPlain",
  "researchQuestions",
  "mainTechniques",
  "researchWorkflow",
  "possibleUndergraduateTasks",
  "prerequisiteSkills",
  "learningCost",
  "genericGrowthPath",
  "tags",
  "searchKeywords",
  "publicEvidence",
  "boundaryStatement",
  "lastUpdated",
  "publicationStatus",
  "releaseEligible",
  "schemaVersion",
  "evidenceType",
  "hasExperienceEvidence",
  "experienceCaseCount",
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function object(value, label) {
  invariant(value && typeof value === "object" && !Array.isArray(value), `${label}_INVALID`);
  return value;
}

function text(value, label, { optional = false } = {}) {
  if (optional && (value === null || value === undefined || value === "")) return null;
  invariant(typeof value === "string" && value.trim(), `${label}_INVALID`);
  return value.trim();
}

function strings(value, label, { allowEmpty = true } = {}) {
  invariant(Array.isArray(value), `${label}_INVALID`);
  const items = value.map((item, index) => text(item, `${label}_${index}`));
  invariant(allowEmpty || items.length > 0, `${label}_EMPTY`);
  return [...new Set(items)].sort((left, right) => left.localeCompare(right, "zh-CN"));
}

function evidenceIds(value, label) {
  const ids = strings(value, label, { allowEmpty: false });
  invariant(ids.every((id) => /^E[1-9][0-9]*$/.test(id)), `${label}_FORMAT_INVALID`);
  return ids.sort((left, right) => left.localeCompare(right, "en", { numeric: true }));
}

function sourcedValue(value, label, { optional = false } = {}) {
  return text(object(value, label).value, `${label}_VALUE`, { optional });
}

function traceable(value, label) {
  const item = object(value, label);
  return {
    text: text(item.text, `${label}_TEXT`),
    evidenceIds: evidenceIds(item.evidence_ids, `${label}_EVIDENCE_IDS`),
  };
}

function traceableArray(value, label) {
  invariant(Array.isArray(value), `${label}_INVALID`);
  return value.map((item, index) => traceable(item, `${label}_${index}`));
}

function plainDirections(value) {
  invariant(Array.isArray(value), "PLAIN_DIRECTIONS_INVALID");
  return value.map((item, index) => {
    const direction = object(item, `PLAIN_DIRECTION_${index}`);
    return {
      term: text(direction.term_original, `PLAIN_DIRECTION_${index}_TERM`),
      explanation: text(direction.explanation_zh, `PLAIN_DIRECTION_${index}_EXPLANATION`),
      undergraduateMeaning: text(direction.undergraduate_meaning, `PLAIN_DIRECTION_${index}_MEANING`),
      evidenceIds: evidenceIds(direction.evidence_ids, `PLAIN_DIRECTION_${index}_EVIDENCE_IDS`),
    };
  });
}

function undergraduateTasks(value) {
  invariant(Array.isArray(value), "UNDERGRADUATE_TASKS_INVALID");
  return value.map((item, index) => {
    const task = object(item, `UNDERGRADUATE_TASK_${index}`);
    return {
      task: text(task.task, `UNDERGRADUATE_TASK_${index}_TASK`),
      context: text(task.task_context, `UNDERGRADUATE_TASK_${index}_CONTEXT`),
      purpose: text(task.task_purpose, `UNDERGRADUATE_TASK_${index}_PURPOSE`),
      methods: strings(task.possible_methods, `UNDERGRADUATE_TASK_${index}_METHODS`),
      output: text(task.possible_output, `UNDERGRADUATE_TASK_${index}_OUTPUT`),
      uncertaintyNote: text(task.uncertainty_note, `UNDERGRADUATE_TASK_${index}_UNCERTAINTY`),
      evidenceIds: evidenceIds(task.evidence_ids, `UNDERGRADUATE_TASK_${index}_EVIDENCE_IDS`),
    };
  });
}

function growthPath(value) {
  invariant(Array.isArray(value), "GROWTH_PATH_INVALID");
  return value.map((item, index) => {
    const stage = object(item, `GROWTH_STAGE_${index}`);
    return {
      stage: text(stage.stage, `GROWTH_STAGE_${index}_STAGE`),
      possibleActivities: strings(stage.possible_activities, `GROWTH_STAGE_${index}_ACTIVITIES`),
      possibleOutputs: strings(stage.possible_outputs, `GROWTH_STAGE_${index}_OUTPUTS`),
      uncertaintyNote: text(stage.uncertainty_note, `GROWTH_STAGE_${index}_UNCERTAINTY`),
      evidenceIds: evidenceIds(stage.evidence_ids, `GROWTH_STAGE_${index}_EVIDENCE_IDS`),
    };
  });
}

function lastUpdated(record) {
  const dates = [];
  const visit = (value) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      if (typeof value.last_verified_at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.last_verified_at)) {
        dates.push(value.last_verified_at);
      }
      Object.values(value).forEach(visit);
    }
  };
  visit(record);
  if (typeof record.record_created_at === "string") dates.push(record.record_created_at);
  invariant(dates.length > 0, "LAST_UPDATED_MISSING");
  return dates.sort().at(-1);
}

function publicEvidence(record, manifest) {
  const adoptedIds = new Set(evidenceIds(record.adopted_public_evidence_ids, "ADOPTED_EVIDENCE_IDS"));
  invariant(Array.isArray(manifest.candidate_evidence), "MANIFEST_EVIDENCE_INVALID");
  const evidenceById = new Map(manifest.candidate_evidence.map((item) => [item.evidence_id, item]));
  return [...adoptedIds]
    .sort((left, right) => left.localeCompare(right, "en", { numeric: true }))
    .map((id) => {
      const item = object(evidenceById.get(id), `EVIDENCE_${id}`);
      invariant(Array.isArray(item.candidate_statuses) && item.candidate_statuses.length === 1 && item.candidate_statuses[0] === "adopted", `EVIDENCE_${id}_NOT_ADOPTED`);
      const sourceUrl = text(item.source_url, `EVIDENCE_${id}_SOURCE_URL`);
      invariant(/^https:\/\//i.test(sourceUrl), `EVIDENCE_${id}_SOURCE_URL_INVALID`);
      const title = text(item.evidence_type === "official_profile" ? item.page_title : item.title, `EVIDENCE_${id}_TITLE`);
      const year = Number.isInteger(item.publication_year) ? item.publication_year : undefined;
      const doi = text(item.doi, `EVIDENCE_${id}_DOI`, { optional: true });
      if (doi) invariant(/^10\.[0-9]{4,9}\/\S+$/.test(doi), `EVIDENCE_${id}_DOI_INVALID`);
      return { evidenceId: id, title, ...(year ? { year } : {}), ...(doi ? { doi } : {}), sourceUrl };
    });
}

function assertTraceability(advisor) {
  const publicIds = new Set(advisor.publicEvidence.map((item) => item.evidenceId));
  const traceableItems = [
    advisor.summary,
    ...advisor.researchDirections,
    ...advisor.researchDirectionsPlain,
    ...advisor.researchQuestions,
    ...advisor.mainTechniques,
    ...advisor.researchWorkflow,
    ...advisor.possibleUndergraduateTasks,
    ...advisor.prerequisiteSkills,
    advisor.learningCost,
    ...advisor.genericGrowthPath,
  ];
  for (const item of traceableItems) {
    invariant(item.evidenceIds.every((id) => publicIds.has(id)), "STAGING_EVIDENCE_LINK_INVALID");
  }
}

function mapStagingAdvisor(record, manifest, validation, expectedId) {
  invariant(record.schema_version === STAGING_DTO_VERSION, `${expectedId}_RECORD_SCHEMA_INVALID`);
  invariant(manifest.schema_version === STAGING_DTO_VERSION, `${expectedId}_MANIFEST_SCHEMA_INVALID`);
  invariant(validation.schema_version === STAGING_DTO_VERSION, `${expectedId}_VALIDATION_SCHEMA_INVALID`);
  invariant(record.advisor_id === expectedId && manifest.advisor_id === expectedId && validation.advisor_id === expectedId, `${expectedId}_ID_MISMATCH`);
  invariant(validation.valid === true, `${expectedId}_PRODUCTION_VALIDATION_FAILED`);
  invariant(record.publication_status === "review_pending", `${expectedId}_STATUS_NOT_REVIEW_PENDING`);
  invariant(validation.release_eligible === false, `${expectedId}_RELEASE_ELIGIBLE_CHANGED`);
  invariant(validation.effective_publication_status === record.publication_status, `${expectedId}_EFFECTIVE_STATUS_MISMATCH`);

  const advisor = {
    dtoVersion: STAGING_DTO_VERSION,
    id: expectedId,
    nameZh: sourcedValue(record.name_zh, `${expectedId}_NAME_ZH`),
    nameEn: sourcedValue(record.name_en, `${expectedId}_NAME_EN`, { optional: true }),
    institution: sourcedValue(record.institution, `${expectedId}_INSTITUTION`),
    schoolOrDepartment: sourcedValue(record.school_or_department, `${expectedId}_DEPARTMENT`),
    position: sourcedValue(record.position, `${expectedId}_POSITION`, { optional: true }),
    publicRoles: record.public_roles.map((role, index) => sourcedValue(role, `${expectedId}_PUBLIC_ROLE_${index}`, { optional: true })).filter(Boolean),
    summary: traceable(record.summary, `${expectedId}_SUMMARY`),
    researchDirections: traceableArray(record.research_directions_original, `${expectedId}_RESEARCH_DIRECTIONS`),
    researchDirectionsPlain: plainDirections(record.research_directions_plain_language),
    researchQuestions: traceableArray(record.research_questions, `${expectedId}_RESEARCH_QUESTIONS`),
    mainTechniques: traceableArray(record.main_techniques, `${expectedId}_MAIN_TECHNIQUES`),
    researchWorkflow: traceableArray(record.research_workflow, `${expectedId}_RESEARCH_WORKFLOW`),
    possibleUndergraduateTasks: undergraduateTasks(record.possible_undergraduate_tasks),
    prerequisiteSkills: traceableArray(record.prerequisite_skills, `${expectedId}_PREREQUISITE_SKILLS`),
    learningCost: traceable(record.learning_cost, `${expectedId}_LEARNING_COST`),
    genericGrowthPath: growthPath(record.generic_growth_path),
    tags: strings(record.tags, `${expectedId}_TAGS`, { allowEmpty: false }),
    searchKeywords: strings(record.search_keywords, `${expectedId}_SEARCH_KEYWORDS`),
    publicEvidence: publicEvidence(record, manifest),
    boundaryStatement: text(record.boundary_statement, `${expectedId}_BOUNDARY_STATEMENT`),
    lastUpdated: lastUpdated(record),
    publicationStatus: record.publication_status,
    releaseEligible: false,
    schemaVersion: STAGING_DTO_VERSION,
    evidenceType: "academic_only",
    hasExperienceEvidence: false,
    experienceCaseCount: 0,
  };
  invariant(Object.keys(advisor).every((key) => STAGING_ADVISOR_KEYS.includes(key)), `${expectedId}_FIELD_ALLOWLIST_FAILED`);
  assertTraceability(advisor);
  return advisor;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function buildLocalStagingDto(pathOverrides = {}) {
  const paths = { ...defaultStagingPaths, ...pathOverrides };
  const cohort = await readJson(paths.cohortFile);
  invariant(cohort.scope === STAGING_SCOPE, "STAGING_SCOPE_INVALID");
  invariant(cohort.public_release_approved === false, "STAGING_PUBLIC_RELEASE_MUST_BE_FALSE");
  invariant(cohort.date === "2026-08-03", "STAGING_DATE_INVALID");
  invariant(Array.isArray(cohort.advisor_ids) && cohort.advisor_ids.length === 6, "STAGING_COHORT_SIZE_INVALID");
  invariant(new Set(cohort.advisor_ids).size === cohort.advisor_ids.length, "STAGING_COHORT_DUPLICATE_ID");

  const advisors = [];
  for (const advisorId of cohort.advisor_ids) {
    invariant(/^([a-z0-9]+)(-[a-z0-9]+)*$/.test(advisorId), `STAGING_ID_INVALID_${advisorId}`);
    const advisorRoot = path.join(paths.sourceRoot, advisorId);
    const [record, manifest, validation] = await Promise.all([
      readJson(path.join(advisorRoot, "public-advisor-v1.json")),
      readJson(path.join(advisorRoot, "evidence-manifest-v1.json")),
      readJson(path.join(advisorRoot, "validation-report-v1.json")),
    ]);
    advisors.push(mapStagingAdvisor(record, manifest, validation, advisorId));
  }

  return {
    schemaVersion: 1,
    dtoVersion: STAGING_DTO_VERSION,
    source: STAGING_SOURCE,
    scope: STAGING_SCOPE,
    publicReleaseApproved: false,
    cohortDate: cohort.date,
    advisorCount: advisors.length,
    advisors,
  };
}

export async function writeLocalStagingDto(pathOverrides = {}) {
  const paths = { ...defaultStagingPaths, ...pathOverrides };
  const envelope = await buildLocalStagingDto(paths);
  await mkdir(path.dirname(paths.outputFile), { recursive: true });
  await writeFile(paths.outputFile, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
  return envelope;
}

export async function validateLocalStagingDto(pathOverrides = {}) {
  const paths = { ...defaultStagingPaths, ...pathOverrides };
  const expected = await buildLocalStagingDto(paths);
  const actual = await readJson(paths.outputFile);
  invariant(JSON.stringify(actual) === JSON.stringify(expected), "LOCAL_STAGING_DTO_OUT_OF_DATE");
  return expected;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const envelope = checkOnly ? await validateLocalStagingDto() : await writeLocalStagingDto();
  console.log(`Local staging advisor DTO: ${envelope.advisorCount}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
