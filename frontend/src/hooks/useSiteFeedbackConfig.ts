import { useEffect, useState } from "react";

export interface SiteFeedbackConfig {
  feedbackUrl: string;
  feedbackEmail: string;
}

export function useSiteFeedbackConfig() {
  const [config, setConfig] = useState<SiteFeedbackConfig | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("data/site-config.json")
      .then((response) => response.json())
      .then((json) => {
        if (cancelled) return;
        setConfig({
          feedbackUrl: String(json.feedbackUrl ?? "").trim(),
          feedbackEmail: String(json.feedbackEmail ?? "").trim(),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({ feedbackUrl: "", feedbackEmail: "" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
