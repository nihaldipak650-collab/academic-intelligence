import { describe, expect, it, vi } from "vitest";
import { loadAdvisorSnapshot, resolveAdvisorDataMode } from "../data/AdvisorDataContext";
import { adaptLocalStagingDtoEnvelope } from "../data/advisorData";
import { syntheticPublicDto } from "./fixtures/advisors";

function stagingEnvelope() {
  const advisor = structuredClone(syntheticPublicDto.advisors[0]) as Record<string, unknown>;
  advisor.publicationStatus = "review_pending";
  advisor.releaseEligible = false;
  const advisors: Array<Record<string, unknown>> = Array.from({ length: 6 }, (_, index) => ({
    ...structuredClone(advisor),
    id: `staging-advisor-${index + 1}`,
  }));
  return {
    schemaVersion: 1,
    dtoVersion: "1.0.4",
    source: "local-staging-advisor-contract",
    scope: "local_staging_only",
    publicReleaseApproved: false,
    cohortDate: "2026-08-03",
    advisorCount: 6,
    advisors,
  };
}

describe("local staging data mode", () => {
  it("recognizes only the explicit staging mode", () => {
    expect(resolveAdvisorDataMode("staging")).toBe("staging");
    expect(resolveAdvisorDataMode("local-staging")).toBe("closed");
  });

  it("loads the staging contract without falling back to mock or formal DTO", async () => {
    const envelope = stagingEnvelope();
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => envelope });
    const snapshot = await loadAdvisorSnapshot("staging", fetcher as unknown as typeof fetch);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(snapshot.mode).toBe("staging");
    expect(snapshot.advisors).toHaveLength(6);
    expect(snapshot.advisors.every((advisor) => advisor.publicationStatus === "review_pending")).toBe(true);
  });

  it("rejects formal, short or publication-approved envelopes in staging mode", () => {
    expect(() => adaptLocalStagingDtoEnvelope(syntheticPublicDto)).toThrow("LOCAL_STAGING_DTO_ENVELOPE_INVALID");
    const short = stagingEnvelope();
    short.advisors.pop();
    short.advisorCount = 5;
    expect(() => adaptLocalStagingDtoEnvelope(short)).toThrow("LOCAL_STAGING_DTO_ENVELOPE_INVALID");
    const approved = stagingEnvelope();
    approved.advisors[0].publicationStatus = "approved";
    approved.advisors[0].releaseEligible = true;
    expect(() => adaptLocalStagingDtoEnvelope(approved)).toThrow("PUBLIC_DTO_ADVISOR_GATE_INVALID");
  });
});
