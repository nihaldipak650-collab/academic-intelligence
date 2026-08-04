import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const frontendRoot = path.resolve(process.cwd());

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const file = path.join(directory, name);
    if (statSync(file).isDirectory()) return sourceFiles(file);
    return /\.(?:ts|tsx|css)$/.test(name) && !file.includes(`${path.sep}test${path.sep}`) ? [file] : [];
  });
}

describe("dual-mode safety contract", () => {
  it("keeps mock publicDir disabled and enables public only for dto and local review", () => {
    const config = readFileSync(path.join(frontendRoot, "vite.config.ts"), "utf8");
    expect(config).toContain('mode === "dto"');
    expect(config).toContain('".local-review/public"');
    expect(config).not.toContain(".local-staging");
    expect(config).not.toContain('"staging"');
    expect(config).toContain('mode === "review"');
    expect(config).toContain("LOCAL_REVIEW_BUILD_FORBIDDEN");
  });

  it("preserves DTO export, validation, prebuild and artifact scans without staging", () => {
    const packageJson = JSON.parse(readFileSync(path.join(frontendRoot, "package.json"), "utf8"));
    expect(packageJson.scripts["dev:mock"]).toContain("--mode mock");
    expect(packageJson.scripts["dev:dto"]).toContain("--mode dto");
    expect(packageJson.scripts["dev:review"]).toMatch(/generate:review.*--mode review/);
    expect(packageJson.scripts["dev:staging"]).toBeUndefined();
    expect(packageJson.scripts["generate:staging"]).toBeUndefined();
    expect(packageJson.scripts["build:mock"]).toContain("--mode mock");
    expect(packageJson.scripts["build:safe"]).toMatch(/scan:prebuild.*sync:data.*validate:data.*scan:public.*--mode dto.*scan:artifact/);
    expect(packageJson.scripts["sync:data"]).toContain("export:dto");
    expect(packageJson.scripts.test).toBe("vitest run");
  });

  it("contains no runtime reference to legacy report or production directories", () => {
    const runtime = sourceFiles(path.join(frontendRoot, "src"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(runtime).not.toContain("web/reports");
    expect(runtime).not.toContain("frontend/public/reports");
    expect(runtime).not.toContain("data/advisors-v1");
  });

  it("contains no prohibited real-person or local-path markers in runtime source", () => {
    const runtime = sourceFiles(path.join(frontendRoot, "src"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    ["项荣", "刘静", "李发祥", "郭辉", "胡德华", "胡正茂", "李家大", "C:\\Users\\", "/Users/"].forEach((marker) => {
      expect(runtime).not.toContain(marker);
    });
  });

  it("keeps synthetic mocks free of real institutions, emails and DOI hosts", () => {
    const mocks = readFileSync(path.join(frontendRoot, "src", "mocks", "advisors.ts"), "utf8");
    expect(mocks).not.toMatch(/@(?:csu|csu\.edu|qq|gmail)/i);
    expect(mocks).not.toContain("doi.org");
    expect(mocks).not.toContain("中南大学");
  });
});
