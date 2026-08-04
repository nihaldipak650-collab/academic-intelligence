import {
  useEffect,
  useLayoutEffect,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { EvidenceRefs, evidenceAnchorId } from "../components/EvidenceRefs";
import { ErrorState, LoadingState } from "../components/PageState";
import { PublicInfoBoundary } from "../components/PublicInfoBoundary";
import { StudentDecisionOverview } from "../components/StudentDecisionOverview";
import { useAdvisorData } from "../data/AdvisorDataContext";

const PENDING_NOTE = "待项目负责人人工审核，仅用于本地预览，未经公开批准。";

const pageNav = [
  ["overview", "概况"],
  ["decision", "决策速览"],
  ["questions", "科学问题"],
  ["methods", "方法路线"],
  ["undergraduate", "本科准备"],
  ["growth", "成长路径"],
  ["evidence", "证据"],
] as const;

type SectionId = (typeof pageNav)[number][0];

type ExpandableSection = "questions" | "methods" | "undergraduate" | "growth" | "evidence";

const EXPANDABLE = new Set<string>([
  "questions",
  "methods",
  "undergraduate",
  "growth",
  "evidence",
]);

function CollapsibleBlock({
  title,
  children,
  open,
  onOpenChange,
}: {
  title: string;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className={`collapsible-block${open ? " is-open" : ""}`}>
      <button
        className="collapsible-block__toggle"
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span>{title}</span>
        <span aria-hidden="true">{open ? "收起 ▲" : "展开 ▼"}</span>
      </button>
      {open ? <div className="collapsible-block__body">{children}</div> : null}
    </div>
  );
}

export function AdvisorDetailPage() {
  const { id } = useParams();
  const { snapshot, loading, error } = useAdvisorData();
  const advisor = snapshot?.advisors.find((item) => item.id === id);
  const dtoMode = snapshot?.mode === "dto";
  const reviewMode = snapshot?.mode === "review";
  const pendingReview = advisor?.publicationStatus === "review_pending";

  const [openSections, setOpenSections] = useState<Record<ExpandableSection, boolean>>({
    questions: false,
    methods: false,
    undergraduate: false,
    growth: false,
    evidence: false,
  });
  const [plainOpen, setPlainOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setOpenSections({
      questions: false,
      methods: false,
      undergraduate: false,
      growth: false,
      evidence: false,
    });
    setPlainOpen(false);
    setActiveSection("overview");
    setPendingScroll(null);
  }, [id]);

  useEffect(() => {
    if (!pendingScroll) return;
    const target = document.getElementById(pendingScroll);
    if (!target) return;
    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof target.focus === "function") {
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }
      setPendingScroll(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pendingScroll, openSections]);

  function expandSection(section: ExpandableSection) {
    setOpenSections((current) => (current[section] ? current : { ...current, [section]: true }));
  }

  function goToSection(section: SectionId) {
    setActiveSection(section);
    if (EXPANDABLE.has(section)) {
      expandSection(section as ExpandableSection);
    }
    setPendingScroll(section);
  }

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, section: SectionId) {
    event.preventDefault();
    goToSection(section);
  }

  function locateEvidence(evidenceId: string) {
    expandSection("evidence");
    setActiveSection("evidence");
    setPendingScroll(evidenceAnchorId(evidenceId));
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState title="数据安全门已关闭" description={error} />;
  if (!advisor) {
    return (
      <ErrorState
        title="此导师资料不可用"
        description="该ID不存在，或记录没有通过当前发布门禁。为避免泄露，页面不会区分具体原因。"
      />
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-toolbar">
        <Link to="/advisors">← 返回导师一览</Link>
        <span className="mode-badge">
          {dtoMode
            ? "安全公开 DTO"
            : reviewMode
              ? "本地审核预览"
              : "本地合成数据"}
        </span>
      </div>

      {pendingReview && (
        <aside className="boundary-note pending-review-note" aria-label="待审核状态说明">
          <span className="pending-badge">{PENDING_NOTE.split("，")[0]}</span>
          {advisor.dataStatusNote ?? PENDING_NOTE}
        </aside>
      )}

      <header className="profile-header">
        <div className="profile-header__main">
          <span className="avatar avatar--large" aria-hidden="true">
            {advisor.name.slice(0, 1)}
          </span>
          <div>
            <span className="eyebrow">公开结构化证据</span>
            <div className="profile-title-row">
              <h1>{advisor.name}</h1>
              {pendingReview && <span className="pending-badge">{PENDING_NOTE.split("，")[0]}</span>}
            </div>
            {advisor.nameEn && (
              <p className="profile-name-en" lang="en">
                {advisor.nameEn}
              </p>
            )}
            <p className="profile-summary">{advisor.summary}</p>
          </div>
        </div>
        <dl className="profile-facts">
          <div>
            <dt>机构</dt>
            <dd>{advisor.institution}</dd>
          </div>
          <div>
            <dt>院系</dt>
            <dd>{advisor.department}</dd>
          </div>
          <div>
            <dt>职位</dt>
            <dd>{advisor.position ?? "暂无公开信息"}</dd>
          </div>
          <div>
            <dt>导师身份</dt>
            <dd>{advisor.publicRoles.join("、") || "暂无公开信息"}</dd>
          </div>
          <div>
            <dt>记录状态</dt>
            <dd>
              {pendingReview
                ? "待项目负责人人工审核，仅用于本地预览"
                : advisor.publicationStatus === "published"
                  ? "已发布"
                  : "已审核"}
            </dd>
          </div>
          <div>
            <dt>更新时间</dt>
            <dd>{advisor.updatedAt}</dd>
          </div>
        </dl>
      </header>

      <nav className="detail-page-nav" aria-label="页面目录">
        {pageNav.map(([target, label]) => (
          <a
            href={`#${target}`}
            key={target}
            className={activeSection === target ? "is-active" : undefined}
            onClick={(event) => handleNavClick(event, target)}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="detail-layout">
        <div className="detail-content">
          <section className="content-section overview-section" id="overview">
            <span className="section-number">01</span>
            <div>
              <span className="eyebrow">概况</span>
              <h2>一分钟研究概览</h2>
              <div className="tag-list">
                {advisor.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="direction-grid">
                {advisor.researchDirections.map((direction) => (
                  <article key={direction.text}>
                    <p>{direction.text}</p>
                  </article>
                ))}
              </div>
              {advisor.researchDirectionsPlain.length > 0 && (
                <CollapsibleBlock
                  title="术语通俗解释"
                  open={plainOpen}
                  onOpenChange={setPlainOpen}
                >
                  <div className="plain-direction-list">
                    {advisor.researchDirectionsPlain.map((direction) => (
                      <article key={direction.term}>
                        <h4>{direction.term}</h4>
                        <p>{direction.explanation}</p>
                        <small>{direction.undergraduateMeaning}</small>
                      </article>
                    ))}
                  </div>
                </CollapsibleBlock>
              )}
            </div>
          </section>

          <StudentDecisionOverview advisor={advisor} />

          <section className="content-section" id="questions">
            <span className="section-number">03</span>
            <div>
              <span className="eyebrow">科学问题</span>
              <h2>主要科学问题</h2>
              <CollapsibleBlock
                title="科学问题列表"
                open={openSections.questions}
                onOpenChange={(open) => setOpenSections((current) => ({ ...current, questions: open }))}
              >
                <ol className="question-list">
                  {advisor.researchQuestions.map((question) => (
                    <li key={question.text}>
                      <p>{question.text}</p>
                      <EvidenceRefs evidenceIds={question.evidenceIds} onLocate={locateEvidence} />
                    </li>
                  ))}
                </ol>
              </CollapsibleBlock>
            </div>
          </section>

          <section className="content-section" id="methods">
            <span className="section-number">04</span>
            <div>
              <span className="eyebrow">方法路线</span>
              <h2>研究方法与技术路线</h2>
              <CollapsibleBlock
                title="方法与技术路线"
                open={openSections.methods}
                onOpenChange={(open) => setOpenSections((current) => ({ ...current, methods: open }))}
              >
                {advisor.techniques.length ? (
                  <div className="method-grid">
                    {advisor.techniques.map((method, index) => (
                      <article key={method.text}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <h3>{method.text}</h3>
                        <EvidenceRefs evidenceIds={method.evidenceIds} onLocate={locateEvidence} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="暂无可靠公开证据" description="当前结构化记录没有足够信息描述技术路线。" />
                )}
                {advisor.researchWorkflow.length > 0 && (
                  <div className="workflow-list">
                    <h3>公开研究流程</h3>
                    {advisor.researchWorkflow.map((step, index) => (
                      <article key={step.text}>
                        <strong>{String(index + 1).padStart(2, "0")}</strong>
                        <p>{step.text}</p>
                        <EvidenceRefs evidenceIds={step.evidenceIds} onLocate={locateEvidence} />
                      </article>
                    ))}
                  </div>
                )}
              </CollapsibleBlock>
            </div>
          </section>

          <section className="content-section" id="undergraduate">
            <span className="section-number">05</span>
            <div>
              <span className="eyebrow">本科准备</span>
              <h2>本科阶段可能的公开研究场景</h2>
              <CollapsibleBlock
                title="本科准备与学习成本"
                open={openSections.undergraduate}
                onOpenChange={(open) =>
                  setOpenSections((current) => ({ ...current, undergraduate: open }))
                }
              >
                <p className="section-intro">
                  以下内容只描述由公开 Evidence 支持的可能学习场景，不表示现实课题、名额、指导方式或时间承诺。
                </p>
                <div className="scenario-list">
                  {advisor.undergraduateScenarios.map((scenario) => (
                    <article key={scenario.task}>
                      <h3>{scenario.task}</h3>
                      <p>{scenario.context}</p>
                      <dl>
                        <div>
                          <dt>目的</dt>
                          <dd>{scenario.purpose}</dd>
                        </div>
                        <div>
                          <dt>可能方法</dt>
                          <dd>{scenario.methods.join("、")}</dd>
                        </div>
                        <div>
                          <dt>可能产出</dt>
                          <dd>{scenario.output}</dd>
                        </div>
                      </dl>
                      <p className="boundary-note">{scenario.uncertaintyNote}</p>
                      <EvidenceRefs evidenceIds={scenario.evidenceIds} onLocate={locateEvidence} />
                    </article>
                  ))}
                </div>
                <h3>联系前可准备</h3>
                <ul className="check-list">
                  {advisor.prerequisiteSkills.map((item) => (
                    <li key={item.text}>
                      {item.text}
                      <EvidenceRefs evidenceIds={item.evidenceIds} onLocate={locateEvidence} />
                    </li>
                  ))}
                </ul>
                <div className="learning-cost">
                  <h3>学习成本提示</h3>
                  <p>{advisor.learningCost.text}</p>
                  <EvidenceRefs evidenceIds={advisor.learningCost.evidenceIds} onLocate={locateEvidence} />
                </div>
              </CollapsibleBlock>
            </div>
          </section>

          <section className="content-section" id="growth">
            <span className="section-number">06</span>
            <div>
              <span className="eyebrow">成长路径</span>
              <h2>通用成长路径</h2>
              <CollapsibleBlock
                title="成长路径详情"
                open={openSections.growth}
                onOpenChange={(open) => setOpenSections((current) => ({ ...current, growth: open }))}
              >
                <div className="timeline">
                  {advisor.growthPath.map((stage) => (
                    <article key={`${stage.stage}-${stage.period ?? "open"}`}>
                      {stage.period && <span>{stage.period}</span>}
                      <h3>{stage.stage}</h3>
                      <p>{stage.possibleActivities.join("；")}</p>
                      <small>
                        可能产出：{stage.possibleOutputs.join("、")}。{stage.uncertaintyNote}
                      </small>
                      <EvidenceRefs evidenceIds={stage.evidenceIds} onLocate={locateEvidence} />
                    </article>
                  ))}
                </div>
              </CollapsibleBlock>
            </div>
          </section>

          <section className="content-section" id="evidence">
            <span className="section-number">07</span>
            <div>
              <span className="eyebrow">证据</span>
              <h2>公开 Evidence</h2>
              {advisor.publicEvidence.length === 0 ? (
                <EmptyState title="暂无可靠公开证据" description="当前记录没有可关联的公开 Evidence，页面不会补写或猜测。" />
              ) : (
                <CollapsibleBlock
                  title={`完整证据（${advisor.publicEvidence.length}）`}
                  open={openSections.evidence}
                  onOpenChange={(open) => setOpenSections((current) => ({ ...current, evidence: open }))}
                >
                  <div className="evidence-list">
                    {advisor.publicEvidence.map((item) => (
                      <article id={evidenceAnchorId(item.evidenceId)} tabIndex={-1} key={item.evidenceId}>
                        <div className="evidence-list__meta">
                          <strong>{item.evidenceId}</strong>
                          {item.year && <span>{item.year}</span>}
                        </div>
                        <h3>{item.title}</h3>
                        {item.journal && <p>{item.journal}</p>}
                        {item.doi && (
                          <a className="doi-link" href={`https://doi.org/${item.doi}`} target="_blank" rel="noreferrer">
                            DOI：{item.doi}
                          </a>
                        )}
                        {item.sourceUrl ? (
                          <a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
                            打开正式公开来源 ↗
                          </a>
                        ) : (
                          <span className="muted-copy">合成记录没有外部来源</span>
                        )}
                      </article>
                    ))}
                  </div>
                </CollapsibleBlock>
              )}
            </div>
          </section>

          <PublicInfoBoundary />

          <section className="boundary-section" id="boundary">
            <span className="eyebrow">使用边界</span>
            <h2>使用边界</h2>
            <blockquote>{advisor.boundaryStatement}</blockquote>
            <p>任何现实动态信息均为“待核验”；请通过正式公开渠道和线下沟通确认。</p>
          </section>
        </div>
      </div>
    </div>
  );
}
