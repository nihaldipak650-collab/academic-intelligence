import { Link, NavLink, Outlet } from "react-router-dom";
import { FeedbackLink } from "./FeedbackLink";

export function AppShell() {
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
            <NavLink to="/">平台首页</NavLink>
            <NavLink to="/advisors">导师一览</NavLink>
            <FeedbackLink compact />
          </nav>
        </div>
      </header>
      <main>
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

