import { describe, expect, it, vi } from "vitest";
import publicAdvisorJson from "../../public/data/advisors.json";
import { loadAdvisorSnapshot, resolveAdvisorDataMode } from "../data/AdvisorDataContext";
import {
  adaptAdvisorCandidates,
  adaptPublicAdvisorDtoEnvelope,
  filterAndSortAdvisors,
  getTagCounts,
} from "../data/advisorData";
import { blockedMockIds, mockCandidates } from "../mocks/advisors";
import { emptyPublicDto, syntheticPublicDto } from "./fixtures/advisors";

describe("safe public DTO mode", () => {
  it("loads only the eleven approved real DTO records without mock fallback", () => {
    expect(publicAdvisorJson.advisorCount).toBe(11);
    const snapshot = adaptPublicAdvisorDtoEnvelope(publicAdvisorJson);
    expect(snapshot.mode).toBe("dto");
    expect(snapshot.advisors.map((advisor) => advisor.id)).toEqual([
      "chen-miao",
      "hu-dehua",
      "li-faxiang",
      "li-jiada",
      "li-xing",
      "liu-jing",
      "su-haomiao",
      "tan-jieqiong",
      "wang-shixiang",
      "xiang-rong",
      "zhao-yuetao",
    ]);
    expect(snapshot.rejectedCount).toBe(0);
    expect(snapshot.advisors.some((advisor) => advisor.id.startsWith("demo-"))).toBe(false);
  });

  it("maps one synthetic DTO record to one complete UI advisor", () => {
    const snapshot = adaptPublicAdvisorDtoEnvelope(syntheticPublicDto);
    expect(snapshot.advisors).toHaveLength(1);
    expect(snapshot.advisors[0]).toEqual(expect.objectContaining({
      name: "合成批准导师",
      publicRoles: ["合成研究导师"],
      publicationStatus: "approved",
    }));
    expect(snapshot.advisors[0].researchWorkflow).toHaveLength(1);
  });

  it("fails closed for malformed DTO envelopes", () => {
    expect(() => adaptPublicAdvisorDtoEnvelope({ ...emptyPublicDto, advisorCount: 1 })).toThrow("PUBLIC_DTO_ENVELOPE_INVALID");
  });

  it("fails closed when a content Evidence ID is absent from publicEvidence", () => {
    const broken = structuredClone(syntheticPublicDto);
    broken.advisors[0].mainTechniques[0].evidenceIds = ["E9"];
    expect(() => adaptPublicAdvisorDtoEnvelope(broken)).toThrow("PUBLIC_DTO_EVIDENCE_LINK_INVALID");
  });

  it("keeps missing journal absent instead of inventing one", () => {
    const advisor = adaptPublicAdvisorDtoEnvelope(syntheticPublicDto).advisors[0];
    expect(advisor.publicEvidence[0].journal).toBeUndefined();
  });

  it("searches and counts only exported DTO advisors", () => {
    const advisors = adaptPublicAdvisorDtoEnvelope(syntheticPublicDto).advisors;
    expect(filterAndSortAdvisors(advisors, { query: "证据整理", tags: [], sort: "name" })).toHaveLength(1);
    expect(filterAndSortAdvisors(advisors, { query: "示例导师甲", tags: [], sort: "name" })).toEqual([]);
    expect(new Map(getTagCounts(advisors)).get("公开学术")).toBe(1);
  });
});

describe("explicit data modes", () => {
  it("keeps unknown modes fail-closed", () => {
    expect(resolveAdvisorDataMode("dto")).toBe("dto");
    expect(resolveAdvisorDataMode("mock")).toBe("mock");
    expect(resolveAdvisorDataMode("staging")).toBe("closed");
    expect(resolveAdvisorDataMode("production")).toBe("closed");
    expect(resolveAdvisorDataMode(undefined)).toBe("closed");
  });

  it("does not fetch the real DTO in mock mode", async () => {
    const fetcher = vi.fn();
    const snapshot = await loadAdvisorSnapshot("mock", fetcher as unknown as typeof fetch);
    expect(fetcher).not.toHaveBeenCalled();
    expect(snapshot.mode).toBe("mock");
    expect(snapshot.advisors).toHaveLength(3);
  });
});

describe("synthetic mock release gate", () => {
  const snapshot = adaptAdvisorCandidates(mockCandidates);

  it("admits only three synthetic records", () => {
    expect(snapshot.advisors).toHaveLength(3);
    expect(snapshot.rejectedCount).toBe(4);
  });

  it.each(blockedMockIds)("does not expose blocked id %s", (id) => {
    expect(snapshot.advisors.some((advisor) => advisor.id === id)).toBe(false);
  });

  it("keeps search and tag AND/OR behavior", () => {
    const result = filterAndSortAdvisors(snapshot.advisors, { query: "合成", tags: ["网络分析", "发育机制"], sort: "name" });
    expect(result.map((item) => item.id).sort()).toEqual(["demo-cell-map", "demo-compute"]);
  });
});
