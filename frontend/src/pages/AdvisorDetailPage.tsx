import { Link, Navigate, useParams } from "react-router-dom";
import { ConfidenceTag } from "../components/ConfidenceTag";
import { EmptyState } from "../components/EmptyState";
import { advisors } from "../data/advisors";

const anchors = [
  ["overview", "研究概览"],
  ["path", "成长路径"],
  ["risks", "门槛与风险"],
  ["evidence", "学术证据"],
  ["experience", "本科生经历"],
  ["boundary", "使用边界"],
];

export function AdvisorDetailPage() {
  const { id } = useParams();
  const advisor = advisors.find((item) => item.id === id);

  if (!advisor) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="doc-layout">
      <aside className="doc-rail doc-rail--left">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link to="/">导师一览</Link>
          <span>/</span>
          <span>{advisor.name}</span>
        </nav>
        <p className="document-meta">
          公开证据画像
          <br />
          更新于 {advisor.updatedAt}
        </p>
      </aside>

      <article className="advisor-document">
        <header className="profile-header">
          <div className="avatar avatar--large" aria-hidden="true">
            {advisor.initials}
          </div>
          <div>
            <ConfidenceTag
              level={advisor.confidence}
              note={advisor.confidenceNote}
              showLabel
            />
            <h1>
              {advisor.name}
              <small>{advisor.englishName}</small>
            </h1>
            <p>{advisor.summary}</p>
          </div>
        </header>

        <section className="doc-section" id="overview">
          <div className="doc-section__heading">
            <span>01</span>
            <h2>研究概览</h2>
          </div>
          <dl className="descriptions">
            <div>
              <dt>核心问题</dt>
              <dd>{advisor.researchQuestion}</dd>
            </div>
            <div>
              <dt>研究方向</dt>
              <dd>
                <div className="tag-list">
                  {advisor.directions.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            <div>
              <dt>技术路线</dt>
              <dd>{advisor.methods.join(" · ")}</dd>
            </div>
            <div>
              <dt>证据判断</dt>
              <dd>{advisor.confidenceNote}</dd>
            </div>
          </dl>
        </section>

        <section className="doc-section" id="path">
          <div className="doc-section__heading">
            <span>02</span>
            <h2>可能的成长路径</h2>
          </div>
          <p className="section-intro">
            以下是根据研究技术路线拆解的学习任务，不代表导师已公布的培养承诺。
          </p>
          <ol className="timeline">
            {advisor.timeline.map((item) => (
              <li key={item.period}>
                <div className="timeline__period">{item.period}</div>
                <div className="timeline__content">
                  <h3>{item.title}</h3>
                  <ul>
                    {item.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="doc-section" id="risks">
          <div className="doc-section__heading">
            <span>03</span>
            <h2>技术门槛与风险</h2>
          </div>
          <div className="alert" role="note">
            <strong>选择前请留意</strong>
            <ul>
              {advisor.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="doc-section" id="evidence">
          <div className="doc-section__heading">
            <span>04</span>
            <h2>学术证据</h2>
          </div>
          <details className="collapse">
            <summary>
              代表论文与 DOI
              <span>{advisor.papers.length} 条</span>
            </summary>
            <div className="paper-list">
              {advisor.papers.map((paper) => (
                <article key={`${paper.title}-${paper.year}`}>
                  <h3>{paper.title}</h3>
                  <p>
                    {paper.journal} · {paper.year}
                  </p>
                  {paper.doi && <code>DOI: {paper.doi}</code>}
                </article>
              ))}
            </div>
          </details>
        </section>

        <section className="doc-section" id="experience">
          <div className="doc-section__heading">
            <span>05</span>
            <h2>可选的本科生经历</h2>
          </div>
          {advisor.experiences.length ? (
            <ul className="experience-list">
              {advisor.experiences.map((experience) => (
                <li key={experience}>{experience}</li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="暂无经历证据"
              description="当前公开材料不足以支持对本科生参与方式的描述。"
            />
          )}
        </section>

        <section className="doc-section" id="boundary">
          <div className="doc-section__heading">
            <span>06</span>
            <h2>使用边界</h2>
          </div>
          <blockquote className="boundary-quote">{advisor.boundary}</blockquote>
        </section>

        <Link className="back-link" to="/">
          ← 返回导师一览
        </Link>
      </article>

      <aside className="doc-rail doc-rail--right">
        <nav className="anchor-nav" aria-label="本文目录">
          <strong>本页目录</strong>
          {anchors.map(([href, label]) => (
            <a key={href} href={`#${href}`}>
              {label}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}

