const evidenceNotes: Record<string, string> = {
  High: "公开证据对该项判断支持较强，但不表示结论绝对正确。",
  Medium: "公开证据提供中等支持，仍存在资料范围或解释上的不确定性。",
  Low: "公开证据支持有限，应将该项视为谨慎推断。",
  "Low–Medium": "公开证据介于有限与中等支持之间，应保留不确定性。",
  "High–Medium": "公开证据总体较强，但仍存在部分范围或身份不确定性。",
  "Medium–High": "公开证据总体较强，但仍存在部分范围或身份不确定性。",
  "No Evidence": "当前材料不足以支持判断，不能据此推断真实安排或体验。",
};

export function EvidenceTag({ level }: { level: string }) {
  const className = level.toLowerCase().replace(/[–\s]+/g, "-");
  return (
    <span
      className={`evidence-tag evidence-tag--${className}`}
      tabIndex={0}
      aria-label={`Evidence Confidence：${level}`}
    >
      {level}
      <span className="tooltip" role="tooltip">
        {evidenceNotes[level] ?? evidenceNotes.Medium}
      </span>
    </span>
  );
}
