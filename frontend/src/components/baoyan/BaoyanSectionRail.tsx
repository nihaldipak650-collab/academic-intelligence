interface RailLink {
  label: string;
  href: string;
}

interface BaoyanSectionRailProps {
  sectionLabel: string;
  links: RailLink[];
  fileCount?: number;
}

export function BaoyanSectionRail({ sectionLabel, links, fileCount }: BaoyanSectionRailProps) {
  return (
    <aside className="baoyan-section-rail" aria-label={`${sectionLabel}速览`}>
      <p className="baoyan-rail-label">本节速览</p>
      <p className="baoyan-rail-section">{sectionLabel}</p>

      <p className="baoyan-rail-label baoyan-rail-label--spaced">你可能还想看</p>
      <ul className="baoyan-rail-links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>

      {fileCount != null && fileCount > 0 && (
        <p className="baoyan-rail-files">
          相关官方文件
          <span>{fileCount} 份</span>
        </p>
      )}
    </aside>
  );
}
