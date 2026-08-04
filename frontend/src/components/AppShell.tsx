import { Link, NavLink, Outlet } from "react-router-dom";
import { useAdvisorData } from "../data/AdvisorDataContext";
import { FeedbackLink } from "./FeedbackLink";
import "../styles/advisor-app.css";

export function AppShell() {
  const { snapshot } = useAdvisorData();
  const reviewMode = snapshot?.mode === "review";

  return (
    <div className="app-shell advisor-app">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <header className="navbar">
        <div className="navbar__inner">
          <Link className="brand" to="/advisors" aria-label="导师信息库">
            <span className="brand__seal" aria-hidden="true">
              生
            </span>
            <span>
              <strong>导师信息库</strong>
              <small>中南大学生命科学学院</small>
            </span>
          </Link>
          <nav aria-label="主导航">
            <Link to="/">返回生命科学平台</Link>
            <NavLink to="/advisors">导师一览</NavLink>
            <FeedbackLink compact />
          </nav>
        </div>
      </header>
      {reviewMode && (
        <aside className="review-status-bar" aria-label="本地审核预览状态">
          <span>本地审核预览</span>
          <span>仅本机可见 · 尚未正式上线</span>
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
