import { type MouseEvent } from "react";
function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}


export function PlatformHero() {
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
              把培养路径、科研探索和常用办事入口放在同一个可信、清楚的服务平台里。我在研究：AI 到底能不能真正帮普通人解决现实问题？
            </p>
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
            </div>
            <p className="motto">知行合一 · 经世致用</p>
          </aside>
        </div>
      </section>
    </>
  );
}
