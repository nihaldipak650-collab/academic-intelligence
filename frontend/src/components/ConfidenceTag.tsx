import type { ConfidenceLevel } from "../types/advisor";

interface ConfidenceTagProps {
  level: ConfidenceLevel;
  label?: string;
  note?: string;
}

export function ConfidenceTag({
  level,
  label = "作者身份匹配",
  note,
}: ConfidenceTagProps) {
  const defaultNote: Record<ConfidenceLevel, string> = {
    High: "公开身份线索具有较强一致性，但不表示页面中的所有推断绝对正确。",
    Medium: "公开身份线索基本一致，仍保留同名作者或资料范围不完整的可能。",
    Low: "公开身份线索有限，阅读时需要特别留意作者消歧边界。",
    Unknown: "来源没有提供可用于确定作者身份匹配程度的字段。",
  };
  return (
    <span
      className={`confidence confidence--${level.toLowerCase()}`}
      tabIndex={0}
      aria-label={`${label}：${level}`}
    >
      {label} · {level}
      <span className="tooltip" role="tooltip">
        {note ?? defaultNote[level]}
      </span>
    </span>
  );
}

