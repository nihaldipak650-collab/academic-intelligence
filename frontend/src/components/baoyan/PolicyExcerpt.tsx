interface PolicyExcerptProps {
  sectionTitle?: string;
  documentCitation: string;
  publisher: string;
  originalText: string;
  highlightedText?: string;
  pending?: boolean;
}

function renderHighlightedText(text: string, highlight?: string) {
  if (!highlight || !text.includes(highlight)) {
    return text;
  }
  const parts = text.split(highlight);
  return parts.flatMap((part, index) => {
    if (index === 0) return [part];
    return [<mark key={`hl-${index}`}>{highlight}</mark>, part];
  });
}

export function PolicyExcerpt({
  sectionTitle,
  documentCitation,
  publisher,
  originalText,
  highlightedText,
  pending,
}: PolicyExcerptProps) {
  return (
    <div className="baoyan-policy-excerpt">
      <p className="baoyan-policy-excerpt-label">官方原文</p>
      {sectionTitle && <p className="baoyan-policy-excerpt-section">{sectionTitle}</p>}
      <p className="baoyan-policy-excerpt-doc">{documentCitation}</p>
      {pending ? (
        <p className="baoyan-policy-excerpt-pending">原文条款待补录</p>
      ) : (
        <blockquote className="baoyan-policy-excerpt-quote">
          {renderHighlightedText(originalText, highlightedText)}
        </blockquote>
      )}
      <p className="baoyan-policy-excerpt-publisher">
        来源 <span aria-hidden="true">·</span> {publisher}
      </p>
    </div>
  );
}
