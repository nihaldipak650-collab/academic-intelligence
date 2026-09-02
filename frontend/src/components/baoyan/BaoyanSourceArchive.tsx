import { useState } from "react";
import { BaoyanLocalPdfLinks } from "./BaoyanLocalPdfLinks";
import { OFFICIAL_SOURCES, SOURCE_ARCHIVE_GROUPS, SOURCE_AVAILABILITY_LABEL } from "../../data/baoyanMockData";

export function BaoyanSourceArchive() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(SOURCE_ARCHIVE_GROUPS.filter((g) => g.defaultOpen).map((g) => g.id)),
  );

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="baoyan-source-archive" id="section-sources" aria-labelledby="baoyan-sources-title">
      <header className="baoyan-section-head">
        <p className="baoyan-eyebrow">资料与依据</p>
        <h2 className="baoyan-section-title serif" id="baoyan-sources-title">
          这页的信息从哪里来？
        </h2>
        <p className="baoyan-source-archive-lead">
          政策、名额和历年执行情况都尽量保留原始出处，想自己核对，可以从这里继续看。
        </p>
      </header>

      <div className="baoyan-source-archive-groups">
        {SOURCE_ARCHIVE_GROUPS.map((group) => {
          const isOpen = openGroups.has(group.id);
          return (
            <div key={group.id} className="baoyan-source-archive-group">
              <button
                type="button"
                className={`baoyan-source-archive-toggle${isOpen ? " is-open" : ""}`}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
              >
                <span className="baoyan-source-archive-toggle-label">{group.label}</span>
                <span className="baoyan-source-archive-toggle-meta">{group.countLabel}</span>
              </button>

              {isOpen && (
                <div className="baoyan-source-archive-panel">
                  {group.gapNote && (
                    <p className="baoyan-source-archive-gap">{group.gapNote}</p>
                  )}
                  {group.entries.map((entry) => {
                    const source = OFFICIAL_SOURCES[entry.sourceId];
                    if (!source) return null;
                    return (
                      <article key={entry.sourceId} className="baoyan-source-archive-item">
                        <div className="baoyan-source-archive-item-head">
                          <h3 className="baoyan-source-archive-item-title">{source.title}</h3>
                          <span
                            className={`baoyan-source-availability baoyan-source-availability--${source.availability}`}
                          >
                            {SOURCE_AVAILABILITY_LABEL[source.availability]}
                          </span>
                        </div>
                        <dl className="baoyan-source-archive-meta">
                          <div>
                            <dt>发布单位</dt>
                            <dd>{source.publisher}</dd>
                          </div>
                          {source.publishedDate && (
                            <div>
                              <dt>发布日期</dt>
                              <dd>{source.publishedDate}</dd>
                            </div>
                          )}
                        </dl>
                        {entry.usageTags.length > 0 && (
                          <div className="baoyan-source-archive-usage">
                            <p className="baoyan-source-archive-usage-label">用于支持</p>
                            <ul>
                              {entry.usageTags.map((tag) => (
                                <li key={tag}>{tag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {source.archiveNote && (
                          <p className="baoyan-source-archive-note">{source.archiveNote}</p>
                        )}
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
                          {!source.url && !source.localPdfPath && (
                            <span className="baoyan-source-archive-unavailable">暂无公开链接</span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
