import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfidenceTag } from "../components/ConfidenceTag";
import { EmptyState } from "../components/EmptyState";
import { ErrorState, LoadingState } from "../components/PageState";
import { useAdvisorData } from "../data/AdvisorDataContext";
import {
  filterAdvisors,
  formatUpdatedAt,
  getTagCounts,
  versionLabel,
} from "../data/advisorData";
import type { Advisor } from "../types/advisor";

function evidenceLabel(advisor: Advisor) {
  return advisor.evidenceType === "academic_only"
    ? "仅公开学术证据"
    : "学术 + 经历证据";
}

function experienceCopy(advisor: Advisor) {
  return advisor.hasExperienceEvidence
    ? `包含 ${advisor.experienceCaseCount} 个经授权的本科生经历案例，仅代表该案例`
    : "暂无经授权的本科生经历证据";
}

export function AdvisorListPage() {
  const { advisors, loading, error } = useAdvisorData();
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const tagCounts = useMemo(() => getTagCounts(advisors), [advisors]);
  const filteredAdvisors = useMemo(
    () => filterAdvisors(advisors, query, selectedTag),
    [advisors, query, selectedTag],
  );
  const hasFilters = Boolean(query.trim() || selectedTag);

  function resetFilters() {
    setQuery("");
    setSelectedTag("");
  }

  if (loading) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState title="导师列表无法加载" description={error} />;
  }

  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <span className="hero__eyebrow">ACADEMIC INTELLIGENCE · 1.0 PREVIEW</span>
          <h1>从公开证据出发，理解导师的研究路径。</h1>
          <p>
            面向中南大学生命科学学院本科生的只读信息工具。我们呈现研究主题、
            技术路线与证据边界，不做导师评分、排名或推荐。
          </p>
          <div className="hero__meta" aria-label="资料概况">
            <span>{advisors.length} 位真实导师</span>
            <span>配置驱动</span>
            <span>人工审核报告</span>
          </div>
        </div>
        <div className="hero__index" aria-hidden="true">
          <span>AI</span>
          <strong>01</strong>
          <small>EVIDENCE DIRECTORY</small>
        </div>
      </section>

      <section className="directory" aria-labelledby="directory-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">ADVISOR DIRECTORY</span>
            <h2 id="directory-title">导师资料</h2>
          </div>
          <p aria-live="polite">{filteredAdvisors.length} 个匹配结果</p>
        </div>

        <div className="filters">
          <div className="search-row">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">搜索姓名、摘要或研究方向</span>
              <input
                type="search"
                placeholder="搜索中文名、英文名、摘要或研究标签"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {hasFilters && (
              <button className="clear-button" type="button" onClick={resetFilters}>
                清除条件
              </button>
            )}
          </div>
          <div className="filter-label">
            <span>按真实研究标签筛选</span>
            <small>可与搜索组合</small>
          </div>
          <div className="segments" aria-label="按研究方向筛选">
            <button
              type="button"
              className={!selectedTag ? "is-active" : ""}
              aria-pressed={!selectedTag}
              onClick={() => setSelectedTag("")}
            >
              全部 <span>{advisors.length}</span>
            </button>
            {tagCounts.map(([tag, count]) => (
              <button
                type="button"
                className={selectedTag === tag ? "is-active" : ""}
                aria-pressed={selectedTag === tag}
                onClick={() => setSelectedTag(tag)}
                key={tag}
              >
                {tag} <span>{count}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredAdvisors.length ? (
          <div className="card-grid">
            {filteredAdvisors.map((advisor) => (
              <article className="advisor-card" key={advisor.id}>
                <div className="advisor-card__topline">
                  <div className="avatar" aria-hidden="true">
                    {advisor.initials}
                  </div>
                  <span className="version-chip">
                    {versionLabel(advisor.version)}
                  </span>
                </div>
                <div className="advisor-card__body">
                  <p className="advisor-card__source">{evidenceLabel(advisor)}</p>
                  <h3>
                    {advisor.nameZh}
                    {advisor.nameEn && <small>{advisor.nameEn}</small>}
                  </h3>
                  <p className="advisor-card__summary">{advisor.summary}</p>
                  <div className="tag-list" aria-label="研究方向">
                    {advisor.tags.slice(0, 5).map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="advisor-card__evidence">
                  <ConfidenceTag
                    level={advisor.authorMatchConfidence}
                    note={
                      advisor.authorConfidenceSource ===
                      "legacy_academic_confidence"
                        ? "旧站来源仅提供 academic_confidence；本页保留其等级并明确标记来源，不额外推断。"
                        : undefined
                    }
                  />
                  <p className={advisor.hasExperienceEvidence ? "has-case" : ""}>
                    {experienceCopy(advisor)}
                  </p>
                  <dl>
                    <div>
                      <dt>状态</dt>
                      <dd>{advisor.status}</dd>
                    </div>
                    <div>
                      <dt>更新</dt>
                      <dd>{formatUpdatedAt(advisor.lastUpdated)}</dd>
                    </div>
                  </dl>
                </div>
                <Link className="card-link" to={`/advisor/${advisor.id}`}>
                  查看完整证据报告 <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="当前筛选条件没有匹配导师"
            description="这不是系统错误。请尝试其他关键词、方向标签，或清除全部条件。"
            action={
              <button className="button" type="button" onClick={resetFilters}>
                清除筛选
              </button>
            }
          />
        )}
      </section>

      <section className="usage-boundary" id="usage-boundary">
        <span className="section-kicker">READING BOUNDARY</span>
        <h2>把证据当作起点，不把未知写成结论。</h2>
        <p>
          公开论文不能证明导师真实指导方式、实验室氛围、反馈频率或本科生任务安排。
          单个学生经历只代表特定学生与特定时期，不推广为实验室整体事实。
        </p>
      </section>
    </>
  );
}
