import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState, LoadingState } from "../components/PageState";
import { useAdvisorData } from "../data/AdvisorDataContext";
import { filterAndSortAdvisors, getTagCounts } from "../data/advisorData";
import type { PublicAdvisor } from "../types/advisor";

const TAG_PREVIEW_COUNT = 8;
const PENDING_LABEL = "待项目负责人人工审核";

function truncate(text: string, max: number) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

function AdvisorCard({ advisor, index }: { advisor: PublicAdvisor; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const pending = advisor.publicationStatus === "review_pending";
  const coreTheme = advisor.researchDirections[0]?.text ?? "暂无可靠公开证据";
  const methods = advisor.techniques.length
    ? advisor.techniques.slice(0, 2).map((item) => item.text).join("；")
    : "暂无可靠公开证据";
  const undergrad = advisor.undergraduateScenarios[0]?.task ?? "暂无可靠公开证据";

  return (
    <article className={`advisor-card${expanded ? " is-expanded" : " is-compact"}`}>
      <div className="advisor-card__top">
        <div className="advisor-card__identity">
          <span className="avatar" aria-hidden="true">{advisor.name.slice(0, 1)}</span>
          <div>
            <div className="advisor-card__title-row">
              <h3>{advisor.name}</h3>
              {pending && (
                <span className="pending-badge" aria-label={PENDING_LABEL}>
                  {PENDING_LABEL}
                </span>
              )}
            </div>
            <p className="advisor-card__meta">
              {[advisor.position, advisor.department].filter(Boolean).join(" · ") || "院系信息待核验"}
              {advisor.publicRoles.length ? ` · ${advisor.publicRoles.join(" / ")}` : ""}
            </p>
            {advisor.nameEn && <p className="advisor-card__name-en" lang="en">{advisor.nameEn}</p>}
          </div>
        </div>
        <span className="advisor-card__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="advisor-card__decision">
        <div>
          <span>核心研究主题</span>
          <p>{expanded ? coreTheme : truncate(coreTheme, 72)}</p>
        </div>
        <div>
          <span>主要方法</span>
          <p>{expanded ? methods : truncate(methods, 56)}</p>
        </div>
        <div>
          <span>本科生可能切入点</span>
          <p>{expanded ? undergrad : truncate(undergrad, 40)}</p>
        </div>
      </div>

      {expanded && (
        <div className="advisor-card__summary">
          <span>公开摘要</span>
          <p>{advisor.summary}</p>
          <div className="advisor-card__keywords" aria-label={`${advisor.name}的关键词`}>
            {advisor.tags.slice(0, 5).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      )}

      <div className="advisor-card__footer">
        <button
          className="text-button"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "收起摘要" : "展开摘要"}
        </button>
        <Link to={`/advisor/${advisor.id}`} aria-label={`查看${advisor.name}的公开证据详情`}>
          查看详情 <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

export function AdvisorListPage() {
  const { snapshot, loading, error } = useAdvisorData();
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"name" | "updated">("name");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const advisors = snapshot?.advisors ?? [];
  const dtoMode = snapshot?.mode === "dto";
  const reviewMode = snapshot?.mode === "review";
  const tagCounts = useMemo(() => getTagCounts(advisors), [advisors]);
  const visibleTags = tagsExpanded ? tagCounts : tagCounts.slice(0, TAG_PREVIEW_COUNT);
  const filtered = useMemo(
    () => filterAndSortAdvisors(advisors, { query, tags: selectedTags, sort }),
    [advisors, query, selectedTags, sort],
  );
  const hasFilters = Boolean(query.trim() || selectedTags.length || sort !== "name");

  function resetFilters() {
    setQuery("");
    setSelectedTags([]);
    setSort("name");
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState title="数据安全门已关闭" description={error} />;

  return (
    <div className="list-page">
      <section className="hero hero--directory">
        <div className="hero__copy">
          <span className="eyebrow">导师与研究方向信息库</span>
          <h1>
            导师与研究方向
            <wbr />
            信息库
          </h1>
          <p>
            {dtoMode
              ? "浏览已通过公开门禁的导师结构化资料，了解研究方向、方法与本科生可参考的公开场景。"
              : reviewMode
                ? "本地审核预览：可查看白名单内导师资料。待审核记录仅供项目负责人预览，未经公开批准。"
                : "用结构化公开证据理解研究问题、技术路线与不确定性。本地演示仅使用合成数据。"}
          </p>
          <p className="hero__count" aria-live="polite">
            当前可见 <strong>{advisors.length}</strong>
            {dtoMode ? " 位公开导师" : reviewMode ? " 位本地审核导师" : " 条合成记录"}
          </p>
        </div>
      </section>

      <section className="directory" aria-labelledby="directory-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ADVISOR DIRECTORY</span>
            <h2 id="directory-title">导师一览</h2>
          </div>
          <p className="result-count" aria-live="polite">
            <strong>{filtered.length}</strong> 个匹配结果
          </p>
        </div>

        <label className="search-field">
          <span className="search-field__icon" aria-hidden="true">⌕</span>
          <span className="sr-only">搜索导师姓名、机构、身份、方向或技术</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索姓名、机构、导师身份、研究方向或技术"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">
              ×
            </button>
          )}
        </label>

        <div className={`filter-panel${filtersOpen ? " is-open" : ""}`}>
          <button
            className="filter-panel__toggle"
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="advisor-filter-panel"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <span>筛选与排序</span>
            <span className="filter-panel__toggle-meta">
              <small>{selectedTags.length ? `已选 ${selectedTags.length} 个方向` : "可组合筛选"}</small>
              <span className="filter-panel__chevron" aria-hidden="true">
                {filtersOpen ? "▲" : "▼"}
              </span>
            </span>
          </button>
          <div className="filter-panel__content" id="advisor-filter-panel" hidden={!filtersOpen}>
            <fieldset>
              <legend>
                研究方向 <small>同类标签为 OR，与搜索为 AND</small>
              </legend>
              <div className="choice-row choice-row--tags">
                {visibleTags.map(([tag, count]) => (
                  <button
                    type="button"
                    aria-pressed={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                    key={tag}
                  >
                    {tag}
                    <span>{count}</span>
                  </button>
                ))}
              </div>
              {tagCounts.length > TAG_PREVIEW_COUNT && (
                <button
                  className="text-button tag-expand-button"
                  type="button"
                  aria-expanded={tagsExpanded}
                  onClick={() => setTagsExpanded((value) => !value)}
                >
                  {tagsExpanded ? "收起研究方向" : `展开全部（${tagCounts.length}）`}
                </button>
              )}
            </fieldset>
            <label className="sort-field">
              <span>排序</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as "name" | "updated")}>
                <option value="name">按姓名</option>
                <option value="updated">按最近更新</option>
              </select>
            </label>
            {hasFilters && (
              <button className="text-button" type="button" onClick={resetFilters}>
                清除全部条件
              </button>
            )}
          </div>
        </div>

        {filtered.length ? (
          <div className="card-grid">
            {filtered.map((advisor, index) => (
              <AdvisorCard advisor={advisor} index={index} key={advisor.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              advisors.length
                ? dtoMode || reviewMode
                  ? "没有匹配的导师资料"
                  : "没有匹配的合成记录"
                : dtoMode
                  ? "当前暂无获准公开的导师资料"
                  : reviewMode
                    ? "本地审核暂无可预览资料"
                    : "暂无可公开记录"
            }
            description={
              advisors.length
                ? "请调整关键词或方向标签；门禁规则不会因搜索而放宽。"
                : dtoMode
                  ? "正式数据模式运行正常；当前安全 DTO 中没有获准公开记录，也不会回退到合成数据。"
                  : reviewMode
                    ? "本地审核数据未通过契约校验；页面不会回退到 mock 或正式 DTO。"
                    : "当前没有记录同时满足发布状态与发布资格。"
            }
            action={hasFilters ? <button className="button" type="button" onClick={resetFilters}>清除筛选</button> : undefined}
          />
        )}
      </section>
    </div>
  );
}
