import { useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToPlatformSection } from "../../lib/platformNav";

export function PlatformHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    setMenuOpen(false);

    if (isHome) {
      scrollToPlatformSection(id);
      return;
    }

    navigate("/", { state: { scrollTo: id } });
  }

  return (
    <header className="site-header">
      <div className="shell nav">
        <Link className="brand" to="/" aria-label="返回平台首页">
          <span className="brand-mark" aria-hidden="true">
            CSU
          </span>
          <span className="brand-copy">
            <strong>生命科学本科生平台</strong>
            <span>Learning · Research · Service</span>
          </span>
        </Link>
        <div className="nav-right">
          <nav
            className={`nav-links${menuOpen ? " open" : ""}`}
            id="mainNav"
            aria-label="主导航"
          >
            <a
              href="#academic-intelligence"
              onClick={(event) => handleNavClick(event, "academic-intelligence")}
            >
              科研探索
            </a>
            <a
              href="#growth-path"
              onClick={(event) => handleNavClick(event, "growth-path")}
            >
              成长路径
            </a>
            <a
              href="#growth-navigator"
              onClick={(event) => handleNavClick(event, "growth-navigator")}
            >
              成长导航
            </a>
            <a
              href="#services"
              onClick={(event) => handleNavClick(event, "services")}
            >
              常用服务
            </a>
            <a href="updates.html">更新日志</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-ai" href="academic/">
              Academic Intelligence <span aria-hidden="true">↗</span>
            </a>
            <button
              className="menu-button"
              type="button"
              aria-label={menuOpen ? "收起导航" : "展开导航"}
              aria-expanded={menuOpen}
              aria-controls="mainNav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
