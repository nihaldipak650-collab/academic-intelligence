import { useState } from "react";
import type { YearRecord } from "../../data/baoyanMockData";

interface BaoyanYearHistoryProps {
  years: YearRecord[];
}

export function BaoyanYearHistory({ years }: BaoyanYearHistoryProps) {
  const [activeYear, setActiveYear] = useState(years[years.length - 1]?.year ?? 2026);
  const record = years.find((y) => y.year === activeYear);

  return (
    <section className="baoyan-yearhistory" id="section-history">
      <header className="baoyan-section-head">
        <p className="baoyan-eyebrow">历年执行</p>
        <h2 className="baoyan-section-title serif">往年保研是什么情况？</h2>
      </header>

      <div className="baoyan-year-tabs" id="history-tabs" role="tablist" aria-label="选择届别">
        {years.map((y) => (
          <button
            key={y.year}
            type="button"
            role="tab"
            aria-selected={activeYear === y.year}
            className={`baoyan-year-tab${activeYear === y.year ? " is-active" : ""}${
              y.status === "unresolved" ? " is-muted" : ""
            }`}
            onClick={() => setActiveYear(y.year)}
          >
            {y.year}
          </button>
        ))}
      </div>

      {record && (
        <div className="baoyan-year-panel" role="tabpanel">
          {record.status === "unresolved" ? (
            <div className="baoyan-year-unresolved">
              <p className="baoyan-year-unresolved-title">公开档案暂未定位</p>
              <p className="baoyan-year-unresolved-note">{record.notes}</p>
            </div>
          ) : (
            <>
              {record.ordinaryQuota && (
                <div className="baoyan-year-block" id="history-years">
                  <h3 className="baoyan-year-block-title">普通指标</h3>
                  <dl className="baoyan-year-dl">
                    {record.ordinaryQuota.bioScience != null && (
                      <div>
                        <dt>生物科学</dt>
                        <dd className="serif">{record.ordinaryQuota.bioScience}</dd>
                      </div>
                    )}
                    {record.ordinaryQuota.bioinformatics != null && (
                      <div>
                        <dt>生物信息学</dt>
                        <dd className="serif">{record.ordinaryQuota.bioinformatics}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {record.execution && (
                <div className="baoyan-year-block" id="history-execution">
                  <h3 className="baoyan-year-block-title">实际执行</h3>
                  {record.execution.bioScience && (
                    <div className="baoyan-year-exec">
                      <p className="baoyan-year-exec-label">生物科学</p>
                      <ul>
                        {record.execution.bioScience.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {record.execution.bioinformatics && (
                    <div className="baoyan-year-exec">
                      <p className="baoyan-year-exec-label">生物信息学</p>
                      <ul>
                        {record.execution.bioinformatics.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {record.execution.general && (
                    <ul className="baoyan-year-general">
                      {record.execution.general.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {record.publicResultCount != null && (
                <p className="baoyan-year-note">
                  公示人数 {record.publicResultCount} 人（含各类指标，不等于纯普通指标）
                </p>
              )}

              {record.status === "partial" && record.publicResultCount == null && (
                <p className="baoyan-year-note baoyan-year-note--warn">{record.notes}</p>
              )}

              {record.status === "resolved" && record.notes && !record.execution && (
                <p className="baoyan-year-note">{record.notes}</p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
