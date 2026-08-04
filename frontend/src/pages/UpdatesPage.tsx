import { Link } from "react-router-dom";
import {
  changelogEntries,
  formatChangelogDate,
} from "../data/changelog";
import { PlatformFooter } from "../components/platform/PlatformFooter";
import { PlatformHeader } from "../components/platform/PlatformHeader";
import "../styles/platform-home.css";

export function UpdatesPage() {
  return (
    <div className="platform-home">
      <PlatformHeader />
      <main className="shell updates-page">
        <header className="updates-page__hero">
          <p className="section-kicker">Platform updates</p>
          <h1 className="serif">更新日志</h1>
          <p>
            记录生命科学本科生培养与科研服务平台面向访问者的公开更新，方便了解版本变化与可用能力。
          </p>
        </header>

        <ol className="updates-timeline">
          {changelogEntries.map((entry) => (
            <li className="updates-entry" key={`${entry.version}-${entry.date}`}>
              <div className="updates-entry__meta">
                <span className="updates-version">{entry.version}</span>
                <time dateTime={entry.date}>{formatChangelogDate(entry.date)}</time>
              </div>
              <h2>{entry.title}</h2>
              <ul>
                {entry.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="updates-page__back">
          <Link to="/">← 返回平台首页</Link>
        </p>
      </main>
      <PlatformFooter />
    </div>
  );
}
