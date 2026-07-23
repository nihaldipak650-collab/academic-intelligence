import type { ConfidenceLevel } from "../types/advisor";

interface ConfidenceTagProps {
  level: ConfidenceLevel;
  note: string;
  showLabel?: boolean;
}

export function ConfidenceTag({
  level,
  note,
  showLabel = false,
}: ConfidenceTagProps) {
  return (
    <span className={`confidence confidence--${level}`} tabIndex={0}>
      {showLabel ? `Evidence · ${level}` : `${level}置信度`}
      <span className="tooltip" role="tooltip">
        {note}
      </span>
    </span>
  );
}

