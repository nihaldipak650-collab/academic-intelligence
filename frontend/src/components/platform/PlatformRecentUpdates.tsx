import { Link } from "react-router-dom";
import {
  formatChangelogDate,
  getLatestChangelogEntry,
} from "../../data/changelog";

export function PlatformRecentUpdates() {
  const latest = getLatestChangelogEntry();
  const highlights = latest.highlights.slice(0, 3);

  return (
    <section
      className="recent-updates-section"
      id="recent-updates"
      aria-labelledby="recent-updates-title"
    >
      <div className="section-heading">
        <div>
          <div className="section-kicker">Recent updates</div>
          <h2 id="recent-updates-title" className="serif">
            最近更新
          </h2>
        </div>
        <p className="section-intro">
          查看平台公开版本变化，了解首页与导师信息库的最新进展。
        </p>
      </div>

      <article className="recent-updates-card">
        <div className="recent-updates-card__meta">
          <span className="updates-version">{latest.version}</span>
          <time dateTime={latest.date}>{formatChangelogDate(latest.date)}</time>
        </div>
        <h3>{latest.title}</h3>
        <ul>
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link className="text-link" to="/updates">
          查看完整更新日志 <span aria-hidden="true">→</span>
        </Link>
      </article>
    </section>
  );
}
