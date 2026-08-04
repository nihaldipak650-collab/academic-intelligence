import type { PublicAdvisor, TraceableText } from "../types/advisor";
import { EvidenceRefs } from "./EvidenceRefs";

function TraceableItems({
  items,
  onLocateEvidence,
}: {
  items: TraceableText[];
  onLocateEvidence?: (evidenceId: string) => void;
}) {
  if (!items.length) return <p className="decision-empty">暂无可靠公开证据</p>;
  return (
    <ul className="decision-list">
      {items.map((item) => (
        <li key={item.text}>
          <span>{item.text}</span>
          <EvidenceRefs evidenceIds={item.evidenceIds} onLocate={onLocateEvidence} />
        </li>
      ))}
    </ul>
  );
}

export function StudentDecisionOverview({
  advisor,
  onLocateEvidence,
}: {
  advisor: PublicAdvisor;
  onLocateEvidence?: (evidenceId: string) => void;
}) {
  const scenario = advisor.undergraduateScenarios[0];
  const evidenceIds = advisor.publicEvidence.map((item) => item.evidenceId);

  return (
    <section className="content-section decision-section" id="decision">
      <span className="section-number">02</span>
      <div>
        <span className="eyebrow">UNDERGRADUATE DECISION SNAPSHOT</span>
        <h2>本科生决策速览</h2>
        <p className="decision-lead">先看研究内容、可能的参与方式和仍需核验的边界，再决定是否进一步联系。</p>

        <div className="decision-grid">
          <article>
            <span className="decision-index">01</span>
            <h3>核心研究问题</h3>
            <TraceableItems items={advisor.researchQuestions.slice(0, 2)} onLocateEvidence={onLocateEvidence} />
          </article>

          <article>
            <span className="decision-index">02</span>
            <h3>研究工作形态</h3>
            <TraceableItems items={advisor.researchWorkflow.slice(0, 2)} onLocateEvidence={onLocateEvidence} />
          </article>

          <article>
            <span className="decision-index">03</span>
            <h3>常用技术与数据</h3>
            <TraceableItems items={advisor.techniques.slice(0, 3)} onLocateEvidence={onLocateEvidence} />
          </article>

          <article>
            <span className="decision-index">04</span>
            <h3>本科生可能切入的公开研究场景</h3>
            {scenario ? (
              <>
                <strong>{scenario.task}</strong>
                <p>{scenario.context}</p>
                <EvidenceRefs evidenceIds={scenario.evidenceIds} onLocate={onLocateEvidence} />
              </>
            ) : (
              <p className="decision-empty">暂无可靠公开证据</p>
            )}
          </article>

          <article>
            <span className="decision-index">05</span>
            <h3>建议准备</h3>
            <TraceableItems items={advisor.prerequisiteSkills.slice(0, 3)} onLocateEvidence={onLocateEvidence} />
          </article>

          <article>
            <span className="decision-index">06</span>
            <h3>公开成果与 Evidence</h3>
            {advisor.publicEvidence.length ? (
              <>
                <p>当前结构化记录关联 {advisor.publicEvidence.length} 条公开 Evidence，可跳转至原始条目复核。</p>
                <EvidenceRefs evidenceIds={evidenceIds} onLocate={onLocateEvidence} />
              </>
            ) : (
              <p className="decision-empty">暂无可靠公开证据</p>
            )}
          </article>

          <article className="decision-status-card">
            <span className="decision-index">07</span>
            <h3>官方公开项目或招生信息状态</h3>
            <dl>
              <div>
                <dt>官方招生信息</dt>
                <dd>暂无公开信息</dd>
              </div>
              <div>
                <dt>公开项目或基金</dt>
                <dd>暂无公开信息</dd>
              </div>
            </dl>
          </article>

          <article className="decision-unknown-card">
            <span className="decision-index">08</span>
            <h3>公开资料无法判断的事项</h3>
            <p>导师管理风格、实验室氛围、真实名额和毕业难度无法由当前公开资料可靠判断，建议通过正式面谈了解。</p>
          </article>
        </div>

        <p className="decision-disclaimer">
          本科生任务仅为根据公开研究内容推导的可能场景，不代表实验室真实安排、当前名额或导师承诺。
        </p>
      </div>
    </section>
  );
}
