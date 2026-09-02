import { useState } from "react";
import type { SourceRegistry } from "./sourceRegistry";

interface FootnoteRefProps {
  sourceIds: string[];
  registry: SourceRegistry;
}

export function FootnoteRef({ sourceIds, registry }: FootnoteRefProps) {
  const refs = sourceIds
    .map((id) => registry.get(id))
    .filter(Boolean) as { index: number; source: { id: string } }[];

  if (refs.length === 0) return null;

  return (
    <sup className="ed-fn-refs">
      {refs.map((r) => (
        <a key={r.source.id} href={`#source-${r.index}`} className="ed-fn-link">
          [{String(r.index).padStart(2, "0")}]
        </a>
      ))}
    </sup>
  );
}

interface SourceFootnotesProps {
  registry: SourceRegistry;
}

export function SourceFootnotes({ registry }: SourceFootnotesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const entries = [...registry.entries()].sort((a, b) => a[1].index - b[1].index);

  if (entries.length === 0) return null;

  return (
    <footer className="ed-sources" id="sources">
      <hr className="ed-separator" />
      <h2 className="ed-sources-title serif">Sources</h2>

      <div className="ed-source-groups">
        <section>
          <h3 className="ed-source-group-title">Official sources</h3>
          <ol className="ed-source-list">
            {entries.map(([id, { index, source }]) => (
              <li key={id} id={`source-${index}`} className="ed-source-item">
                <button
                  type="button"
                  className="ed-source-trigger"
                  onClick={() => setExpandedId(expandedId === id ? null : id)}
                  aria-expanded={expandedId === id}
                >
                  <span className="ed-source-num">{String(index).padStart(2, "0")}</span>
                  <span>
                    <strong>{source.publisher}</strong>
                    <br />
                    《{source.title}》
                    <br />
                    <span className="ed-source-date">{source.publishedDate}</span>
                  </span>
                </button>
                {expandedId === id && (
                  <div className="ed-source-detail">
                    <p>适用：{source.cohort}</p>
                    {source.crystalReview && (
                      <p>Crystal 二审：{source.crystalReview}</p>
                    )}
                    <p>人工核验：{source.humanVerification}</p>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ed-source-external"
                      >
                        查看原始文件 ↗
                      </a>
                    ) : (
                      <p className="ed-source-muted">原件见交接包本地 PDF</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3 className="ed-source-group-title">Confirmed locally</h3>
          <p className="ed-source-placeholder">
            老师访谈确认内容待 9 月 4–5 日补充。当前无已签字记录。
          </p>
        </section>

        <section>
          <h3 className="ed-source-group-title">Student experience</h3>
          <p className="ed-source-placeholder">
            学长学姐访谈待补充。页面中已标注「采访待补充」处不会展示编造引语。
          </p>
        </section>

        <section>
          <h3 className="ed-source-group-title">Further reading</h3>
          <p className="ed-source-placeholder">
            公众号经验文章（麓山保研团子）已与官方证据交叉校验，见交接包
            v0.2 的 08_wechat_official_crosscheck；本页仅引用 mock 数据中已收录的指引。
          </p>
        </section>
      </div>
    </footer>
  );
}
