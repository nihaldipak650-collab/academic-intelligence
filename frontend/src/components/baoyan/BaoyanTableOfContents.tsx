import { useEffect, useState } from "react";
import { BAOYAN_TOC, type TocSection } from "../../data/baoyanMockData";
import { resolveBaoyanAnchorElement, scrollToBaoyanAnchor } from "../../lib/baoyanAnchors";

export function BaoyanTableOfContents() {
  const [activeId, setActiveId] = useState<string>(BAOYAN_TOC[0]?.id ?? "");

  useEffect(() => {
    const ids = BAOYAN_TOC.flatMap((section) => [
      section.id,
      ...(section.children?.map((c) => c.id) ?? []),
    ]);

    const elements = ids
      .map((id) => resolveBaoyanAnchorElement(id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isChildActive = (section: TocSection) =>
    section.children?.some((c) => c.id === activeId) ?? false;

  return (
    <nav className="baoyan-toc" aria-label="页面目录">
      <p className="baoyan-toc-heading">目录</p>
      <ul className="baoyan-toc-list">
        {BAOYAN_TOC.map((section) => {
          const sectionActive = activeId === section.id || isChildActive(section);
          return (
            <li key={section.id} className="baoyan-toc-section">
              <a
                href={`#${section.id}`}
                className={`baoyan-toc-link baoyan-toc-link--section${sectionActive ? " is-active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToBaoyanAnchor(section.id);
                }}
              >
                {section.label}
              </a>
              {section.children && section.children.length > 0 && (
                <ul className="baoyan-toc-sublist">
                  {section.children.map((child) => (
                    <li key={child.id}>
                      <a
                        href={`#${child.id}`}
                        className={`baoyan-toc-link baoyan-toc-link--child${
                          activeId === child.id ? " is-active" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToBaoyanAnchor(child.id);
                        }}
                      >
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
