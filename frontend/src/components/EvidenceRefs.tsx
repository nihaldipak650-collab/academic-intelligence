export function evidenceAnchorId(evidenceId: string) {
  return `public-evidence-${evidenceId.toLocaleLowerCase()}`;
}

export function EvidenceRefs({ evidenceIds }: { evidenceIds: string[] }) {
  if (!evidenceIds.length) {
    return <span className="evidence-refs evidence-refs--empty">暂无公开 Evidence 关联</span>;
  }
  return (
    <span className="evidence-refs" aria-label="内容 Evidence 引用">
      {evidenceIds.map((evidenceId) => (
        <button
          type="button"
          key={evidenceId}
          onClick={() => document.getElementById(evidenceAnchorId(evidenceId))?.scrollIntoView({ block: "start" })}
          aria-label={`定位到 Evidence ${evidenceId}`}
        >
          {evidenceId}
        </button>
      ))}
    </span>
  );
}
