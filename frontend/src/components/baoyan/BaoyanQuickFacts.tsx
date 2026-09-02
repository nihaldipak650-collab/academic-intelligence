import type { QuickFactItem } from "../../data/baoyanMockData";

interface BaoyanQuickFactsProps {
  items: QuickFactItem[];
  cohortLabel: string;
}

export function BaoyanQuickFacts({ items, cohortLabel }: BaoyanQuickFactsProps) {
  return (
    <section className="baoyan-quickfacts" aria-label="Quick Facts">
      <header className="baoyan-section-head baoyan-section-head--compact">
        <p className="baoyan-eyebrow">{cohortLabel} · Quick Facts</p>
      </header>
      <div className="baoyan-quickfacts-grid">
        {items.map((item) => (
          <div
            key={item.id}
            id={item.id}
            className={`baoyan-quickfact baoyan-quickfact--${item.variant}`}
          >
            <span className="baoyan-quickfact-label">{item.label}</span>
            <span className="baoyan-quickfact-value serif">{item.value}</span>
            {item.unit && <span className="baoyan-quickfact-unit">{item.unit}</span>}
            <p className="baoyan-quickfact-meaning">{item.meaning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
