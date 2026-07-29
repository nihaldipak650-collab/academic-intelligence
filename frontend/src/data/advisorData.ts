import type { Advisor, AdvisorDataEnvelope, SiteConfig } from "../types/advisor";

export function assetPath(path: string) {
  const normalized = path.replace(/^\.?\//, "");
  return `${import.meta.env.BASE_URL}${normalized}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(assetPath(path));
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function loadAdvisorData(): Promise<AdvisorDataEnvelope> {
  const data = await fetchJson<AdvisorDataEnvelope>("data/advisors.json");
  if (
    data.schemaVersion !== 1 ||
    !Array.isArray(data.advisors) ||
    data.advisorCount !== data.advisors.length
  ) {
    throw new Error("导师数据格式无效");
  }
  return data;
}

export async function loadSiteConfig(): Promise<SiteConfig> {
  try {
    const config = await fetchJson<SiteConfig>("data/site-config.json");
    return { feedbackUrl: config.feedbackUrl?.trim() ?? "" };
  } catch {
    return { feedbackUrl: "" };
  }
}

export function filterAdvisors(
  advisors: Advisor[],
  query: string,
  selectedTags: string[] | string,
) {
  const needle = query.trim().toLocaleLowerCase();
  const tags = Array.isArray(selectedTags)
    ? selectedTags
    : selectedTags
      ? [selectedTags]
      : [];
  return advisors.filter((advisor) => {
    const searchable = [
      advisor.nameZh,
      advisor.nameEn ?? "",
      advisor.summary,
      ...advisor.tags,
      ...advisor.quickSummary.mainTechniques,
      ...advisor.quickSummary.undergraduatePaths,
      advisor.position ?? "",
      advisor.institution ?? "",
    ]
      .join("\n")
      .toLocaleLowerCase();
    const matchesQuery = !needle || searchable.includes(needle);
    const matchesTag =
      tags.length === 0 || tags.some((tag) => advisor.tags.includes(tag));
    return matchesQuery && matchesTag;
  });
}

export function getTagCounts(advisors: Advisor[]) {
  const counts = new Map<string, number>();
  advisors.forEach((advisor) => {
    new Set(advisor.tags).forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "zh-CN"),
  );
}

export function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "暂无公开信息";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function versionLabel(version: string) {
  if (version === "source-not-specified") {
    return "版本未标注";
  }
  if (version === "legacy-web") {
    return "旧站公开资料";
  }
  return version;
}
