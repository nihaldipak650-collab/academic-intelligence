import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ConfidenceTag } from "../components/ConfidenceTag";
import { EmptyState } from "../components/EmptyState";
import { FeedbackLink } from "../components/FeedbackLink";
import {
  extractHeadings,
  MarkdownReport,
} from "../components/MarkdownReport";
import { ErrorState, LoadingState } from "../components/PageState";
import { useAdvisorData } from "../data/AdvisorDataContext";
import {
  assetPath,
  formatUpdatedAt,
  versionLabel,
} from "../data/advisorData";
import type { Advisor } from "../types/advisor";

function ExperiencePanel({ advisor }: { advisor: Advisor }) {
  if (!advisor.hasExperienceEvidence) {
    return (
      <EmptyState
        title="当前仅包含公开学术证据，暂无经过授权的本科生经历材料。"
        description="公开论文不能证明导师真实指导方式、实验室氛围、反馈频率或本科生任务安排。"
      />
    );
  }
  return (
    <div className="experience-panel" role="note">
      <span>EXPERIENCE EVIDENCE</span>
      <strong>
        包含 {advisor.experienceCaseCount} 个经授权的本科生经历案例
      </strong>
      <p>
        代表性为 Unknown。经历内容只代表特定学生和特定时期，不转化为对实验室整体的评价；
        Case ID 与事实/体验分层请以完整报告原文为准。
      </p>
    </div>
  );
}

export function AdvisorDetailPage() {
  const { id } = useParams();
  const { advisors, loading: dataLoading, error: dataError } = useAdvisorData();
  const advisor = advisors.find((item) => item.id === id);
  const [markdown, setMarkdown] = useState("");
  const [reportState, setReportState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);

  useEffect(() => {
    if (!advisor) {
      return;
    }
    let active = true;
    setReportState("loading");
    setMarkdown("");
    fetch(assetPath(advisor.reportPath))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("报告请求失败");
        }
        const content = await response.text();
        if (!content.trim()) {
          throw new Error("报告为空");
        }
        if (active) {
          setMarkdown(content);
          setReportState("ready");
        }
      })
      .catch(() => {
        if (active) {
          setReportState("error");
        }
      });
    return () => {
      active = false;
    };
  }, [advisor]);

  useEffect(() => {
    document.title = advisor
      ? `${advisor.nameZh}｜导师证据报告`
      : "导师信息库｜中南大学生命科学学院";
    return () => {
      document.title = "导师信息库｜中南大学生命科学学院";
    };
  }, [advisor]);

  if (dataLoading) {
    return <LoadingState />;
  }
  if (dataError) {
    return <ErrorState title="导师数据无法加载" description={dataError} />;
  }
  if (!advisor) {
    return (
      <ErrorState
        title="没有找到这位导师"
        description="链接中的导师 ID 不存在，或该资料尚未进入公开配置。"
      />
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-toolbar">
        <Link className="back-link" to="/">
          ← 返回导师列表
        </Link>
        <FeedbackLink />
      </div>

      <header className="profile-header">
        <div className="profile-header__identity">
          <div className="avatar avatar--large" aria-hidden="true">
            {advisor.initials}
          </div>
          <div>
            <span className="profile-kicker">
              {advisor.evidenceType === "academic_only"
                ? "ACADEMIC-ONLY"
                : "ACADEMIC + EXPERIENCE"}
            </span>
            <h1>
              {advisor.nameZh}
              {advisor.nameEn && <small>{advisor.nameEn}</small>}
            </h1>
            <p>{advisor.summary}</p>
          </div>
        </div>
        <dl className="profile-meta">
          <div>
            <dt>作者身份匹配</dt>
            <dd>
              <ConfidenceTag
                level={advisor.authorMatchConfidence}
                label="Confidence"
                note={
                  advisor.authorConfidenceSource ===
                  "legacy_academic_confidence"
                    ? "旧站来源仅提供 academic_confidence；本页原样归一化其等级，不额外扩大学术结论。"
                    : undefined
                }
              />
            </dd>
          </div>
          <div>
            <dt>版本 / 状态</dt>
            <dd>
              {versionLabel(advisor.version)} · {advisor.status}
            </dd>
          </div>
          <div>
            <dt>最后更新</dt>
            <dd>{formatUpdatedAt(advisor.lastUpdated)}</dd>
          </div>
          <div>
            <dt>经历案例</dt>
            <dd>{advisor.experienceCaseCount}</dd>
          </div>
        </dl>
      </header>

      <section className="quick-summary" aria-labelledby="quick-summary-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">QUICK READ</span>
            <h2 id="quick-summary-title">先看这一页摘要</h2>
          </div>
          <span className="source-chip">{advisor.sourceTypeLabel}</span>
        </div>
        <div className="quick-grid">
          <article>
            <span>01</span>
            <h3>核心方向</h3>
            <div className="tag-list">
              {advisor.quickSummary.coreDirections.map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
          <article>
            <span>02</span>
            <h3>主要技术</h3>
            {advisor.quickSummary.mainTechniques.length ? (
              <ul>
                {advisor.quickSummary.mainTechniques.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>来源报告未提供可稳定抽取的技术条目，请阅读完整报告。</p>
            )}
          </article>
          <article>
            <span>03</span>
            <h3>本科生可能路径</h3>
            {advisor.quickSummary.undergraduatePaths.length ? (
              <ul>
                {advisor.quickSummary.undergraduatePaths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>来源报告未提供可稳定抽取的路径条目，请阅读完整报告。</p>
            )}
          </article>
          <article className="quick-grid__boundary">
            <span>04</span>
            <h3>重要边界</h3>
            <p>
              {advisor.hasExperienceEvidence
                ? "单个经历案例的代表性为 Unknown；不得推广为实验室整体事实。"
                : "当前仅有公开学术证据；真实带教方式与本科生安排均不能由论文推断。"}
            </p>
          </article>
        </div>
      </section>

      <section className="experience-section" aria-labelledby="experience-title">
        <span className="section-kicker">EXPERIENCE STATUS</span>
        <h2 id="experience-title">本科生经历证据</h2>
        <ExperiencePanel advisor={advisor} />
      </section>

      {reportState === "loading" && <LoadingState />}
      {reportState === "error" && (
        <ErrorState
          title="完整报告暂时无法读取"
          description="报告文件不存在或请求失败。导师摘要仍可查看，请返回列表或稍后重试。"
        />
      )}
      {reportState === "ready" && (
        <section className="report-section" aria-labelledby="full-report-title">
          <div className="report-heading">
            <div>
              <span className="section-kicker">VERBATIM REPORT</span>
              <h2 id="full-report-title">完整审核报告</h2>
              <p>
                下方按原始 Markdown 完整呈现，Evidence 编号、Confidence、
                DOI、No Evidence 与 Boundary Statement 均不隐藏。
              </p>
            </div>
            <span className="source-chip">{advisor.sourceLabel}</span>
          </div>

          <details className="mobile-toc">
            <summary>展开本文目录</summary>
            <nav aria-label="移动端报告目录">
              {headings.map((heading) => (
                <a
                  href={`#${heading.id}`}
                  className={`toc-depth-${heading.depth}`}
                  key={heading.id}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </details>

          <div className="doc-layout">
            <aside className="doc-rail">
              <nav className="anchor-nav" aria-label="报告目录">
                <strong>报告目录</strong>
                {headings.map((heading) => (
                  <a
                    href={`#${heading.id}`}
                    className={`toc-depth-${heading.depth}`}
                    key={heading.id}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </aside>
            <article className="markdown-body">
              <MarkdownReport markdown={markdown} />
            </article>
            <aside className="evidence-rail">
              <strong>阅读提示</strong>
              <p>Evidence 表示来源支持程度，不是导师评分。</p>
              <p>No Evidence 表示当前资料不足，不能补写或猜测。</p>
              <p>外部 DOI 链接将在新窗口打开。</p>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
