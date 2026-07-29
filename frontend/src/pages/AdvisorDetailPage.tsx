import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ConfidenceTag } from "../components/ConfidenceTag";
import { EmptyState } from "../components/EmptyState";
import { EvidenceTag } from "../components/EvidenceTag";
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
import {
  getAdvisorContact,
  getAdvisorFreshness,
  getPublicUndergraduateTasks,
  getResearchTermExplanations,
  MISSING_PUBLIC_INFO,
  NO_RELIABLE_PUBLIC_EVIDENCE,
  PENDING_VERIFICATION,
  publicEvidenceLabel,
} from "../data/advisorPresentation";
import type { AdvisorContact } from "../types/advisor";

const publicSections = [
  ["overview", "先看这里"],
  ["research", "研究与联系"],
  ["undergraduate", "本科生准备"],
  ["growth", "成长路线"],
  ["evidence", "证据说明"],
  ["report", "完整学术报告"],
] as const;

function scrollToElement(elementId: string) {
  const element = document.getElementById(elementId);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
  element?.focus({ preventScroll: true });
}

function scrollToHeading(
  event: MouseEvent<HTMLAnchorElement>,
  headingId: string,
) {
  event.preventDefault();
  scrollToElement(headingId);
}

function PublicValue({ value }: { value: string | null }) {
  return <>{value?.trim() || MISSING_PUBLIC_INFO}</>;
}

function OfficialLink({ value }: { value: string | null }) {
  if (!value) return <>{MISSING_PUBLIC_INFO}</>;
  return (
    <a href={value} target="_blank" rel="noopener noreferrer">
      打开官方页面
    </a>
  );
}

function ContactFacts({ contact }: { contact: AdvisorContact }) {
  return (
    <>
      <dl className="fact-list contact-facts">
        <div>
          <dt>官方邮箱</dt>
          <dd><PublicValue value={contact.officialEmail} /></dd>
        </div>
        <div>
          <dt>官方电话</dt>
          <dd><PublicValue value={contact.officialPhone} /></dd>
        </div>
        <div>
          <dt>实验室地址</dt>
          <dd><PublicValue value={contact.laboratoryAddress} /></dd>
        </div>
        <div>
          <dt>官方主页</dt>
          <dd><OfficialLink value={contact.officialHomepage} /></dd>
        </div>
      </dl>
      <details className="source-disclosure">
        <summary>查看联系方式来源</summary>
        <p>
          {contact.sourceUrl ? (
            <a href={contact.sourceUrl} target="_blank" rel="noopener noreferrer">
              打开公开来源
            </a>
          ) : (
            MISSING_PUBLIC_INFO
          )}
        </p>
      </details>
    </>
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
  const headings = useMemo(
    () => extractHeadings(markdown, true),
    [markdown],
  );
  const contact = useMemo(() => getAdvisorContact(advisor), [advisor]);
  const freshness = useMemo(
    () => (advisor ? getAdvisorFreshness(advisor) : null),
    [advisor],
  );
  const tasks = useMemo(
    () => (advisor ? getPublicUndergraduateTasks(advisor) : []),
    [advisor],
  );
  const terms = useMemo(
    () => (advisor ? getResearchTermExplanations(advisor) : []),
    [advisor],
  );

  useEffect(() => {
    if (!advisor) return;
    let active = true;
    setReportState("loading");
    setMarkdown("");
    fetch(assetPath(advisor.reportPath))
      .then(async (response) => {
        if (!response.ok) throw new Error("报告请求失败");
        const content = await response.text();
        if (!content.trim()) throw new Error("报告为空");
        if (active) {
          setMarkdown(content);
          setReportState("ready");
        }
      })
      .catch(() => {
        if (active) setReportState("error");
      });
    return () => {
      active = false;
    };
  }, [advisor]);

  useEffect(() => {
    document.title = advisor
      ? `${advisor.nameZh}｜导师公开信息`
      : "导师信息库｜中南大学生命科学学院";
    return () => {
      document.title = "导师信息库｜中南大学生命科学学院";
    };
  }, [advisor]);

  useEffect(() => {
    if (reportState !== "ready") return;
    const resetScroll = () => window.scrollTo({ top: 0, left: 0 });
    resetScroll();
    const frameId = window.requestAnimationFrame(resetScroll);
    const timeoutId = window.setTimeout(resetScroll, 100);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [advisor?.id, reportState]);

  if (dataLoading) return <LoadingState />;
  if (dataError) {
    return <ErrorState title="导师数据无法加载" description={dataError} />;
  }
  if (!advisor || !freshness) {
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
        <Link className="back-link" to="/">← 返回导师列表</Link>
        <FeedbackLink />
      </div>

      <header className="profile-header">
        <div className="profile-header__identity">
          <div className="avatar avatar--large" aria-hidden="true">
            {advisor.initials}
          </div>
          <div>
            <span className="profile-kicker">{publicEvidenceLabel()}</span>
            <h1>
              {advisor.nameZh}
              {advisor.nameEn && <small>{advisor.nameEn}</small>}
            </h1>
            <p>{advisor.summary}</p>
          </div>
        </div>
        <dl className="profile-meta">
          <div><dt>职位 / 身份</dt><dd>{advisor.position ?? MISSING_PUBLIC_INFO}</dd></div>
          <div><dt>网站版本</dt><dd>1.0 RC1</dd></div>
          <div><dt>档案版本</dt><dd>{versionLabel(advisor.version)}</dd></div>
          <div><dt>最新核验</dt><dd>{formatUpdatedAt(freshness.lastVerifiedAt)}</dd></div>
          <div><dt>当前本科生机会</dt><dd>{freshness.opportunityStatus}</dd></div>
        </dl>
      </header>

      <nav className="section-nav" aria-label="详情页主要内容">
        {publicSections.map(([sectionId, label]) => (
          <button type="button" onClick={() => scrollToElement(sectionId)} key={sectionId}>
            {label}
          </button>
        ))}
      </nav>

      <section className="quick-summary content-section" id="overview" tabIndex={-1}>
        <div className="section-heading">
          <div>
            <span className="section-kicker">START HERE</span>
            <h2>先看这里</h2>
          </div>
          <span className="source-chip">1 分钟概览</span>
        </div>
        <div className="quick-grid">
          <article>
            <span>01 · 公开事实</span>
            <h3>主要研究方向</h3>
            <div className="tag-list">
              {advisor.quickSummary.coreDirections.map((item) => (
                <span className="tag" key={item}>{item}</span>
              ))}
            </div>
          </article>
          <article>
            <span>02 · AI整理</span>
            <h3>报告中的主要方法</h3>
            {advisor.quickSummary.mainTechniques.length ? (
              <>
                <ul>
                  {advisor.quickSummary.mainTechniques.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {advisor.quickSummary.mainTechniques.length > 3 && (
                  <details className="technique-disclosure">
                    <summary>
                      查看全部技术（共{advisor.quickSummary.mainTechniques.length}项）
                    </summary>
                    <ul>
                      {advisor.quickSummary.mainTechniques.slice(3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            ) : <p>{NO_RELIABLE_PUBLIC_EVIDENCE}</p>}
          </article>
          <article>
            <span>03 · 动态信息</span>
            <h3>当前是否招收本科生</h3>
            <p className="missing-copy">{PENDING_VERIFICATION}</p>
            <p>公开论文不能证明当前名额、项目机会或实际带教安排。</p>
          </article>
          <article className="quick-grid__boundary">
            <span>04 · 决策边界</span>
            <h3>这页能做什么</h3>
            <p>用于理解研究方向、缩小候选范围并准备联系问题，不替代本人联系、线下核验和最终决定。</p>
          </article>
        </div>
      </section>

      <section className="content-section editorial-group" id="research" tabIndex={-1}>
        <div className="editorial-group__heading">
          <span className="section-kicker">RESEARCH &amp; PUBLIC FACTS</span>
          <h2>研究方向与公开联系</h2>
          <p>先用通俗解释理解研究主题，再核对身份、机构与官方联系方式。</p>
        </div>
        <div className="editorial-subsection">
          <h3>方向与术语怎么理解</h3>
          <div className="term-grid">
            {terms.map((item) => (
              <article className="term-card" key={item.term}>
                <span className="tag">原始方向 · {item.term}</span>
                <h4>{item.plainLanguage}</h4>
                <p><strong>对本科生意味着什么：</strong>{item.undergraduateMeaning}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="editorial-subsection" id="identity-contact" tabIndex={-1}>
          <h3>基础身份与官方联系</h3>
          <dl className="fact-list identity-facts">
            <div><dt>姓名</dt><dd>{advisor.nameZh}{advisor.nameEn ? ` / ${advisor.nameEn}` : ""}</dd></div>
            <div><dt>所属机构</dt><dd><PublicValue value={advisor.institution ?? null} /></dd></div>
            <div><dt>职位 / 身份</dt><dd>{advisor.position ?? MISSING_PUBLIC_INFO}</dd></div>
            <div><dt>数据状态</dt><dd>{freshness.dataStatus}</dd></div>
          </dl>
          <ContactFacts contact={contact} />
        </div>
      </section>

      <section className="content-section editorial-group" id="undergraduate" tabIndex={-1}>
        <div className="editorial-group__heading">
          <span className="section-kicker">UNDERGRADUATE PREPARATION</span>
          <h2>本科生任务与联系准备</h2>
          <p>把公开证据中的可能任务和线下核验问题放在同一处阅读，不将推测写成现实安排。</p>
        </div>
        <div className="editorial-subsection" id="tasks" tabIndex={-1}>
          <h3>本科生可能任务</h3>
          <p className="section-intro">以下内容仅是基于公开证据的理解线索，不是实验室承诺、岗位说明或实际安排。</p>
          {tasks.length ? (
            <div className="task-list">
              {tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-card__heading">
                    <span className="lane-label lane-label--ai">AI整理</span>
                    <EvidenceTag level={task.evidenceStatus} />
                  </div>
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <dl>
                    <div><dt>研究背景</dt><dd>{task.background}</dd></div>
                    <div><dt>为什么做</dt><dd>{task.whyItMatters}</dd></div>
                    <div><dt>可能方法</dt><dd>{task.methods.length ? task.methods.join("、") : PENDING_VERIFICATION}</dd></div>
                    <div><dt>可能产出</dt><dd>{task.expectedOutput}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title={NO_RELIABLE_PUBLIC_EVIDENCE}
              description="当前公开展示层没有足够的结构化证据说明本科生具体任务。请在线下联系时确认任务边界、方法、时间投入和实际指导人。"
            />
          )}
        </div>
        <div className="editorial-subsection contact-prep" id="contact-prep" tabIndex={-1}>
          <h3>低压力联系准备与线下核验</h3>
          <div className="contact-prep-grid">
            <article>
              <h4>联系前准备</h4>
              <ul className="check-list">
                <li>用两三句话说明自己的年级、基础和感兴趣的问题。</li>
                <li>准备一份真正读过的公开论文或研究方向问题。</li>
                <li>明确询问当前是否有本科生机会，不预设一定有名额。</li>
              </ul>
            </article>
            <article>
              <h4>线下核验清单</h4>
              <ul className="check-list">
                <li>实际带教人是谁，多久沟通一次？</li>
                <li>本科生可参与哪些任务，时间投入和安全要求是什么？</li>
                <li>是否有明确的试做范围、反馈节点和退出方式？</li>
              </ul>
            </article>
          </div>
          <div className="experience-public-note" role="note">
            学生经历信息暂未纳入1.0公开展示。单个经历不能代表整个实验室，实际带教与相处情况请通过本人联系和线下了解进一步确认。
          </div>
          <blockquote className="decision-boundary">本站帮助理解公开信息和准备核验问题，不进行导师评价、推荐或排名，也不替代你的最终决定。</blockquote>
        </div>
      </section>

      <details className="content-collapse content-section" id="growth" tabIndex={-1}>
        <summary>
          <span><small>GENERAL REFERENCE</small><strong>科研成长路线与前置技能</strong></span>
          <em>默认折叠 · 通用参考</em>
        </summary>
        <div className="collapse-body">
          <p className="boundary-note">以下路线是面向本科生的通用准备参考，不是该导师或实验室的官方培养方案。</p>
          <div className="growth-timeline">
            <article><span>0—3 个月</span><h3>理解问题与建立基本规范</h3><p>阅读核心概念，学习文献记录、数据管理、实验安全与可复现要求。</p></article>
            <article><span>3—6 个月</span><h3>完成边界清楚的小任务</h3><p>在明确指导和检查点下，尝试数据整理、文献矩阵或成熟流程中的单点练习。</p></article>
            <article><span>6—12 个月</span><h3>形成可复核的小型结果</h3><p>围绕一个明确问题整理方法、结果与局限，并接受阶段性反馈。</p></article>
          </div>
          <h3>联系前可准备的通用技能</h3>
          <ul className="check-list">
            <li>能说明自己感兴趣的问题，而不仅是罗列技术名词。</li>
            <li>准备一份近期课程、编程或实验基础的诚实说明。</li>
            <li>了解文献记录、数据备份、实验安全和研究诚信要求。</li>
            <li>具体前置技能与进入门槛：{PENDING_VERIFICATION}。</li>
          </ul>
        </div>
      </details>

      <section className="content-section" id="evidence" tabIndex={-1}>
        <span className="section-kicker">EVIDENCE BOUNDARY</span>
        <h2>证据来源与事实分层</h2>
        <div className="evidence-lane-grid">
          <article><span className="lane-label lane-label--fact">公开事实</span><p>姓名、公开研究标签、报告中列明的论文与 DOI。仍需关注来源时间和作者消歧边界。</p></article>
          <article><span className="lane-label lane-label--ai">AI整理</span><p>对研究方向、技术和可能任务的结构化整理，不等同于导师本人承诺。</p></article>
          <article><EvidenceTag level="High" /><p>公开证据支持较强，但不表示现实安排或未来状态已经确认。</p></article>
          <article><EvidenceTag level="Medium" /><p>证据有限或解释仍有不确定性，应进一步核验。</p></article>
          <article><EvidenceTag level="No Evidence" /><p>{NO_RELIABLE_PUBLIC_EVIDENCE}，不据此补写或猜测。</p></article>
        </div>
        <div className="confidence-row">
          <ConfidenceTag level={advisor.authorMatchConfidence} label="作者身份匹配" />
        </div>
      </section>

      {reportState === "loading" && <LoadingState />}
      {reportState === "error" && (
        <ErrorState title="完整报告暂时无法读取" description="报告文件不存在或请求失败。导师摘要仍可查看，请返回列表或稍后重试。" />
      )}
      {reportState === "ready" && (
        <section className="report-section content-section" id="report" tabIndex={-1} aria-labelledby="full-report-title">
          <div className="report-heading">
            <div>
              <span className="section-kicker">DEEP ACADEMIC CONTENT</span>
              <h2 id="full-report-title">完整学术报告与论文证据</h2>
              <p>向下滚动即可阅读完整公开学术内容；Evidence、Confidence、DOI、No Evidence 与 Boundary Statement 均不隐藏。</p>
            </div>
            <span className="source-chip">{advisor.sourceLabel}</span>
          </div>
          <p className="boundary-note">学生经历相关章节不进入1.0公开展示；其余公开学术报告按原文呈现。</p>
          <details className="mobile-toc">
            <summary>展开报告目录</summary>
            <nav aria-label="移动端报告目录">
              {headings.map((heading) => (
                <a href={`#${heading.id}`} className={`toc-depth-${heading.depth}`} onClick={(event) => scrollToHeading(event, heading.id)} key={heading.id}>{heading.text}</a>
              ))}
            </nav>
          </details>
          <div className="doc-layout">
            <aside className="doc-rail">
              <nav className="anchor-nav" aria-label="报告目录">
                <strong>报告目录</strong>
                {headings.map((heading) => (
                  <a href={`#${heading.id}`} className={`toc-depth-${heading.depth}`} onClick={(event) => scrollToHeading(event, heading.id)} key={heading.id}>{heading.text}</a>
                ))}
              </nav>
            </aside>
            <article className="markdown-body">
              <MarkdownReport markdown={markdown} hideExperienceSections />
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
