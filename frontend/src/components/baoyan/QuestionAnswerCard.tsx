import { useState } from "react";
import type { QuestionAnswer } from "../../data/baoyanMockData";
import { OFFICIAL_SOURCES } from "../../data/baoyanMockData";
import { BaoyanEditorNote } from "./BaoyanEditorNote";
import { PolicyExcerpt } from "./PolicyExcerpt";
import { SourceCitation } from "./SourceCitation";

interface QuestionAnswerCardProps {
  item: QuestionAnswer;
}

function getAnswerSizeClass(answer: string): "short" | "medium" | "long" {
  const compact = answer.replace(/\s/g, "");
  if (compact.length <= 5) return "short";
  if (answer.length > 28) return "long";
  return "medium";
}

export function QuestionAnswerCard({ item }: QuestionAnswerCardProps) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const source = OFFICIAL_SOURCES[item.evidenceExcerpt.sourceId];
  const cautions = item.cautions ?? [];
  const answerSize = getAnswerSizeClass(item.shortAnswer);

  return (
    <article className="baoyan-qacard" id={item.id}>
      <h3 className="baoyan-qacard-question">{item.question}</h3>

      <div className="baoyan-qacard-block">
        <p className={`baoyan-qacard-answer serif baoyan-qacard-answer--${answerSize}`}>
          {item.shortAnswer}
        </p>
        <p className="baoyan-qacard-detail">{item.detail}</p>
      </div>

      {source && (
        <PolicyExcerpt
          sectionTitle={item.evidenceExcerpt.sectionTitle}
          documentCitation={source.citationShort ?? source.title}
          publisher={source.publisher}
          originalText={item.evidenceExcerpt.originalText}
          highlightedText={item.evidenceExcerpt.highlightedText}
          pending={item.evidenceExcerpt.pending}
        />
      )}

      {!item.evidenceExcerpt.pending && (
        <div className="baoyan-plain-language">
          <p className="baoyan-plain-language-label">一句话总结</p>
          <p className="baoyan-plain-language-text">{item.evidenceExcerpt.plainLanguage}</p>
        </div>
      )}

      {cautions.length > 0 && (
        <div className="baoyan-qacard-notes">
          <p className="baoyan-qacard-notes-label">
            <span className="baoyan-qacard-notes-icon" aria-hidden="true">
              ◦
            </span>
            提醒一下
          </p>
          <ul className="baoyan-qacard-notes-list">
            {(notesExpanded ? cautions : cautions.slice(0, 3)).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          {cautions.length > 3 && (
            <button
              type="button"
              className="baoyan-qacard-notes-toggle"
              onClick={() => setNotesExpanded((v) => !v)}
              aria-expanded={notesExpanded}
            >
              {notesExpanded ? "收起" : `还有 ${cautions.length - 3} 条`}
            </button>
          )}
        </div>
      )}

      {item.editorNote && <BaoyanEditorNote>{item.editorNote}</BaoyanEditorNote>}

      {source && <SourceCitation source={source} />}
    </article>
  );
}
