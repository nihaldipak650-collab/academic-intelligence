import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mapApprovedAdvisor, readPackageFile } from "./public-advisor-dto.mjs";

export const PHASE2_SCHEMA_VERSION = "1.0.6";
export const PHASE2_DTO_VERSION = "1.0.6-review";
export const PHASE2_SCOPE = "local_review_only";
export const PHASE2_SOURCE = "phase2-cohort-8-v106-local-review";
export const PHASE2_ADVISOR_IDS = Object.freeze([
  "chen-shuhua",
  "deng-meichun",
  "deng-suixin",
  "duan-ranhui",
  "fan-liangliang",
  "guo-yi",
  "jiang-hao",
  "li-jinchen",
]);
export const PUBLICATION_NOTICE = "## 7. 代表性论文";
export const SEARCH_NOT_RUN_NOTICE = "Owner publication decision 2026-09-10 applied locally";
export const FORBIDDEN_PUBLICATION_WORDING = [
  "论文已核验",
  "publication verified",
  "候选论文证据完整",
  "代表论文已确认",
];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");

export const defaultPhase2ReviewPaths = Object.freeze({
  sourceRoot: path.join(repoRoot, "data", "advisors-v1"),
  cohortFile: path.join(frontendDir, "config", "local-review-phase2-cohort-8-v106.json"),
  outputFile: path.join(frontendDir, ".local-review-phase2-8", "public", "data", "advisors.json"),
  reportRoot: path.join(frontendDir, ".local-review-phase2-8", "public", "reports"),
});

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function readTextPackageFile(directory, name) {
  try {
    return { value: await readFile(path.join(directory, name), "utf8") };
  } catch (error) {
    return { error: error?.code === "ENOENT" ? `${name}_missing` : `${name}_read_failed` };
  }
}

export async function loadPhase2Package(directory, advisorId) {
  return {
    publicAdvisor: await readPackageFile(directory, "public-advisor-v1.json"),
    manifest: await readPackageFile(directory, "evidence-manifest-v1.json"),
    identity: await readPackageFile(directory, "identity-review-v1.json"),
    validation: await readPackageFile(directory, "validation-report-v1.json"),
    markdown: await readTextPackageFile(directory, "public-advisor-v1.md"),
    advisorId,
  };
}

function countPublicationEvidence(manifest) {
  return Array.isArray(manifest?.candidate_evidence)
    ? manifest.candidate_evidence.filter((item) => item?.evidence_type === "publication").length
    : null;
}

export function evaluatePhase2PackageGate(directoryId, loaded) {
  const reasons = Object.values(loaded).flatMap((item) => item?.error ? [item.error] : []);
  if (reasons.length) return { allowed: false, reasons };

  const publicAdvisor = loaded.publicAdvisor?.value;
  const manifest = loaded.manifest?.value;
  const identity = loaded.identity?.value;
  const validation = loaded.validation?.value;
  const markdown = loaded.markdown?.value;
  for (const [label, value] of [
    ["public_advisor", publicAdvisor],
    ["evidence_manifest", manifest],
    ["identity_review", identity],
    ["validation_report", validation],
  ]) {
    if (!value || typeof value !== "object" || Array.isArray(value)) reasons.push(`${label}_not_object`);
  }
  if (typeof markdown !== "string" || !markdown.trim()) reasons.push("public-advisor-v1.md_invalid");
  if (reasons.length) return { allowed: false, reasons };

  for (const [label, value] of [
    ["public_advisor", publicAdvisor],
    ["manifest", manifest],
    ["identity", identity],
    ["validation", validation],
  ]) {
    if (value.schema_version !== PHASE2_SCHEMA_VERSION) reasons.push(`${label}_schema_not_1.0.6`);
    if (value.advisor_id !== directoryId) reasons.push(`${label}_advisor_id_mismatch`);
  }

  if (validation.valid !== true) reasons.push("validation_not_valid");
  if (validation.release_eligible !== false) reasons.push("validation_release_eligible_not_false");
  if (publicAdvisor.publication_status !== "review_pending") reasons.push("public_advisor_status_not_review_pending");
  if (validation.requested_publication_status !== "review_pending") reasons.push("validation_requested_status_not_review_pending");
  if (validation.effective_publication_status !== "review_pending") reasons.push("validation_effective_status_not_review_pending");
  if (publicAdvisor.publication_identity_status === "verified" && validation.adopted_publication_evidence_count === 0) {
    reasons.push("verified_with_zero_adopted_publications");
  }
  if (!["verified", "partially_verified", "pending_verification"].includes(publicAdvisor.publication_identity_status)) reasons.push("publication_identity_status_invalid");
  if (!Number.isInteger(validation.publication_candidate_evidence_count) || validation.publication_candidate_evidence_count <= 0) reasons.push("publication_candidate_count_not_positive");
  if (!Number.isInteger(validation.adopted_publication_evidence_count) || validation.adopted_publication_evidence_count <= 0) reasons.push("adopted_publication_count_not_positive");
  if (!Number.isInteger(validation.featured_publication_count) || validation.featured_publication_count <= 0) reasons.push("featured_publication_count_not_positive");
  if (validation.featured_publication_count !== publicAdvisor.featured_publication_evidence_ids?.length) reasons.push("featured_publication_count_mismatch");
  if (publicAdvisor.featured_selection_status !== "manually_reviewed") reasons.push("featured_selection_not_manually_reviewed");
  if (publicAdvisor.featured_selection_review?.status !== "approved" || publicAdvisor.featured_selection_review?.reviewer_role !== "user") reasons.push("featured_owner_review_missing");
  if (countPublicationEvidence(manifest) !== validation.publication_candidate_evidence_count) reasons.push("manifest_publication_candidate_count_mismatch");
  if (!Array.isArray(identity.publication_identity) || identity.publication_identity.length !== validation.publication_candidate_evidence_count) {
    reasons.push("identity_publication_record_count_mismatch");
  }
  if (publicAdvisor.report_path !== `reports/${directoryId}.md`) reasons.push("report_path_mismatch");
  if (typeof publicAdvisor.data_status_note !== "string" || !publicAdvisor.data_status_note.includes(SEARCH_NOT_RUN_NOTICE)) {
    reasons.push("owner_decision_notice_missing_from_data_status");
  }
  if (!markdown.includes(PUBLICATION_NOTICE)) reasons.push("publication_notice_missing_from_markdown");
  const forbidden = FORBIDDEN_PUBLICATION_WORDING.filter((wording) => markdown.toLowerCase().includes(wording.toLowerCase()));
  if (forbidden.length) reasons.push(`forbidden_publication_wording:${forbidden.join("|")}`);

  return {
    allowed: reasons.length === 0,
    reasons,
    publicAdvisor,
    manifest,
    identity,
    validation,
    markdown,
  };
}

function officialHomepage(publicAdvisor) {
  const value = publicAdvisor?.contact?.official_profile_url?.value;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapPhase2Advisor(gate) {
  const mapped = mapApprovedAdvisor(gate.publicAdvisor, gate.manifest, gate.validation);
  const dto = mapped.dto;
  return {
    dto: {
      ...dto,
      dtoVersion: PHASE2_DTO_VERSION,
      schemaVersion: PHASE2_SCHEMA_VERSION,
      version: PHASE2_SCHEMA_VERSION,
      releaseEligible: false,
      publicationStatus: "review_pending",
      status: "review_pending",
      publicationIdentityStatus: gate.publicAdvisor.publication_identity_status,
      orcidReviewStatus: gate.identity.advisor_identity?.orcid_status || "unresolved",
      orcidReviewBasis: Array.isArray(gate.identity.advisor_identity?.orcid_verification_basis)
        ? gate.identity.advisor_identity.orcid_verification_basis
        : [],
      publicationSearchStatus: "complete",
      publicationCandidateCount: gate.validation.publication_candidate_evidence_count,
      adoptedPublicationCount: gate.validation.adopted_publication_evidence_count,
      ownerFeaturedPublicationIds: gate.publicAdvisor.featured_publication_evidence_ids,
      ownerFeaturedPublicationCount: gate.validation.featured_publication_count,
      dataStatusNote: gate.publicAdvisor.data_status_note,
      summary: dto.summary.text,
      authorMatchConfidence: gate.publicAdvisor.publication_identity_status === "verified" ? "High" : "Medium",
      authorConfidenceSource: "author_match_confidence",
      sourceTypeLabel: "v1.0.6 本地论文审核包 · 官方主页 + 学术元数据",
      sourceLabel: "public-advisor-v1.md · deterministic renderer",
      officialHomepage: officialHomepage(gate.publicAdvisor),
      quickSummary: {
        coreDirections: dto.quickSummary.coreDirections.map((item) => item.text),
        mainTechniques: dto.quickSummary.mainTechniques.map((item) => item.text),
        undergraduatePaths: dto.quickSummary.undergraduatePaths.map((item) => item.text),
      },
      reportSha256: sha256(gate.markdown),
    },
    report: gate.markdown,
  };
}

export async function loadPhase2Cohort(cohortFile) {
  const cohort = JSON.parse(await readFile(cohortFile, "utf8"));
  invariant(cohort.scope === PHASE2_SCOPE, "PHASE2_REVIEW_SCOPE_INVALID");
  invariant(cohort.review_id === "phase2-cohort-8-v106", "PHASE2_REVIEW_ID_INVALID");
  invariant(cohort.schema_version === PHASE2_SCHEMA_VERSION, "PHASE2_REVIEW_SCHEMA_INVALID");
  invariant(cohort.public_release_approved === false, "PHASE2_PUBLIC_RELEASE_MUST_BE_FALSE");
  invariant(typeof cohort.cohort_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(cohort.cohort_date), "PHASE2_COHORT_DATE_INVALID");
  invariant(Array.isArray(cohort.advisor_ids), "PHASE2_COHORT_IDS_INVALID");
  invariant(cohort.advisor_ids.length === 8, "PHASE2_COHORT_SIZE_MUST_BE_8");
  invariant(new Set(cohort.advisor_ids).size === cohort.advisor_ids.length, "PHASE2_COHORT_DUPLICATE_ID");
  const sorted = [...cohort.advisor_ids].sort((a, b) => a.localeCompare(b, "en"));
  invariant(JSON.stringify(sorted) === JSON.stringify(cohort.advisor_ids), "PHASE2_COHORT_IDS_MUST_BE_SORTED");
  invariant(JSON.stringify(cohort.advisor_ids) === JSON.stringify(PHASE2_ADVISOR_IDS), "PHASE2_COHORT_EXACT_IDS_REQUIRED");
  return cohort;
}

export function assertNoCrossAdvisorPollution(items) {
  const sourceUrlOwners = new Map();
  const evidenceRecordOwners = new Map();
  for (const current of items) {
    const combined = JSON.stringify({
      publicAdvisor: current.gate.publicAdvisor,
      manifest: current.gate.manifest,
      identity: current.gate.identity,
    }) + current.gate.markdown;
    for (const other of items) {
      if (other.advisorId === current.advisorId) continue;
      const otherName = other.gate.publicAdvisor?.name_zh?.value;
      invariant(!combined.includes(other.advisorId), `CROSS_ADVISOR_ID_POLLUTION:${current.advisorId}:${other.advisorId}`);
      if (typeof otherName === "string" && otherName !== current.gate.publicAdvisor?.name_zh?.value) {
        invariant(!combined.includes(otherName), `CROSS_ADVISOR_NAME_POLLUTION:${current.advisorId}:${otherName}`);
      }
    }
    for (const evidence of current.gate.manifest.candidate_evidence) {
      invariant(typeof evidence?.source_url === "string" && evidence.source_url.trim(), `EVIDENCE_SOURCE_URL_INVALID:${current.advisorId}`);
      const normalizedUrl = evidence.source_url.trim().toLowerCase().replace(/\/$/, "");
      const priorUrlOwner = sourceUrlOwners.get(normalizedUrl);
      invariant(!priorUrlOwner, `CROSS_ADVISOR_EVIDENCE_URL_POLLUTION:${current.advisorId}:${priorUrlOwner}`);
      sourceUrlOwners.set(normalizedUrl, current.advisorId);

      const recordFingerprint = JSON.stringify({
        evidence_type: evidence.evidence_type,
        page_title: evidence.page_title ?? null,
        profile_name: evidence.profile_name ?? null,
        title: evidence.title ?? null,
        doi: evidence.doi ?? null,
        extracted_facts: evidence.extracted_facts ?? null,
      });
      const priorRecordOwner = evidenceRecordOwners.get(recordFingerprint);
      invariant(!priorRecordOwner, `CROSS_ADVISOR_EVIDENCE_RECORD_POLLUTION:${current.advisorId}:${priorRecordOwner}`);
      evidenceRecordOwners.set(recordFingerprint, current.advisorId);
    }
  }
}

export async function buildPhase2LocalReviewDto(pathOverrides = {}) {
  const paths = { ...defaultPhase2ReviewPaths, ...pathOverrides };
  const cohort = await loadPhase2Cohort(paths.cohortFile);
  const loadedItems = [];
  for (const advisorId of cohort.advisor_ids) {
    const directory = path.join(paths.sourceRoot, advisorId);
    const loaded = await loadPhase2Package(directory, advisorId);
    const gate = evaluatePhase2PackageGate(advisorId, loaded);
    invariant(gate.allowed, `PHASE2_REVIEW_GATE_FAILED_${advisorId}:${gate.reasons.join(",")}`);
    loadedItems.push({ advisorId, gate });
  }
  assertNoCrossAdvisorPollution(loadedItems);

  const advisors = [];
  const reports = [];
  for (const item of loadedItems) {
    const mapped = mapPhase2Advisor(item.gate);
    advisors.push(mapped.dto);
    reports.push({ name: `${item.advisorId}.md`, content: mapped.report });
  }
  advisors.sort((a, b) => a.id.localeCompare(b.id, "en"));
  reports.sort((a, b) => a.name.localeCompare(b.name, "en"));
  invariant(advisors.length === 8 && reports.length === 8, "PHASE2_OUTPUT_COUNT_NOT_8");

  return {
    envelope: {
      schemaVersion: 1,
      dtoVersion: PHASE2_DTO_VERSION,
      source: PHASE2_SOURCE,
      scope: PHASE2_SCOPE,
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

export async function writePhase2LocalReviewDto(pathOverrides = {}) {
  const paths = { ...defaultPhase2ReviewPaths, ...pathOverrides };
  const result = await buildPhase2LocalReviewDto(paths);
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

export async function validatePhase2LocalReviewDto(pathOverrides = {}) {
  const paths = { ...defaultPhase2ReviewPaths, ...pathOverrides };
  const expected = await buildPhase2LocalReviewDto(paths);
  const actual = await readFile(paths.outputFile, "utf8").catch(() => null);
  invariant(actual === serializedEnvelope(expected), "PHASE2_REVIEW_DTO_OUT_OF_DATE");
  const actualReports = (await readdir(paths.reportRoot).catch(() => [])).sort();
  const expectedReports = expected.reports.map((item) => item.name).sort();
  invariant(JSON.stringify(actualReports) === JSON.stringify(expectedReports), "PHASE2_REVIEW_REPORT_SET_MISMATCH");
  for (const report of expected.reports) {
    const actualReport = await readFile(path.join(paths.reportRoot, report.name), "utf8");
    invariant(actualReport === report.content, `PHASE2_REVIEW_REPORT_CONTENT_MISMATCH:${report.name}`);
  }
  return expected;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const result = checkOnly ? await validatePhase2LocalReviewDto() : await writePhase2LocalReviewDto();
  console.log(`Phase 2 local review advisor DTO: ${result.envelope.advisorCount}`);
  console.log(`Phase 2 local review output: ${defaultPhase2ReviewPaths.outputFile}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
