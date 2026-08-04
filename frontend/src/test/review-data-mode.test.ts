import { describe, expect, it, vi } from "vitest";
import { loadAdvisorSnapshot, resolveAdvisorDataMode } from "../data/AdvisorDataContext";
import { adaptLocalReviewDtoEnvelope, adaptPublicAdvisorDtoEnvelope } from "../data/advisorData";
import { syntheticPublicDto } from "./fixtures/advisors";

const REVIEW_NOTE = "待项目负责人人工审核，仅用于本地预览，未经公开批准。";

const EXPECTED_IDS = [
  "chen-miao",
  "guo-hui",
  "hu-dehua",
  "hu-zhengmao",
  "li-faxiang",
  "li-jiada",
  "li-xing",
  "liu-jing",
  "su-haomiao",
  "tan-jieqiong",
  "wang-shixiang",
  "xiang-rong",
  "zhao-yuetao",
] as const;

function reviewAdvisor(id: string, pending: boolean) {
  const base = structuredClone(syntheticPublicDto.advisors[0]) as Record<string, unknown>;
  return {
    ...base,
    id,
    publicationStatus: pending ? "review_pending" : "approved",
    releaseEligible: !pending,
    ...(pending ? { dataStatusNote: REVIEW_NOTE } : {}),
  };
}

function reviewEnvelope() {
  const advisors = EXPECTED_IDS.map((id) => reviewAdvisor(id, id === "guo-hui" || id === "hu-zhengmao"));
  return {
    schemaVersion: 1,
    dtoVersion: "1.0.4",
    source: "local-review-advisor-contract",
    scope: "local_review_only",
    publicReleaseApproved: false,
    cohortDate: "2026-08-04",
    advisorCount: 13,
    advisors,
  };
}

describe("local review data mode", () => {
  it("recognizes only the explicit review mode", () => {
    expect(resolveAdvisorDataMode("review")).toBe("review");
    expect(resolveAdvisorDataMode("local-review")).toBe("closed");
  });

  it("loads exactly 13 mixed-gate advisors in review mode", async () => {
    const envelope = reviewEnvelope();
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => envelope });
    const snapshot = await loadAdvisorSnapshot("review", fetcher as unknown as typeof fetch);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(snapshot.mode).toBe("review");
    expect(snapshot.advisors).toHaveLength(13);
    expect(snapshot.advisors.map((advisor) => advisor.id).sort()).toEqual([...EXPECTED_IDS]);
    expect(snapshot.advisors.filter((advisor) => advisor.publicationStatus === "review_pending")).toHaveLength(2);
    expect(snapshot.advisors.filter((advisor) => advisor.publicationStatus === "approved")).toHaveLength(11);
  });

  it("rejects formal public envelopes and wrong-sized review envelopes", () => {
    expect(() => adaptLocalReviewDtoEnvelope(syntheticPublicDto)).toThrow("LOCAL_REVIEW_DTO_ENVELOPE_INVALID");
    const short = reviewEnvelope();
    short.advisors.pop();
    short.advisorCount = 12;
    expect(() => adaptLocalReviewDtoEnvelope(short)).toThrow("LOCAL_REVIEW_DTO_ENVELOPE_INVALID");
  });

  it("keeps guo-hui and hu-zhengmao out of formal dto adaptation", () => {
    const formal = {
      ...syntheticPublicDto,
      advisors: [reviewAdvisor("guo-hui", true)],
      advisorCount: 1,
    };
    expect(() => adaptPublicAdvisorDtoEnvelope(formal)).toThrow("PUBLIC_DTO_ADVISOR_GATE_INVALID");
  });
});
