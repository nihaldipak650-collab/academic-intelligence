import type { YearRecord } from "../../../data/baoyanMockData";
import type { SourceRegistry } from "./sourceRegistry";
import { FootnoteRef } from "./SourceFootnotes";

interface YearChronicleProps {
  years: YearRecord[];
  registry: SourceRegistry;
}

export function YearChronicle({ years, registry }: YearChronicleProps) {
  return (
    <div className="ed-chronicle" role="list">
      {years.map((year) => (
        <article
          key={year.cohort}
          className={`ed-chronicle-item ed-chronicle-item--${year.status}`}
          role="listitem"
        >
          <div className="ed-chronicle-year serif">{year.year}</div>
          <div className="ed-chronicle-content">
            {year.status === "unresolved" ? (
              <>
                <p className="ed-chronicle-gap">公开档案暂未定位</p>
                <p className="ed-chronicle-note">{year.notes}</p>
              </>
            ) : (
              <>
                {year.ordinaryQuota && (
                  <p className="ed-chronicle-fact">
                    {year.ordinaryQuota.bioScience != null && (
                      <span>生科普通 {year.ordinaryQuota.bioScience}</span>
                    )}
                    {year.ordinaryQuota.bioinformatics != null && (
                      <span>
                        {year.ordinaryQuota.bioScience != null ? " · " : ""}
                        生信普通 {year.ordinaryQuota.bioinformatics}
                      </span>
                    )}
                  </p>
                )}
                {year.otherQuota && (
                  <p className="ed-chronicle-fact ed-chronicle-fact--muted">
                    {Object.entries(year.otherQuota).map(([k, v]) => (
                      <span key={k}>
                        {k === "school_increment" && `+${v} 增补`}
                        {k === "engineering_master_phd" && `工程硕博 ${v}`}
                        {k === "competition" && `竞赛专项 ${v}`}
                        {k === "national_life_science_base" && `基地 ${v}`}
                      </span>
                    ))}
                  </p>
                )}
                {year.publicResultCount != null && (
                  <p className="ed-chronicle-fact">公示 {year.publicResultCount} 人</p>
                )}
                {year.execution?.bioScience?.map((line) => (
                  <p key={line} className="ed-chronicle-exec">
                    {line}
                  </p>
                ))}
                {year.execution?.bioinformatics?.map((line) => (
                  <p key={line} className="ed-chronicle-exec">
                    {line}
                  </p>
                ))}
                {year.execution?.general?.map((line) => (
                  <p key={line} className="ed-chronicle-exec">
                    {line}
                  </p>
                ))}
                {year.status === "partial" && year.year === 2026 && (
                  <p className="ed-chronicle-fact">规则已公布 · 最终执行结果待定位</p>
                )}
                {year.status === "partial" && year.year === 2021 && (
                  <p className="ed-chronicle-gap">补充公示正文待恢复</p>
                )}
                <p className="ed-chronicle-note">
                  {year.notes}
                  {year.sourceIds.length > 0 && (
                    <>
                      {" "}
                      <FootnoteRef sourceIds={year.sourceIds} registry={registry} />
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
