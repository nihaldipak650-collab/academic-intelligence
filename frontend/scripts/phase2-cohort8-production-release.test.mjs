import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");
const siteRoot = path.join(repoRoot, "site-src");
const BASELINE = "d6e4b0c035493b4007fb70f90b17dbb4acfb0254";
const EXISTING_IDS = [
  "chen-miao", "hu-dehua", "hu-zhengmao", "li-faxiang", "li-jiada", "li-xing",
  "liu-jing", "su-haomiao", "tan-jieqiong", "wang-shixiang", "xiang-rong", "zhao-yuetao",
];
const COHORT_IDS = [
  "chen-shuhua", "deng-meichun", "deng-suixin", "duan-ranhui",
  "fan-liangliang", "guo-yi", "jiang-hao", "li-jinchen",
];
const PACK_FILES = ["public-advisor-v1.json", "evidence-manifest-v1.json", "validation-report-v1.json"];

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function parseDirectory(source) {
  return JSON.parse(source.slice(source.indexOf("{"), source.lastIndexOf("}") + 1));
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b, "en"));
}

describe("Phase 2 Cohort 8 canonical production release", () => {
  it("publishes exactly the existing 12 plus the approved 8", async () => {
    const dto = await readJson(path.join(siteRoot, "academic", "profile", "data", "public-dto.json"));
    expect(dto.advisorCount).toBe(20);
    expect(sorted(dto.advisors.map((item) => item.id))).toEqual(sorted([...EXISTING_IDS, ...COHORT_IDS]));
    expect(dto.advisors.every((item) => item.releaseEligible === true && ["approved", "published"].includes(item.publicationStatus))).toBe(true);
  });

  it("keeps guo-hui outside the public DTO", async () => {
    const dto = await readJson(path.join(siteRoot, "academic", "profile", "data", "public-dto.json"));
    expect(dto.advisors.some((item) => item.id === "guo-hui")).toBe(false);
  });

  it("contains exactly three public package files for each new advisor", async () => {
    for (const id of COHORT_IDS) {
      const files = await readdir(path.join(siteRoot, "academic", "profile", "data", "packs", id));
      expect(sorted(files)).toEqual(sorted(PACK_FILES));
    }
  });

  it("preserves the frozen publication equation and 39 featured selections", async () => {
    const totals = { candidates: 0, adopted: 0, verifiedCandidate: 0, excluded: 0, pending: 0, featured: 0 };
    for (const id of COHORT_IDS) {
      const root = path.join(siteRoot, "academic", "profile", "data", "packs", id);
      const pack = await readJson(path.join(root, "public-advisor-v1.json"));
      const manifest = await readJson(path.join(root, "evidence-manifest-v1.json"));
      totals.featured += pack.featured_publication_evidence_ids.length;
      for (const evidence of manifest.candidate_evidence.filter((item) => item.evidence_type === "publication")) {
        totals.candidates += 1;
        if (evidence.candidate_statuses.includes("adopted")) totals.adopted += 1;
        else if (evidence.candidate_statuses.includes("excluded")) totals.excluded += 1;
        else if (!evidence.identity_verified) totals.pending += 1;
        else totals.verifiedCandidate += 1;
      }
    }
    expect(totals).toEqual({ candidates: 90, adopted: 54, verifiedCandidate: 24, excluded: 6, pending: 6, featured: 39 });
  });

  it("keeps every unresolved or excluded risk out of adopted and featured", async () => {
    const risks = {
      "chen-shuhua": ["E21", "E22", "E23"],
      "guo-yi": ["E7", "E11"],
      "jiang-hao": ["E5", "E8", "E9", "E10", "E11"],
      "li-jinchen": ["E7", "E8"],
    };
    for (const [id, evidenceIds] of Object.entries(risks)) {
      const pack = await readJson(path.join(siteRoot, "academic", "profile", "data", "packs", id, "public-advisor-v1.json"));
      const publicIds = new Set([...pack.adopted_public_evidence_ids, ...pack.featured_publication_evidence_ids]);
      expect(evidenceIds.filter((id) => publicIds.has(id))).toEqual([]);
    }
  });

  it("does not expose unresolved or conflicting advisor ORCIDs", async () => {
    const dto = await readFile(path.join(siteRoot, "academic", "profile", "data", "public-dto.json"), "utf8");
    for (const value of ["0000-0001-7431-1838", "0000-0001-7270-1939", "0000-0003-3335-9303", "0000-0001-5522-806X"]) {
      expect(dto).not.toContain(value);
    }
  });

  it("preserves all pre-release public package content including Hu Zhengmao", async () => {
    for (const id of EXISTING_IDS) {
      for (const file of PACK_FILES) {
        const relative = `site-src/academic/profile/data/packs/${id}/${file}`;
        expect(() => execFileSync("git", ["diff", "--quiet", BASELINE, "--", relative], { cwd: repoRoot }), `${id}/${file}`).not.toThrow();
      }
    }
  });

  it("uses production wording without preview-only banners", async () => {
    const directory = parseDirectory(await readFile(path.join(siteRoot, "academic", "directory", "assets", "data.js"), "utf8"));
    const template = await readFile(path.join(siteRoot, "t02-src", "template.js"), "utf8");
    expect(directory.publicCount).toBe(20);
    expect(template).toContain("已采用 ${pc.count} 篇");
    expect(template).not.toContain("LOCAL REVIEW ONLY");
    expect(template).not.toContain("RELEASE CANDIDATE PREVIEW");
  });
});
