import type { UserSourceLabel } from "../../data/baoyanMockData";

const BADGE_CLASS: Record<UserSourceLabel, string> = {
  官方政策: "baoyan-badge--official",
  老师确认: "baoyan-badge--teacher",
  学长学姐经验: "baoyan-badge--peer",
  经验文章: "baoyan-badge--article",
  AI整理: "baoyan-badge--ai",
};

interface SourceBadgeProps {
  label: UserSourceLabel;
}

export function SourceBadge({ label }: SourceBadgeProps) {
  return <span className={`baoyan-badge ${BADGE_CLASS[label]}`}>{label}</span>;
}
