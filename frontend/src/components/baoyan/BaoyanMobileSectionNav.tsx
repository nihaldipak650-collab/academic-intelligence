import { useEffect, useRef, useState } from "react";
import { BAOYAN_TOC } from "../../data/baoyanMockData";
import { scrollToBaoyanAnchor } from "../../lib/baoyanAnchors";

function scrollToAnchor(id: string) {
  scrollToBaoyanAnchor(id);
}

function scrollActiveChipHorizontally(chip: HTMLButtonElement | null) {
  if (!chip) return;

  const scrollContainer = chip.closest(".baoyan-mobile-nav-scroll");
  if (!(scrollContainer instanceof HTMLElement)) return;

  const chipCenter = chip.offsetLeft + chip.offsetWidth / 2;
  const nextLeft = chipCenter - scrollContainer.clientWidth / 2;

  scrollContainer.scrollTo({
    left: Math.max(0, nextLeft),
    behavior: "smooth",
  });
}

const SECTION_IDS = BAOYAN_TOC.map((section) => section.id);

export function BaoyanMobileSectionNav() {
  const [activeId, setActiveId] = useState<string>(SECTION_IDS[0] ?? "");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const activeChipRef = useRef<HTMLButtonElement | null>(null);
  const pendingScrollIdRef = useRef<string | null>(null);

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el != null,
    );

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
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.2, 0.45] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    scrollActiveChipHorizontally(activeChipRef.current);
  }, [activeId]);

  useEffect(() => {
    if (!catalogOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      const pendingId = pendingScrollIdRef.current;
      if (pendingId) {
        pendingScrollIdRef.current = null;
        requestAnimationFrame(() => {
          scrollToAnchor(pendingId);
        });
      }
    };
  }, [catalogOpen]);

  const handleSectionClick = (id: string) => {
    if (catalogOpen) {
      pendingScrollIdRef.current = id;
      setCatalogOpen(false);
      return;
    }

    scrollToAnchor(id);
  };

  const isSectionActive = (sectionId: string, childIds: string[] = []) =>
    activeId === sectionId || childIds.includes(activeId);

  return (
    <div className="baoyan-mobile-nav-wrap">
      <nav className="baoyan-mobile-nav" aria-label="章节导航">
        <button
          type="button"
          className={`baoyan-mobile-nav-catalog${catalogOpen ? " is-open" : ""}`}
          onClick={() => setCatalogOpen((open) => !open)}
          aria-expanded={catalogOpen}
        >
          目录 <span aria-hidden="true">{catalogOpen ? "↑" : "↓"}</span>
        </button>
        <div className="baoyan-mobile-nav-scroll" role="tablist">
          {BAOYAN_TOC.map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              ref={activeId === section.id ? activeChipRef : undefined}
              className={`baoyan-mobile-nav-chip${activeId === section.id ? " is-active" : ""}`}
              aria-selected={activeId === section.id}
              onClick={() => handleSectionClick(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
      </nav>

      {catalogOpen && (
        <div className="baoyan-mobile-catalog" aria-label="完整目录">
          {BAOYAN_TOC.map((section) => {
            const childIds = section.children?.map((c) => c.id) ?? [];
            const sectionActive = isSectionActive(section.id, childIds);
            return (
            <div key={section.id} className="baoyan-mobile-catalog-group">
              <button
                type="button"
                className={`baoyan-mobile-catalog-section${sectionActive ? " is-active" : ""}`}
                onClick={() => handleSectionClick(section.id)}
              >
                {section.label}
              </button>
              {section.children && section.children.length > 0 && (
                <ul className="baoyan-mobile-catalog-children">
                  {section.children.map((child) => (
                    <li key={child.id}>
                      <button
                        type="button"
                        className={`baoyan-mobile-catalog-child${activeId === child.id ? " is-active" : ""}`}
                        onClick={() => handleSectionClick(child.id)}
                      >
                        {child.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
