import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mockCandidates } from "../mocks/advisors";
import { syntheticPublicDto } from "../mocks/publicDto";
import type { AdvisorDataSnapshot, SiteConfig, V104Candidate } from "../types/advisor";
import {
  adaptAdvisorCandidates,
  adaptLocalReviewDtoEnvelope,
  adaptPublicAdvisorDtoEnvelope,
} from "./advisorData";

interface AdvisorDataState {
  snapshot: AdvisorDataSnapshot | null;
  loading: boolean;
  error: string | null;
  siteConfig: SiteConfig;
}

const DEFAULT_SITE_CONFIG: SiteConfig = { feedbackUrl: null };

const AdvisorDataContext = createContext<AdvisorDataState | null>(null);

interface AdvisorDataProviderProps {
  children: ReactNode;
  initialCandidates?: V104Candidate[];
  initialDto?: unknown;
  initialSiteConfig?: SiteConfig;
  simulatedError?: boolean;
  delayMs?: number;
}

export type ConfiguredDataMode = "mock" | "dto" | "review" | "closed";

export function resolveAdvisorDataMode(value: unknown): ConfiguredDataMode {
  if (value === "mock" || value === "test") return "mock";
  if (value === "dto") return "dto";
  if (value === "review") return "review";
  return "closed";
}

function configuredMode() {
  return resolveAdvisorDataMode(import.meta.env.VITE_DATA_MODE ?? import.meta.env.MODE);
}

function mockScenario() {
  if (configuredMode() !== "mock") return "default";
  const query = new URLSearchParams(window.location.search).get("scenario");
  return query ?? import.meta.env.VITE_MOCK_SCENARIO ?? "default";
}

export async function loadAdvisorSnapshot(
  mode: ConfiguredDataMode,
  fetcher: typeof fetch = fetch,
): Promise<AdvisorDataSnapshot> {
  if (mode === "mock") return adaptAdvisorCandidates(mockCandidates);
  if (mode !== "dto" && mode !== "review") throw new Error("DATA_MODE_NOT_APPROVED");
  const response = await fetcher(`${import.meta.env.BASE_URL}data/advisors.json`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("PUBLIC_DTO_REQUEST_FAILED");
  const envelope = await response.json();
  if (mode === "review") return adaptLocalReviewDtoEnvelope(envelope);
  return adaptPublicAdvisorDtoEnvelope(envelope);
}

function isSiteConfig(value: unknown): value is SiteConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const feedbackUrl = (value as Record<string, unknown>).feedbackUrl;
  return feedbackUrl === null || typeof feedbackUrl === "string";
}

export async function loadSiteConfig(fetcher: typeof fetch = fetch): Promise<SiteConfig> {
  try {
    const response = await fetcher(`${import.meta.env.BASE_URL}data/site-config.json`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return DEFAULT_SITE_CONFIG;
    const parsed = await response.json();
    if (!isSiteConfig(parsed)) return DEFAULT_SITE_CONFIG;
    return { feedbackUrl: parsed.feedbackUrl ?? null };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

function immediateState(
  initialCandidates?: V104Candidate[],
  initialDto?: unknown,
  initialSiteConfig?: SiteConfig,
): AdvisorDataState | null {
  const siteConfig = initialSiteConfig ?? DEFAULT_SITE_CONFIG;
  if (initialCandidates !== undefined) {
    return { snapshot: adaptAdvisorCandidates(initialCandidates), loading: false, error: null, siteConfig };
  }
  if (initialDto !== undefined) {
    try {
      return { snapshot: adaptPublicAdvisorDtoEnvelope(initialDto), loading: false, error: null, siteConfig };
    } catch {
      return {
        snapshot: null,
        loading: false,
        error: "公开导师 DTO 格式无效，页面已安全停止加载。",
        siteConfig,
      };
    }
  }
  return null;
}

export function AdvisorDataProvider({
  children,
  initialCandidates,
  initialDto,
  initialSiteConfig,
  simulatedError = false,
  delayMs = 180,
}: AdvisorDataProviderProps) {
  const immediate = initialCandidates !== undefined || initialDto !== undefined;
  const [state, setState] = useState<AdvisorDataState>(
    () =>
      immediateState(initialCandidates, initialDto, initialSiteConfig) ?? {
        snapshot: null,
        loading: true,
        error: null,
        siteConfig: initialSiteConfig ?? DEFAULT_SITE_CONFIG,
      },
  );

  useEffect(() => {
    if (immediate) return;
    let active = true;
    const mode = configuredMode();
    const scenario = mockScenario();
    const wait = mode === "mock" && scenario === "loading" ? 30_000 : delayMs;
    const timer = window.setTimeout(async () => {
      if (!active) return;
      if (simulatedError || (mode === "mock" && scenario === "error")) {
        setState((current) => ({ ...current, snapshot: null, loading: false, error: "数据加载失败，请刷新后重试。" }));
        return;
      }
      const siteConfig = mode === "dto" || mode === "review"
        ? await loadSiteConfig()
        : DEFAULT_SITE_CONFIG;
      if (!active) return;
      try {
        const snapshot = mode === "mock" && scenario === "dto-one"
          ? { ...adaptPublicAdvisorDtoEnvelope(syntheticPublicDto), mode: "mock" as const }
          : await loadAdvisorSnapshot(mode);
        if (active) setState({ snapshot, loading: false, error: null, siteConfig });
      } catch {
        if (active) {
          setState({
            snapshot: null,
            loading: false,
            error: "数据模式或公开 DTO 未通过安全校验，页面已停止加载。",
            siteConfig,
          });
        }
      }
    }, wait);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [delayMs, immediate, simulatedError]);

  const value = useMemo(() => state, [state]);
  return <AdvisorDataContext.Provider value={value}>{children}</AdvisorDataContext.Provider>;
}

export function useAdvisorData() {
  const context = useContext(AdvisorDataContext);
  if (!context) throw new Error("useAdvisorData must be used within AdvisorDataProvider");
  return context;
}
