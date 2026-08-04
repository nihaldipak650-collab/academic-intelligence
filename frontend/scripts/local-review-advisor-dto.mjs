import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_PUBLICATION_STATUSES,
  SOURCE_SCHEMA_VERSION,
  evaluatePackageGate,
  mapApprovedAdvisor,
  readPackageFile,
} from "./public-advisor-dto.mjs";

export const REVIEW_DTO_VERSION = "1.0.4";
export const REVIEW_SCOPE = "local_review_only";
export const REVIEW_SOURCE = "local-review-advisor-contract";
export const REVIEW_PENDING_NOTE = "待项目负责人人工审核，仅用于本地预览，未经公开批准。";
export const REVIEW_PENDING_IDS = Object.freeze(["guo-hui", "hu-zhengmao"]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");

export const defaultReviewPaths = Object.freeze({
  sourceRoot: path.join(repoRoot, "data", "advisors-v1"),
  cohortFile: path.join(frontendDir, "config", "local-review-cohort-13.json"),
  outputFile: path.join(frontendDir, ".local-review", "public", "data", "advisors.json"),
  reportRoot: path.join(frontendDir, ".local-review", "public", "reports"),
});

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function evaluatePendingGate(directoryId, loaded) {
  const reasons = Object.values(loaded).flatMap((item) => (item.error ? [item.error] : []));
  if (reasons.length) return { allowed: false, reasons };
  const publicAdvisor = loaded.publicAdvisor.value;
  const manifest = loaded.manifest.value;
  const validation = loaded.validation.value;
  for (const [label, value] of [
    ["public_advisor", publicAdvisor],
    ["evidence_manifest", manifest],
    ["validation_report", validation],
  ]) {
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
  if (validation.release_eligible !== false) reasons.push("validation_release_eligible_not_false");
  if (publicAdvisor.publication_status !== "review_pending") reasons.push("public_advisor_status_not_review_pending");
  const validationStatus = validation.effective_publication_status ?? validation.publication_status;
  if (validationStatus !== "review_pending") reasons.push("validation_status_not_review_pending");
  if (validationStatus !== publicAdvisor.publication_status) reasons.push("publication_status_mismatch");
  return { allowed: reasons.length === 0, reasons, publicAdvisor, manifest, validation };
}

function mapPendingAdvisor(publicAdvisor, manifest, validation) {
  const approvedShape = mapApprovedAdvisor(publicAdvisor, manifest, validation);
  return {
    dto: {
      ...approvedShape.dto,
      releaseEligible: false,
      publicationStatus: "review_pending",
      dataStatusNote: REVIEW_PENDING_NOTE,
    },
    report: approvedShape.report,
  };
}

async function loadCohort(cohortFile) {
  const cohort = JSON.parse(await readFile(cohortFile, "utf8"));
  invariant(cohort.scope === REVIEW_SCOPE, "REVIEW_SCOPE_INVALID");
  invariant(cohort.public_release_approved === false, "REVIEW_PUBLIC_RELEASE_MUST_BE_FALSE");
  invariant(typeof cohort.cohort_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(cohort.cohort_date), "REVIEW_COHORT_DATE_INVALID");
  invariant(Array.isArray(cohort.advisor_ids), "REVIEW_COHORT_IDS_INVALID");
  invariant(cohort.advisor_ids.length === 13, "REVIEW_COHORT_SIZE_MUST_BE_13");
  invariant(new Set(cohort.advisor_ids).size === cohort.advisor_ids.length, "REVIEW_COHORT_DUPLICATE_ID");
  const sorted = [...cohort.advisor_ids].sort((a, b) => a.localeCompare(b, "en"));
  invariant(JSON.stringify(sorted) === JSON.stringify(cohort.advisor_ids), "REVIEW_COHORT_IDS_MUST_BE_SORTED");
  for (const advisorId of cohort.advisor_ids) {
    invariant(/^([a-z0-9]+)(-[a-z0-9]+)*$/.test(advisorId), `REVIEW_ID_INVALID_${advisorId}`);
  }
  return cohort;
}

export async function buildLocalReviewDto(pathOverrides = {}) {
  const paths = { ...defaultReviewPaths, ...pathOverrides };
  const cohort = await loadCohort(paths.cohortFile);
  const advisorIds = cohort.advisor_ids;
  const pendingIds = new Set(REVIEW_PENDING_IDS);

  const advisors = [];
  const reports = [];

  for (const advisorId of advisorIds) {
    const directory = path.join(paths.sourceRoot, advisorId);
    const loaded = {
      publicAdvisor: await readPackageFile(directory, "public-advisor-v1.json"),
      manifest: await readPackageFile(directory, "evidence-manifest-v1.json"),
      validation: await readPackageFile(directory, "validation-report-v1.json"),
    };
    const isPending = pendingIds.has(advisorId);
    const gate = isPending ? evaluatePendingGate(advisorId, loaded) : evaluatePackageGate(advisorId, loaded);
    invariant(gate.allowed, `REVIEW_ADVISOR_GATE_FAILED_${advisorId}:${gate.reasons.join(",")}`);
    if (!isPending) {
      invariant(
        ALLOWED_PUBLICATION_STATUSES.has(gate.validation.effective_publication_status ?? gate.validation.publication_status),
        `REVIEW_ADVISOR_STATUS_NOT_ALLOWED_${advisorId}`,
      );
    }
    const mapped = isPending
      ? mapPendingAdvisor(gate.publicAdvisor, gate.manifest, gate.validation)
      : mapApprovedAdvisor(gate.publicAdvisor, gate.manifest, gate.validation);
    advisors.push(mapped.dto);
    reports.push({ name: `${advisorId}.md`, content: mapped.report });
  }

  advisors.sort((a, b) => a.id.localeCompare(b.id, "en"));
  reports.sort((a, b) => a.name.localeCompare(b.name, "en"));

  return {
    envelope: {
      schemaVersion: 1,
      dtoVersion: REVIEW_DTO_VERSION,
      source: REVIEW_SOURCE,
      scope: REVIEW_SCOPE,
      publicReleaseApproved: false,
      cohortDate: cohort.cohort_date,
      advisorCount: advisors.length,
      advisors,
    },
    reports,
    cohort,
  };
}

function serializedEnvelope(result) {
  return `${JSON.stringify(result.envelope, null, 2)}\n`;
}

export async function writeLocalReviewDto(pathOverrides = {}) {
  const paths = { ...defaultReviewPaths, ...pathOverrides };
  const result = await buildLocalReviewDto(paths);
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

export async function validateLocalReviewDto(pathOverrides = {}) {
  const paths = { ...defaultReviewPaths, ...pathOverrides };
  const expected = await buildLocalReviewDto(paths);
  const actual = await readFile(paths.outputFile, "utf8").catch(() => null);
  invariant(actual === serializedEnvelope(expected), "LOCAL_REVIEW_DTO_OUT_OF_DATE，请重新运行 generate:review");
  const actualReports = (await readdir(paths.reportRoot).catch(() => [])).sort();
  const expectedReports = expected.reports.map((item) => item.name).sort();
  invariant(JSON.stringify(actualReports) === JSON.stringify(expectedReports), "LOCAL_REVIEW_REPORT_SET_MISMATCH");
  for (const report of expected.reports) {
    const actualReport = await readFile(path.join(paths.reportRoot, report.name), "utf8");
    invariant(actualReport === report.content, `LOCAL_REVIEW_REPORT_CONTENT_MISMATCH:${report.name}`);
  }
  return expected;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const result = checkOnly ? await validateLocalReviewDto() : await writeLocalReviewDto();
  console.log(`Local review advisor DTO: ${result.envelope.advisorCount}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
