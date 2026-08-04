import { Link, NavLink, Outlet } from "react-router-dom";
import { useAdvisorData } from "../data/AdvisorDataContext";
import { FeedbackLink } from "./FeedbackLink";
import "../styles/advisor-app.css";

const MODE_BADGE_LABEL: Record<string, string> = {
  dto: "安全公开 DTO",
  review: "本地审核预览",
  staging: "本地预发布验证",
  mock: "本地合成数据",
  closed: "安全数据门",
};

export function AppShell() {
  const { snapshot } = useAdvisorData();
  const mode = snapshot?.mode;

  return (
    <div className="app-shell advisor-app">
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <header className="navbar">
        <div className="navbar__inner">
          <Link className="brand" to="/advisors" aria-label="返回导师信息库首页">
            <span className="brand__seal" aria-hidden="true">生</span>
            <span>
              <strong>导师信息库</strong>
              <small>中南大学生命科学学院</small>
            </span>
          </Link>
          <nav aria-label="主导航">
            <NavLink to="/">平台首页</NavLink>
            <NavLink to="/advisors">导师一览</NavLink>
            <FeedbackLink compact />
            <span className="mode-badge">{mode ? MODE_BADGE_LABEL[mode] ?? "安全数据门" : "安全数据门"}</span>
          </nav>
        </div>
      </header>
      {mode === "review" && (
        <aside className="staging-banner" aria-label="本地审核预览状态">
          <strong>本地审核预览</strong>
          <span>尚未正式上线</span>
        </aside>
      )}
      {mode === "staging" && (
        <aside className="staging-banner" aria-label="本地预发布状态">
          <strong>本地预发布验证</strong>
          <span>尚未正式上线</span>
        </aside>
      )}
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <p>
          聚合公开信息 · 帮助理解与缩小候选 · 提示未知并准备线下核验 ·
          不提供评分、排名或自动推荐
        </p>
      </footer>
    </div>
  );
}
