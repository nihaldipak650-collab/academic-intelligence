import { BAOYAN_ROADMAP } from "../../data/baoyanMockData";

export function BaoyanRoadmap() {
  return (
    <section className="baoyan-roadmap" id="section-roadmap" aria-labelledby="baoyan-roadmap-title">
      <header className="baoyan-section-head">
        <p className="baoyan-eyebrow">后续补充</p>
        <h2 className="baoyan-section-title serif" id="baoyan-roadmap-title">
          接下来还会补什么？
        </h2>
      </header>
      <ul className="baoyan-roadmap-list">
        {BAOYAN_ROADMAP.map((item) => (
          <li key={item.id} className="baoyan-roadmap-item">
            <span className="baoyan-roadmap-title">{item.title}</span>
            <span className="baoyan-roadmap-status">{item.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
