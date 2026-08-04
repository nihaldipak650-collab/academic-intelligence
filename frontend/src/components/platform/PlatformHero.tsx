import { useState, type FormEvent, type MouseEvent } from "react";
import { usePlatformToast } from "./PlatformToast";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function routeSearch(
  query: string,
  showToast: (message: string) => void,
  focusInput: () => void,
) {
  const value = query.trim();
  if (!value) {
    focusInput();
    showToast("请输入想查找的事项，例如导师、PPT或报销。");
    return;
  }
  const researchTerms = /导师|科研|研究|实验室|论文|方向/;
  const serviceTerms = /PPT|汇报|报销|表格|校表|实验课|课程|请假|证明/i;
  const workspaceTerms = /课表|待办|最近使用|工作台/;
  const target = researchTerms.test(value)
    ? "academic-intelligence"
    : serviceTerms.test(value)
      ? "services"
      : workspaceTerms.test(value)
        ? "workspace"
        : "growth-path";
  scrollToId(target);
  showToast(`原型搜索已为“${value}”定位到相关模块。`);
}

export function PlatformHero() {
  const { showToast } = usePlatformToast();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input = document.getElementById("searchInput") as HTMLInputElement | null;
    routeSearch(query, showToast, () => input?.focus());
  }

  function handleHint(next: string) {
    setQuery(next);
    const input = document.getElementById("searchInput") as HTMLInputElement | null;
    routeSearch(next, showToast, () => input?.focus());
  }

  function handleStartClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    scrollToId(id);
  }

  return (
    <>
      <div id="top" />
      <section className="hero" aria-labelledby="hero-title">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="campus-label">面向中南大学生命科学本科生</div>
            <h1 id="hero-title" className="serif">
              学习、科研与校园事务，<span>从这里清晰开始。</span>
            </h1>
            <p className="hero-description">
              把培养路径、科研探索和常用办事入口放在同一个可信、清楚的服务平台里。先找到方向，再完成下一步。
            </p>
            <form className="search-form" role="search" onSubmit={handleSubmit}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <label className="sr-only" htmlFor="searchInput">
                搜索平台内容
              </label>
              <input
                id="searchInput"
                type="search"
                autoComplete="off"
                placeholder="搜索导师、研究方向、PPT、报销或课程资料"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="submit">开始搜索</button>
            </form>
            <div className="search-hints">
              <span>试试：</span>
              <button type="button" onClick={() => handleHint("导师与研究方向")}>
                导师与研究方向
              </button>
              <button type="button" onClick={() => handleHint("实验课准备")}>
                实验课准备
              </button>
              <button type="button" onClick={() => handleHint("报销指南")}>
                报销指南
              </button>
            </div>
          </div>

          <aside className="hero-aside" aria-label="推荐起点">
            <span className="knot" aria-hidden="true" />
            <div className="aside-label">Start here</div>
            <h2>今天从哪里开始？</h2>
            <div className="start-list">
              <a
                className="start-item"
                href="#academic-intelligence"
                onClick={(event) => handleStartClick(event, "academic-intelligence")}
              >
                <span className="num">01</span>
                <span>
                  <strong>探索科研方向</strong>
                  <small>导师、实验室与论文证据</small>
                </span>
                <span className="arrow">→</span>
              </a>
              <a
                className="start-item"
                href="#services"
                onClick={(event) => handleStartClick(event, "services")}
              >
                <span className="num">02</span>
                <span>
                  <strong>完成校园事务</strong>
                  <small>报销、表格、请假与证明</small>
                </span>
                <span className="arrow">→</span>
              </a>
              <a
                className="start-item"
                href="#workspace"
                onClick={(event) => handleStartClick(event, "workspace")}
              >
                <span className="num">03</span>
                <span>
                  <strong>查看学生工作台</strong>
                  <small>课表、待办与最近使用</small>
                </span>
                <span className="arrow">→</span>
              </a>
            </div>
            <p className="motto">知行合一 · 经世致用</p>
          </aside>
        </div>
      </section>
    </>
  );
}
