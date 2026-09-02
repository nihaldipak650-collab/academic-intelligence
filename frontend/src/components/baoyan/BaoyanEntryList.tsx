import type { NavEntry } from "../../data/baoyanMockData";

interface BaoyanEntryListProps {
  entries: NavEntry[];
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function BaoyanEntryList({ entries }: BaoyanEntryListProps) {
  return (
    <nav className="baoyan-entries" aria-label="核心入口">
      <ul className="baoyan-entries-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="baoyan-entry"
              onClick={() => scrollToSection(entry.sectionId)}
            >
              <span className="baoyan-entry-num">{entry.number}</span>
              <span className="baoyan-entry-body">
                <strong className="baoyan-entry-title">{entry.title}</strong>
                <span className="baoyan-entry-desc">{entry.description}</span>
              </span>
              <span className="baoyan-entry-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
