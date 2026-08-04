export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  /** Short bullets shown in the homepage “最近更新” teaser. */
  highlights: string[];
  changes: string[];
}

/**
 * Public-facing platform changelog.
 * Keep entries visitor-safe: no review cohorts, pending advisors,
 * internal tooling, commit hashes, or gate/test metrics.
 */
export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v1.0",
    date: "2026-08-05",
    title: "生命科学本科生培养与科研服务平台首版上线",
    highlights: [
      "上线生命科学本科生培养与科研服务平台首页",
      "上线导师与研究方向信息库",
      "首批公开展示11位已完成审核导师的信息",
    ],
    changes: [
      "上线生命科学本科生培养与科研服务平台首页",
      "上线导师与研究方向信息库",
      "首批公开展示11位已完成审核导师的信息",
      "支持按姓名、研究方向和更新时间浏览、筛选导师",
      "提供研究问题、方法路线、本科准备与成长路径信息",
      "支持公开论文与证据来源定位",
      "优化手机端筛选、导师详情目录与章节跳转",
    ],
  },
  {
    version: "v0.5 Beta",
    date: "2026-07-29",
    title: "导师信息库测试版",
    highlights: [
      "完成导师列表与导师详情页",
      "接入首批导师公开资料",
      "增加搜索、筛选和响应式布局",
    ],
    changes: [
      "完成导师列表与导师详情页",
      "接入首批导师公开资料",
      "增加搜索、筛选和响应式布局",
      "建立公开信息来源与使用边界说明",
    ],
  },
];

export function getLatestChangelogEntry(): ChangelogEntry {
  return changelogEntries[0];
}

export function formatChangelogDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const [, year, month, day] = match;
  return `${year}年${Number(month)}月${Number(day)}日`;
}
