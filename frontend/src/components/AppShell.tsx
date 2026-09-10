import { Link, NavLink, Outlet } from "react-router-dom";
import { useAdvisorData } from "../data/AdvisorDataContext";
import { FeedbackLink } from "./FeedbackLink";

export function AppShell() {
  const { advisors } = useAdvisorData();
  const phase2Review = advisors.length === 8 && advisors.every(
    (advisor) => advisor.version === "1.0.6" && advisor.releaseEligible === false,
  );

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar__inner">
          <Link className="brand" to="/advisors" aria-label="返回导师信息库首页">
            <span className="brand__seal" aria-hidden="true">
              生
            </span>
            <span>
              <strong>导师信息库</strong>
              <small>中南大学生命科学学院</small>
            </span>
          </Link>
          <nav aria-label="主导航">
            <NavLink to="/advisors">导师一览</NavLink>
            <FeedbackLink compact />
          </nav>
        </div>
      </header>
      {phase2Review ? (
        <aside className="review-status-bar" aria-label="本地 Owner 审核状态">
          <strong>LOCAL REVIEW ONLY</strong>
          <span>NOT PUBLIC</span>
          <span>RELEASE ELIGIBLE: FALSE</span>
          <span>PUBLICATION IDENTITY: PENDING</span>
          <span>PUBLICATION SEARCH: NOT RUN</span>
        </aside>
      ) : (
        <aside className="review-status-bar" aria-label="本地审核预览状态">
          <strong>本地审核预览</strong>
          <span>仅本机可见 · 尚未正式上线</span>
        </aside>
      )}
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <p>
          本科生视角的公开信息整理工具 · 不提供评分、排名或推荐 ·
          内容需经人工复核后发布
        </p>
      </footer>
    </div>
  );
}
