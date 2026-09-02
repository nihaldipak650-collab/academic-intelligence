import type { OfficialSource } from "../../data/baoyanMockData";
import { SourceBadge } from "./SourceBadge";

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  sources: OfficialSource[];
  question: string;
  evidenceSummary: string;
}

export function EvidenceDrawer({
  open,
  onClose,
  sources,
  question,
  evidenceSummary,
}: EvidenceDrawerProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="baoyan-drawer-backdrop"
        aria-label="关闭证据面板"
        onClick={onClose}
      />
      <aside className="baoyan-drawer" role="dialog" aria-modal="true" aria-label="官方依据">
        <div className="baoyan-drawer-header">
          <div>
            <p className="baoyan-drawer-eyebrow">官方依据</p>
            <h3 className="baoyan-drawer-title">{question}</h3>
          </div>
          <button type="button" className="baoyan-drawer-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="baoyan-drawer-body">
          {sources.length === 0 ? (
            <p className="baoyan-drawer-empty">暂无已登记的官方来源。</p>
          ) : (
            <>
              <section className="baoyan-drawer-summary">
                <p className="baoyan-drawer-summary-lead">与这个问题直接相关的内容是：</p>
                <p className="baoyan-drawer-summary-text">{evidenceSummary}</p>
              </section>

              {sources.map((source) => (
                <article key={source.id} className="baoyan-evidence-card">
                  <SourceBadge label="官方政策" />
                  <h4 className="baoyan-evidence-title">{source.title}</h4>

                  {source.overviewBullets && source.overviewBullets.length > 0 && (
                    <div className="baoyan-evidence-overview">
                      <p className="baoyan-evidence-overview-label">这份文件还讲了什么</p>
                      <ul>
                        {source.overviewBullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <dl className="baoyan-evidence-meta">
                    <div>
                      <dt>发布单位</dt>
                      <dd>{source.publisher}</dd>
                    </div>
                    <div>
                      <dt>适用届别</dt>
                      <dd>{source.cohort}</dd>
                    </div>
                    {source.publishedDate && (
                      <div>
                        <dt>发布日期</dt>
                        <dd>{source.publishedDate}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="baoyan-evidence-actions">
                    {source.url && (
                      <a
                        className="baoyan-evidence-link"
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        查看官方原文 ↗
                      </a>
                    )}
                    {source.localPdfPath && (
                      <a
                        className="baoyan-evidence-link baoyan-evidence-link--pdf"
                        href={source.localPdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        查看本地 PDF
                      </a>
                    )}
                    {!source.url && !source.localPdfPath && (
                      <p className="baoyan-evidence-note">该文件暂无公开链接或本地副本。</p>
                    )}
                  </div>
                </article>
              ))}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
