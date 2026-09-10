// @vitest-environment jsdom
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import {
  LATEST_REVIEW_ROOT,
  LATEST_SITE_SOURCES,
  buildLatestReviewSite,
  verifyLatestReviewSite,
} from "./local-review-phase2-latest-site.mjs";
import { PHASE2_ADVISOR_IDS } from "./local-review-phase2-advisor-dto.mjs";

describe("Phase 2 latest-surface local review", () => {
  beforeAll(async () => {
    await buildLatestReviewSite();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  test("builds the exact eight through the v1.0.6 review gate", async () => {
    const result = await buildLatestReviewSite();
    expect(result.manifest.advisor_ids).toEqual(PHASE2_ADVISOR_IDS);
    await expect(verifyLatestReviewSite()).resolves.toMatchObject({
      status: "OWNER_PUBLICATION_DECISIONS_APPLIED_READY_FOR_FINAL_WEB_REVIEW",
      public_release_approved: false,
    });
  });

  test("copies latest directory and T02 visual authority while patching output only", async () => {
    const sourceCss = await readFile(path.join(LATEST_SITE_SOURCES.directory, "css", "base.css"), "utf8");
    const outputCss = await readFile(path.join(LATEST_REVIEW_ROOT, "academic", "css", "base.css"), "utf8");
    expect(outputCss).toBe(sourceCss);
    const sourceHtml = await readFile(path.join(LATEST_SITE_SOURCES.profile, "profile.html"), "utf8");
    const outputHtml = await readFile(path.join(LATEST_REVIEW_ROOT, "academic", "profile", "profile.html"), "utf8");
    const normalize = (text) => text.replace(/\r\n/g, "\n");
    const [sourcePrefix, sourceSuffix] = normalize(sourceHtml).split("</body>");
    expect(normalize(outputHtml)).toContain(sourcePrefix);
    expect(normalize(outputHtml)).toContain(`</body>${sourceSuffix}`);
    expect(outputHtml).toContain("r4-feedback");
    const directoryHtml = await readFile(path.join(LATEST_REVIEW_ROOT, "academic", "index.html"), "utf8");
    expect(directoryHtml).toContain('href="css/r2-green.css"');
    expect(directoryHtml).toContain('class="back-to-parent"');
  });

  test("keeps public fail-closed source untouched", async () => {
    const sourceApp = await readFile(path.join(LATEST_SITE_SOURCES.profile, "app.js"), "utf8");
    const outputApp = await readFile(path.join(LATEST_REVIEW_ROOT, "academic", "profile", "app.js"), "utf8");
    expect(sourceApp).toContain("if (!m || !m.release.eligible)");
    expect(outputApp).not.toBe(sourceApp);
    expect(outputApp).toContain("m.release.eligible !== false");
  });

  test("refuses destructive or verification roots outside the fixed review directory", async () => {
    await expect(buildLatestReviewSite(path.join(LATEST_REVIEW_ROOT, "unsafe-child"))).rejects.toThrow("UNSAFE_LATEST_REVIEW_OUTPUT_ROOT");
    await expect(verifyLatestReviewSite(path.dirname(LATEST_REVIEW_ROOT))).rejects.toThrow("UNSAFE_LATEST_REVIEW_VERIFY_ROOT");
  });

  test("check rejects an extra ninth pack directory", async () => {
    const extra = path.join(LATEST_REVIEW_ROOT, "academic", "profile", "data", "packs", "hu-zhengmao");
    await mkdir(extra, { recursive: true });
    await expect(verifyLatestReviewSite()).rejects.toThrow("LATEST_PACK_EXACT_SET_FAILED");
    await rm(extra, { recursive: true, force: true });
    await expect(verifyLatestReviewSite()).resolves.toBeTruthy();
  });

  test("renders all eight routes and rejects Hu Zhengmao plus an unknown id", async () => {
    const profileRoot = path.join(LATEST_REVIEW_ROOT, "academic", "profile");
    vi.stubGlobal("fetch", async (url) => {
      const relative = String(url).replace(/^\.\//, "");
      try {
        const body = await readFile(path.join(profileRoot, relative), "utf8");
        return new Response(body, { status: 200, headers: { "content-type": "application/json" } });
      } catch {
        return new Response("not found", { status: 404 });
      }
    });
    const moduleUrl = `${pathToFileURL(path.join(profileRoot, "app.js")).href}?route-test=${Date.now()}`;
    const { mountProfile } = await import(moduleUrl);
    for (const id of PHASE2_ADVISOR_IDS) {
      window.history.replaceState({}, "", `/?id=${id}&t=t02`);
      document.body.innerHTML = '<div id="root"></div>';
      await mountProfile();
      const text = document.body.textContent || "";
      expect(text).toContain("LOCAL REVIEW ONLY");
      expect(text).toContain("论文检索已执行");
      expect(text).toMatch(/候选论文 \d+/);
      expect(text).toMatch(/已采用论文 \d+/);
      expect(text).toMatch(/导师 ORCID：(verified|unresolved|not_found)/);
      expect(text).toContain("Owner 已选代表论文");
      expect(text).not.toContain("已核验成果 0 篇（已核验）");
    }
    for (const id of ["hu-zhengmao", "unknown-advisor"]) {
      window.history.replaceState({}, "", `/?id=${id}&t=t02`);
      document.body.innerHTML = '<div id="root"></div>';
      await mountProfile();
      expect(document.body.textContent).toContain("该档案不在本地审核范围");
      expect(document.body.textContent).not.toContain("LOCAL REVIEW ONLY");
    }
  });
});
