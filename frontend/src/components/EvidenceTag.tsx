type EvidenceTagProps =
  | { lane: "public_fact" | "ai_synthesis"; level?: never }
  | { lane?: never; level: string };

export function EvidenceTag(props: EvidenceTagProps) {
  if (props.level) {
    return (
      <span className="confidence" aria-label={`Evidence Confidence：${props.level}`}>
        <span aria-hidden="true">●</span>
        Evidence Confidence：{props.level}
      </span>
    );
  }
  return (
    <span className={`evidence-lane evidence-lane--${props.lane}`}>
      {props.lane === "public_fact" ? "公开事实" : "证据整理"}
    </span>
  );
}
