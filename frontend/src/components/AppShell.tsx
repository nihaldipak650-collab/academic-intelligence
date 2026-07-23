import { Link, NavLink, Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar__inner">
          <Link className="brand" to="/" aria-label="返回导师信息库首页">
            <span className="brand__seal" aria-hidden="true">
              生
            </span>
            <span>
              <strong>导师信息库</strong>
              <small>中南大学生命科学学院</small>
            </span>
          </Link>
          <nav aria-label="主导航">
            <NavLink to="/">导师一览</NavLink>
            <a href="#usage-boundary">使用说明</a>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <p>本科生视角的公开信息整理工具 · 内容需经人工复核后发布</p>
      </footer>
    </div>
  );
}

