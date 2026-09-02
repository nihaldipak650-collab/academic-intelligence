import { BAOYAN_META } from "../../../data/baoyanMockData";

export function EditorialHero() {
  return (
    <header className="ed-hero">
      <p className="ed-hero-kicker">{BAOYAN_META.college}</p>
      <h1 className="ed-hero-title serif">
        保研，
        <br />
        到底是怎么一回事？
      </h1>
      <p className="ed-hero-deck">
        推免规则 · 历年执行 · 学生行动指南
      </p>
      <div className="ed-hero-intro">
        <p>很多学生第一次认真了解保研，是在已经需要做决定的时候。</p>
        <p>这里不尝试告诉你一条「标准成功路径」。</p>
        <p>我们先把三件事情搞清楚：</p>
        <ul>
          <li>规则是什么，</li>
          <li>过去实际发生了什么，</li>
          <li>以及你现在能做什么。</li>
        </ul>
      </div>
      <p className="ed-hero-meta">
        证据来源：《生命科学学院保研证据交接包 v0.2》· 聚焦 {BAOYAN_META.cohortFocus}
      </p>
    </header>
  );
}
