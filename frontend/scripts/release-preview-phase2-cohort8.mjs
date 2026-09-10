import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LATEST_REVIEW_ROOT,
  buildLatestReviewSite,
  verifyLatestReviewSite,
} from "./local-review-phase2-latest-site.mjs";
import { PHASE2_ADVISOR_IDS } from "./local-review-phase2-advisor-dto.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");

export const RELEASE_PREVIEW_ROOT = path.join(frontendDir, ".release-preview-phase2-cohort8");
export const EXISTING_PUBLIC_IDS = Object.freeze([
  "chen-miao", "hu-dehua", "hu-zhengmao", "li-faxiang", "li-jiada", "li-xing",
  "liu-jing", "su-haomiao", "tan-jieqiong", "wang-shixiang", "xiang-rong", "zhao-yuetao",
]);
export const EXPECTED_TOTALS = Object.freeze({ candidates: 90, adopted: 54, verifiedCandidate: 24, excluded: 6, unresolved: 6, featured: 39 });
const PACK_FILES = Object.freeze(["public-advisor-v1.json", "evidence-manifest-v1.json", "validation-report-v1.json"]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function exactSet(actual, expected, message) {
  const left = [...actual].sort((a, b) => a.localeCompare(b, "en"));
  const right = [...expected].sort((a, b) => a.localeCompare(b, "en"));
  invariant(JSON.stringify(left) === JSON.stringify(right), `${message}:${left.join("|")}`);
}

function parseDirectoryData(source) {
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  invariant(start >= 0 && end > start, "DIRECTORY_DATA_INVALID");
  return JSON.parse(source.slice(start, end + 1));
}

function serializeDirectoryData(data) {
  return `window.DIRECTORY_DATA = ${JSON.stringify(data, null, 1)};\n`;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function cohortTotals(items) {
  const totals = { candidates: 0, adopted: 0, verifiedCandidate: 0, excluded: 0, unresolved: 0, featured: 0 };
  for (const item of items) {
    const c = item.validation;
    totals.candidates += c.publication_candidate_evidence_count;
    totals.adopted += c.adopted_publication_evidence_count;
    totals.featured += c.featured_publication_count;
    for (const evidence of item.manifest.candidate_evidence || []) {
      if (evidence.evidence_type !== "publication") continue;
      if ((evidence.candidate_statuses || []).includes("excluded")) totals.excluded += 1;
      else if (!evidence.identity_verified) totals.unresolved += 1;
      else if (!(evidence.candidate_statuses || []).includes("adopted")) totals.verifiedCandidate += 1;
    }
  }
  return totals;
}

async function loadFrozenCohort() {
  const result = [];
  for (const id of PHASE2_ADVISOR_IDS) {
    const root = path.join(repoRoot, "data", "advisors-v1", id);
    result.push({
      id,
      pack: await readJson(path.join(root, "public-advisor-v1.json")),
      manifest: await readJson(path.join(root, "evidence-manifest-v1.json")),
      validation: await readJson(path.join(root, "validation-report-v1.json")),
    });
  }
  invariant(JSON.stringify(cohortTotals(result)) === JSON.stringify(EXPECTED_TOTALS), "FROZEN_COHORT_TOTALS_MISMATCH");
  return result;
}

function releaseCandidateDirectory(baseData, reviewData) {
  const existing = new Map((baseData.mentors || []).map((mentor) => [mentor.id, mentor]));
  for (const mentor of reviewData.mentors || []) {
    invariant(!existing.has(mentor.id), `DIRECTORY_ALREADY_CONTAINS_COHORT_ID:${mentor.id}`);
    existing.set(mentor.id, { ...mentor, eligible: true, pubStatus: "release_candidate_preview", releaseCandidate: true });
  }
  const mentors = [...existing.values()];
  const counts = new Map();
  for (const mentor of mentors) counts.set(mentor.deptShort, (counts.get(mentor.deptShort) || 0) + 1);
  return {
    ...baseData,
    generatedFrom: "current production directory + frozen Phase 2 cohort 8 release-candidate projection",
    generatedAt: "2026-09-10",
    reviewCount: mentors.length,
    publicCount: EXISTING_PUBLIC_IDS.length + PHASE2_ADVISOR_IDS.length,
    reviewOnlyCount: mentors.length - EXISTING_PUBLIC_IDS.length - PHASE2_ADVISOR_IDS.length,
    departments: [...counts].map(([id, count]) => ({ id, label: id, count })),
    mentors,
  };
}

function patchReleasePreviewText(source) {
  return source
    .replaceAll("LOCAL REVIEW ONLY", "RELEASE CANDIDATE PREVIEW")
    .replaceAll("本地论文审核", "本地发布候选预览")
    .replaceAll("本地审核状态", "发布候选预览状态")
    .replaceAll("本地审核 8", "发布候选 8")
    .replaceAll("公开 0", "当前公开 12")
    .replaceAll("Phase 2 · v1.0.6 · 8 位导师 · 未公开发布", "Phase 2 · 8 位新增导师 · 仅供最终发布授权前核对")
    .replaceAll("仅允许通过 v1.0.6 Phase 2 门禁的 8 位 review_pending 导师。", "该档案既不属于当前 12 位公开导师，也不属于本次 8 位发布候选。")
    .replace(
      "if (!m || m.release.eligible !== false || m.release.publicationStatus !== 'review_pending' || !['verified','partially_verified','pending_verification'].includes(m.release.identityStatus)) {",
      "if (!m || !(m.release.eligible === true || (m.release.eligible === false && m.release.publicationStatus === 'review_pending' && ['verified','partially_verified','pending_verification'].includes(m.release.identityStatus)))) {",
    );
}

async function copyExistingPacks(outputRoot) {
  const source = path.join(repoRoot, "site-src", "academic", "profile", "data", "packs");
  const target = path.join(outputRoot, "academic", "profile", "data", "packs");
  for (const id of EXISTING_PUBLIC_IDS) {
    const src = path.join(source, id);
    const dst = path.join(target, id);
    await mkdir(dst, { recursive: true });
    for (const file of PACK_FILES) await cp(path.join(src, file), path.join(dst, file));
  }
}

export async function buildReleasePreview(outputRoot = RELEASE_PREVIEW_ROOT) {
  invariant(path.resolve(outputRoot) === path.resolve(RELEASE_PREVIEW_ROOT), "UNSAFE_RELEASE_PREVIEW_OUTPUT_ROOT");
  await buildLatestReviewSite();
  await verifyLatestReviewSite();
  const cohort = await loadFrozenCohort();
  await rm(outputRoot, { recursive: true, force: true });
  await cp(LATEST_REVIEW_ROOT, outputRoot, { recursive: true });

  const baseDirectoryPath = path.join(repoRoot, "site-src", "academic", "directory", "assets", "data.js");
  const reviewDirectoryPath = path.join(outputRoot, "academic", "assets", "data.js");
  const directory = releaseCandidateDirectory(
    parseDirectoryData(await readFile(baseDirectoryPath, "utf8")),
    parseDirectoryData(await readFile(reviewDirectoryPath, "utf8")),
  );
  await writeFile(reviewDirectoryPath, serializeDirectoryData(directory));

  const baseDto = await readJson(path.join(repoRoot, "site-src", "academic", "profile", "data", "public-dto.json"));
  const reviewDtoPath = path.join(outputRoot, "academic", "profile", "data", "public-dto.json");
  const reviewDto = await readJson(reviewDtoPath);
  exactSet((baseDto.advisors || []).map((item) => item.id), EXISTING_PUBLIC_IDS, "CURRENT_PUBLIC_DTO_SET_MISMATCH");
  for (const item of reviewDto.advisors || []) item.releaseCandidate = true;
  const dto = {
    schemaVersion: baseDto.schemaVersion,
    dtoVersion: "phase2-cohort8-release-candidate-preview-v1",
    source: "current public DTO + exact frozen cohort projection",
    scope: "isolated_release_candidate_preview_only",
    advisorCount: EXISTING_PUBLIC_IDS.length + PHASE2_ADVISOR_IDS.length,
    advisors: [...baseDto.advisors, ...reviewDto.advisors],
  };
  await writeFile(reviewDtoPath, `${JSON.stringify(dto, null, 2)}\n`);
  await copyExistingPacks(outputRoot);

  for (const relative of [
    ["academic", "index.html"],
    ["academic", "profile", "app.js"],
    ["academic", "profile", "template.js"],
  ]) {
    const file = path.join(outputRoot, ...relative);
    await writeFile(file, patchReleasePreviewText(await readFile(file, "utf8")));
  }

  const manifest = {
    status: "LOCAL_RELEASE_CANDIDATE_PREVIEW",
    canonical_data_mutated: false,
    public_release_authorized: false,
    original_head: "fed26decc26a709379b0f087be8d68c1b50f2642",
    current_public_advisor_ids: [...EXISTING_PUBLIC_IDS],
    proposed_added_advisor_ids: [...PHASE2_ADVISOR_IDS],
    projected_public_count: 20,
    cohort_totals: EXPECTED_TOTALS,
    canonical_package_state: { publication_status: "review_pending", release_eligible: false },
    note: "The isolated adapter exposes the exact frozen packages for authorization review; production release gates are unchanged.",
  };
  await writeFile(path.join(outputRoot, "release-preview-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(outputRoot, "index.html"), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=academic/"><title>Phase 2 release candidate preview</title>\n');
  return manifest;
}

export async function verifyReleasePreview(outputRoot = RELEASE_PREVIEW_ROOT) {
  invariant(path.resolve(outputRoot) === path.resolve(RELEASE_PREVIEW_ROOT), "UNSAFE_RELEASE_PREVIEW_VERIFY_ROOT");
  const cohort = await loadFrozenCohort();
  const manifest = await readJson(path.join(outputRoot, "release-preview-manifest.json"));
  invariant(manifest.status === "LOCAL_RELEASE_CANDIDATE_PREVIEW", "RELEASE_PREVIEW_STATUS_INVALID");
  invariant(manifest.public_release_authorized === false, "RELEASE_PREVIEW_AUTHORIZATION_INVALID");
  invariant(JSON.stringify(manifest.cohort_totals) === JSON.stringify(EXPECTED_TOTALS), "RELEASE_PREVIEW_TOTALS_INVALID");

  const directory = parseDirectoryData(await readFile(path.join(outputRoot, "academic", "assets", "data.js"), "utf8"));
  exactSet(directory.mentors.map((item) => item.id), [...EXISTING_PUBLIC_IDS, "guo-hui", ...PHASE2_ADVISOR_IDS], "RELEASE_PREVIEW_DIRECTORY_SET_MISMATCH");
  invariant(directory.publicCount === 20 && directory.reviewOnlyCount === 1, "RELEASE_PREVIEW_DIRECTORY_COUNTS_INVALID");
  const dto = await readJson(path.join(outputRoot, "academic", "profile", "data", "public-dto.json"));
  exactSet(dto.advisors.map((item) => item.id), [...EXISTING_PUBLIC_IDS, ...PHASE2_ADVISOR_IDS], "RELEASE_PREVIEW_DTO_SET_MISMATCH");
  invariant(dto.advisorCount === 20, "RELEASE_PREVIEW_DTO_COUNT_INVALID");

  const packsRoot = path.join(outputRoot, "academic", "profile", "data", "packs");
  const packIds = (await readdir(packsRoot, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name);
  exactSet(packIds, [...EXISTING_PUBLIC_IDS, ...PHASE2_ADVISOR_IDS], "RELEASE_PREVIEW_PACK_SET_MISMATCH");
  for (const item of cohort) {
    invariant(item.pack.publication_status === "review_pending", `PACKAGE_STATUS_UPGRADED:${item.id}`);
    invariant(item.validation.release_eligible === false, `PACKAGE_RELEASE_UPGRADED:${item.id}`);
    for (const file of PACK_FILES) {
      const source = await readFile(path.join(repoRoot, "data", "advisors-v1", item.id, file));
      const projected = await readFile(path.join(packsRoot, item.id, file));
      invariant(sha256(source) === sha256(projected), `COHORT_PACKAGE_DRIFT:${item.id}:${file}`);
    }
  }
  for (const id of EXISTING_PUBLIC_IDS) {
    for (const file of PACK_FILES) {
      const source = await readFile(path.join(repoRoot, "site-src", "academic", "profile", "data", "packs", id, file));
      const projected = await readFile(path.join(packsRoot, id, file));
      invariant(sha256(source) === sha256(projected), `EXISTING_PUBLIC_PACKAGE_DRIFT:${id}:${file}`);
    }
  }
  const template = await readFile(path.join(outputRoot, "academic", "profile", "template.js"), "utf8");
  invariant(template.includes("RELEASE CANDIDATE PREVIEW"), "RELEASE_PREVIEW_BANNER_MISSING");
  invariant(!template.includes("LOCAL REVIEW ONLY"), "STALE_LOCAL_REVIEW_WORDING");
  invariant(!template.includes("已核验成果 0 篇（已核验）"), "INVALID_ZERO_PUBLICATION_WORDING");

  const riskExpectations = {
    "chen-shuhua": { unresolved: ["E23"], excluded: ["E21", "E22"] },
    "guo-yi": { unresolved: ["E7"], excluded: ["E11"] },
    "jiang-hao": { unresolved: ["E5", "E11"], excluded: ["E8", "E9", "E10"] },
    "li-jinchen": { unresolved: ["E7", "E8"], excluded: [] },
  };
  for (const [id, expected] of Object.entries(riskExpectations)) {
    const item = cohort.find((entry) => entry.id === id);
    const publications = item.manifest.candidate_evidence.filter((e) => e.evidence_type === "publication");
    exactSet(publications.filter((e) => !e.identity_verified && !(e.candidate_statuses || []).includes("excluded")).map((e) => e.evidence_id), expected.unresolved, `RISK_UNRESOLVED_DRIFT:${id}`);
    exactSet(publications.filter((e) => (e.candidate_statuses || []).includes("excluded")).map((e) => e.evidence_id), expected.excluded, `RISK_EXCLUDED_DRIFT:${id}`);
    const adopted = new Set(item.pack.adopted_public_evidence_ids || []);
    const featured = new Set(item.pack.featured_publication_evidence_ids || []);
    for (const evidenceId of [...expected.unresolved, ...expected.excluded]) {
      invariant(!adopted.has(evidenceId), `RISK_ITEM_ADOPTED:${id}:${evidenceId}`);
      invariant(!featured.has(evidenceId), `RISK_ITEM_FEATURED:${id}:${evidenceId}`);
    }
  }
  return manifest;
}

async function main() {
  const check = process.argv.includes("--check");
  const manifest = check ? await verifyReleasePreview() : await buildReleasePreview();
  if (!check) await verifyReleasePreview();
  console.log(JSON.stringify({ ok: true, check, status: manifest.status, output: RELEASE_PREVIEW_ROOT, projectedPublicAdvisors: 20 }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
