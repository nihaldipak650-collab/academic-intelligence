import type { Confidence } from "../types/advisor";

export function ConfidenceTag({ level }: { level: Confidence }) {
  const label = level === "No Evidence" ? "暂无可靠公开证据" : level;
  return (
    <span className={`confidence confidence--${level.toLowerCase().replace(/\s+/g, "-")}`}>
      <span aria-hidden="true">●</span> 证据置信度：{label}
    </span>
  );
}
