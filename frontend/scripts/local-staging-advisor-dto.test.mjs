import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  STAGING_ADVISOR_KEYS,
  buildLocalStagingDto,
  defaultStagingPaths,
  validateLocalStagingDto,
  writeLocalStagingDto,
} from "./local-staging-advisor-dto.mjs";

const expectedIds = [
  "wang-shixiang",
  "zhao-yuetao",
  "tan-jieqiong",
  "su-haomiao",
  "chen-miao",
  "li-xing",
];
const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function sourceState() {
  const files = expectedIds.flatMap((id) => [
    path.join(defaultStagingPaths.sourceRoot, id, "public-advisor-v1.json"),
    path.join(defaultStagingPaths.sourceRoot, id, "validation-report-v1.json"),
  ]);
  const contents = await Promise.all(files.map((file) => readFile(file)));
  return createHash("sha256").update(Buffer.concat(contents)).digest("hex");
}

describe("local staging advisor DTO", () => {
  it("exports exactly the six allowlisted production-validated advisors", async () => {
    const before = await sourceState();
    const envelope = await buildLocalStagingDto();
    const after = await sourceState();

    expect(envelope.advisorCount).toBe(6);
    expect(envelope.advisors.map((advisor) => advisor.id)).toEqual(expectedIds);
    expect(new Set(envelope.advisors.map((advisor) => advisor.id)).size).toBe(6);
    expect(after).toBe(before);
  });

  it("preserves non-publication state and emits only safe allowlisted fields", async () => {
    const envelope = await buildLocalStagingDto();
    expect(envelope).toMatchObject({
      source: "local-staging-advisor-contract",
      scope: "local_staging_only",
      publicReleaseApproved: false,
      cohortDate: "2026-08-03",
    });

    envelope.advisors.forEach((advisor) => {
      expect(advisor.publicationStatus).toBe("review_pending");
      expect(advisor.releaseEligible).toBe(false);
      expect(Object.keys(advisor).sort()).toEqual([...STAGING_ADVISOR_KEYS].sort());
    });

    const serialized = JSON.stringify(envelope);
    ["contact", "identity-review", "repository_source_ref", "C:\\\\Users\\\\", "/Users/", "release_eligible"].forEach((marker) => {
      expect(serialized).not.toContain(marker);
    });
  });

  it("writes and validates only an ignored local staging artifact", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "advisor-staging-"));
    temporaryRoots.push(root);
    const outputFile = path.join(root, "public", "data", "advisors.json");
    const written = await writeLocalStagingDto({ outputFile });
    const validated = await validateLocalStagingDto({ outputFile });
    expect(written.advisorCount).toBe(6);
    expect(validated.advisorCount).toBe(6);
  });

  it("keeps the formal deployable DTO at zero", async () => {
    const formalDto = JSON.parse(await readFile(path.join(process.cwd(), "public", "data", "advisors.json"), "utf8"));
    expect(formalDto.advisorCount).toBe(0);
    expect(formalDto.advisors).toEqual([]);
  });
});
