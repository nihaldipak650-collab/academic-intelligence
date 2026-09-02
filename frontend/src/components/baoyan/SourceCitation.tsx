import type { OfficialSource } from "../../data/baoyanMockData";
import { BaoyanLocalPdfLinks } from "./BaoyanLocalPdfLinks";

interface SourceCitationProps {
  source: OfficialSource;
}

export function SourceCitation({ source }: SourceCitationProps) {
  const label = source.citationShort ?? source.title;

  return (
    <footer className="baoyan-source-citation">
      <p className="baoyan-source-citation-label">来源</p>
      <p className="baoyan-source-citation-title">{label}</p>
      <div className="baoyan-source-citation-actions">
        {source.url && (
          <a
            className="baoyan-source-link"
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            官方地址 ↗
          </a>
        )}
        {source.localPdfPath && (
          <BaoyanLocalPdfLinks localPdfPath={source.localPdfPath} />
        )}
      </div>
    </footer>
  );
}
