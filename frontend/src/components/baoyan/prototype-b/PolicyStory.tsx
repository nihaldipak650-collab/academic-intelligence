import type { QuestionAnswer } from "../../../data/baoyanMockData";
import type { SourceRegistry } from "./sourceRegistry";
import { FootnoteRef } from "./SourceFootnotes";

interface PolicyStoryProps {
  item: QuestionAnswer;
  registry: SourceRegistry;
  marginLabel?: string;
}

const STATUS_LABEL: Record<string, string> = {
  VERIFIED: "官方政策",
  PARTIAL: "官方政策 · 部分待确认",
  EXPERIENCE: "经验建议",
  PENDING: "待补充",
  UNRESOLVED: "档案缺口",
};

export function PolicyStory({ item, registry, marginLabel }: PolicyStoryProps) {
  const label = marginLabel ?? STATUS_LABEL[item.answerStatus] ?? item.userSourceLabel;

  return (
    <article className="ed-policy-story">
      <div className="ed-policy-body">
        <h3 className="ed-policy-question serif">{item.question}</h3>
        <p className="ed-policy-lead serif">{item.shortAnswer}</p>
        <p className="ed-policy-detail">
          {item.detail}
          <FootnoteRef sourceIds={item.sourceIds} registry={registry} />
        </p>
        {item.cautions && item.cautions.length > 0 && (
          <aside className="ed-policy-caution">
            {item.cautions.map((c) => (
              <p key={c}>{c}</p>
            ))}
          </aside>
        )}
      </div>
      <aside className="ed-policy-margin" aria-label="来源标注">
        <span className="ed-margin-label">{label}</span>
        {item.sourceIds.length > 0 && (
          <span className="ed-margin-cohort">
            {registry.get(item.sourceIds[0])?.source.cohort ?? "—"}
          </span>
        )}
      </aside>
    </article>
  );
}
