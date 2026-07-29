import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadAdvisorData, loadSiteConfig } from "./advisorData";
import type { Advisor, AdvisorDataEnvelope, SiteConfig } from "../types/advisor";

interface AdvisorDataState {
  advisors: Advisor[];
  siteConfig: SiteConfig;
  loading: boolean;
  error: string | null;
}

const AdvisorDataContext = createContext<AdvisorDataState | null>(null);

interface AdvisorDataProviderProps {
  children: ReactNode;
  initialData?: AdvisorDataEnvelope;
  initialConfig?: SiteConfig;
}

export function AdvisorDataProvider({
  children,
  initialData,
  initialConfig,
}: AdvisorDataProviderProps) {
  const [state, setState] = useState<AdvisorDataState>(() => ({
    advisors: initialData?.advisors ?? [],
    siteConfig: initialConfig ?? { feedbackUrl: "" },
    loading: !initialData,
    error: null,
  }));

  useEffect(() => {
    if (initialData) {
      return;
    }
    let active = true;
    Promise.all([loadAdvisorData(), loadSiteConfig()])
      .then(([data, config]) => {
        if (active) {
          setState({
            advisors: data.advisors,
            siteConfig: config,
            loading: false,
            error: null,
          });
        }
      })
      .catch(() => {
        if (active) {
          setState({
            advisors: [],
            siteConfig: { feedbackUrl: "" },
            loading: false,
            error: "导师数据暂时无法加载，请稍后重试。",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [initialData]);

  const value = useMemo(() => state, [state]);
  return (
    <AdvisorDataContext.Provider value={value}>
      {children}
    </AdvisorDataContext.Provider>
  );
}

export function useAdvisorData() {
  const context = useContext(AdvisorDataContext);
  if (!context) {
    throw new Error("useAdvisorData must be used within AdvisorDataProvider");
  }
  return context;
}
