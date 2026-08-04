import { Link } from "react-router-dom";
import { usePlatformToast } from "./PlatformToast";

export function PlatformFlagship() {
  const { showToast } = usePlatformToast();

  return (
    <section id="academic-intelligence" aria-labelledby="ai-title">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Flagship research service</div>
          <h2 id="ai-title">从兴趣出发，找到可以验证的科研方向</h2>
        </div>
        <p className="section-intro">
          Academic Intelligence 是平台的旗舰科研模块，帮你查导师、看方向、找实验室，并了解公开信息来自哪里。
        </p>
      </div>
      <article className="flagship">
        <div className="flagship-copy">
          <span className="flagship-badge">旗舰科研工具</span>
          <h2>
            Academic
            <br />
            Intelligence
          </h2>
          <p className="flagship-subtitle">
            帮你快速了解学院有哪些导师、他们在研究什么、实验室在哪里，以及公开可查的联系方式和相关资料。
          </p>
          <div className="flagship-features">
            <span>导师与实验室公开信息</span>
            <span>研究方向检索</span>
            <span>论文与证据溯源</span>
          </div>
          <div className="button-row">
            <Link className="button button-light" to="/advisors">
              进入导师与研究方向平台 <span aria-hidden="true">↗</span>
            </Link>
            <button
              className="button button-ghost"
              type="button"
              onClick={() => showToast("即将开放")}
            >
              了解信息来源与使用边界
            </button>
          </div>
        </div>

        <div
          className="intelligence-preview"
          aria-label="Academic Intelligence搜索结果静态示意"
        >
          <div className="preview-top">
            <strong>研究方向探索</strong>
            <span>静态界面示意</span>
          </div>
          <div className="preview-search">
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
            <span>植物逆境响应与分子机制</span>
          </div>
          <div className="result-label">检索结果如何组织</div>
          <div className="result-card">
            <div className="result-card-head">
              <strong>研究方向与导师信息</strong>
              <span className="evidence">公开来源</span>
            </div>
            <p>先查看方向摘要，再比较实验室公开信息与代表性论文。</p>
            <div className="tags">
              <span>研究方向</span>
              <span>导师信息</span>
              <span>实验室</span>
            </div>
          </div>
          <div className="result-card">
            <div className="result-card-head">
              <strong>论文与证据来源</strong>
              <span className="evidence">可追溯</span>
            </div>
            <p>关键内容保留来源入口，区分公开事实、平台整理与待核验信息。</p>
            <div className="tags">
              <span>论文</span>
              <span>来源链接</span>
              <span>信息边界</span>
            </div>
          </div>
          <div className="preview-foot">
            示意内容不代表真实导师匹配或学院推荐结果。
          </div>
        </div>
      </article>
    </section>
  );
}
