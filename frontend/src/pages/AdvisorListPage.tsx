import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { EvidenceRefs } from "../components/EvidenceRefs";
import { ErrorState, LoadingState } from "../components/PageState";
import { useAdvisorData } from "../data/AdvisorDataContext";
import { filterAndSortAdvisors, getTagCounts } from "../data/advisorData";

export function AdvisorListPage() {
  const { snapshot, loading, error } = useAdvisorData();
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"name" | "updated">("name");
  const advisors = snapshot?.advisors ?? [];
  const dtoMode = snapshot?.mode === "dto";
  const stagingMode = snapshot?.mode === "staging";
  const tagCounts = useMemo(() => getTagCounts(advisors), [advisors]);
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
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">FRONTEND NEXT · {dtoMode ? "SAFE DTO" : stagingMode ? "LOCAL STAGING" : "LOCAL MOCK"}</span>
          <h1>先理解研究，再准备一次有依据的联系。</h1>
          <p>{dtoMode ? "仅从经过发布门禁和构建扫描的安全导师 DTO 中读取公开字段。" : stagingMode ? "六位经过生产验收的导师资料仅用于本机逐页审核，尚未获得正式公开批准。" : "用结构化证据理解研究问题、技术路线与不确定性。本地候选版仅使用完全合成的数据。"}</p>
          <div className="hero__stats" aria-label="演示概况">
            <div><strong>{advisors.length}</strong><span>{dtoMode ? "位获准公开导师" : stagingMode ? "位本地预发布导师" : "条通过门禁的合成记录"}</span></div>
            <div><strong>2×</strong><span>发布状态与资格双重校验</span></div>
            <div><strong>{dtoMode ? "DTO" : "0"}</strong><span>{dtoMode ? "只显示安全导出记录" : stagingMode ? "位导师获得正式公开批准" : "真实导师资料进入本构建"}</span></div>
          </div>
        </div>
        <aside className="hero__note" aria-label="使用说明">
          <span>{dtoMode ? "SAFE / DTO" : stagingMode ? "LOCAL / STAGING" : "LOCAL / MOCK"}</span>
          <h2>{dtoMode ? "未获批准的导师保持不可见。" : stagingMode ? "本地预发布验证，尚未正式上线。" : "这是交互候选，不是线上目录。"}</h2>
          <p>未通过门禁、字段缺失、Evidence 断链或结构解析失败的记录不会进入列表、搜索、计数或详情。</p>
        </aside>
      </section>

      <section className="directory" aria-labelledby="directory-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ADVISOR DIRECTORY</span>
            <h2 id="directory-title">{dtoMode ? "导师目录" : stagingMode ? "导师目录（本地预发布）" : "导师目录演示"}</h2>
          </div>
          <p className="result-count" aria-live="polite"><strong>{filtered.length}</strong> 个匹配结果</p>
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
          {query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">×</button>}
        </label>

        <details className="filter-panel" open>
          <summary>
            <span>筛选与排序</span>
            <small>{selectedTags.length ? `已选 ${selectedTags.length} 个方向` : "可组合筛选"}</small>
          </summary>
          <div className="filter-panel__content">
            <fieldset>
              <legend>研究方向 <small>同类标签为 OR，与搜索为 AND</small></legend>
              <div className="choice-row choice-row--tags">
                {tagCounts.map(([tag, count]) => (
                  <button type="button" aria-pressed={selectedTags.includes(tag)} onClick={() => toggleTag(tag)} key={tag}>
                    {tag}<span>{count}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="sort-field">
              <span>排序</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as "name" | "updated")}>
                <option value="name">按姓名</option>
                <option value="updated">按最近更新</option>
              </select>
            </label>
            {hasFilters && <button className="text-button" type="button" onClick={resetFilters}>清除全部条件</button>}
          </div>
        </details>

        {filtered.length ? (
          <div className="card-grid">
            {filtered.map((advisor, index) => (
              <article className="advisor-card" key={advisor.id}>
                <div className="advisor-card__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
                <div className="advisor-card__identity">
                  <span className="avatar" aria-hidden="true">{advisor.name.slice(0, 1)}</span>
                  <div>
                    <span className="advisor-type">{advisor.publicRoles.join(" · ") || "暂无公开导师身份"}</span>
                    <h3>{advisor.name}</h3>
                    {advisor.nameEn && <p lang="en">{advisor.nameEn}</p>}
                  </div>
                </div>
                <p className="advisor-card__meta">{advisor.department}{advisor.position ? ` · ${advisor.position}` : ""}</p>
                <div className="advisor-card__decision">
                  <div>
                    <span>核心研究主题</span>
                    <p>{advisor.researchDirections[0]?.text ?? "暂无可靠公开证据"}</p>
                    {advisor.researchDirections[0] && <EvidenceRefs evidenceIds={advisor.researchDirections[0].evidenceIds} />}
                  </div>
                  <div>
                    <span>主要方法</span>
                    <p>{advisor.techniques.length ? advisor.techniques.slice(0, 2).map((item) => item.text).join("；") : "暂无可靠公开证据"}</p>
                    {advisor.techniques.length > 0 && <EvidenceRefs evidenceIds={[...new Set(advisor.techniques.slice(0, 2).flatMap((item) => item.evidenceIds))]} />}
                  </div>
                  <div>
                    <span>本科生可能切入点</span>
                    <p>{advisor.undergraduateScenarios[0]?.task ?? "暂无可靠公开证据"}</p>
                    {advisor.undergraduateScenarios[0] && <EvidenceRefs evidenceIds={advisor.undergraduateScenarios[0].evidenceIds} />}
                  </div>
                </div>
                <div className="advisor-card__keywords" aria-label={`${advisor.name}的建议准备或关键词`}>
                  {[...advisor.prerequisiteSkills.map((item) => item.text), ...advisor.searchKeywords]
                    .filter((item, itemIndex, items) => items.indexOf(item) === itemIndex)
                    .slice(0, 3)
                    .map((item) => <span key={item}>{item}</span>)}
                </div>
                <div className="advisor-card__footer">
                  <span>更新于 {advisor.updatedAt}</span>
                  <Link to={`/advisor/${advisor.id}`} aria-label={`查看${advisor.name}的公开证据详情`}>
                    查看证据详情 <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title={advisors.length ? (dtoMode || stagingMode ? "没有匹配的导师资料" : "没有匹配的合成记录") : (dtoMode ? "当前暂无获准公开的导师资料" : stagingMode ? "本地 staging 暂无可审核资料" : "暂无可公开记录")}
            description={advisors.length ? "请调整关键词或方向标签；门禁规则不会因搜索而放宽。" : (dtoMode ? "正式数据模式运行正常；当前安全 DTO 中没有获准公开记录，也不会回退到合成数据。" : stagingMode ? "本地预发布数据未通过独立 staging 契约；页面不会回退到 mock 或正式 DTO。" : "当前没有记录同时满足发布状态与发布资格。")}
            action={hasFilters ? <button className="button" type="button" onClick={resetFilters}>清除筛选</button> : undefined}
          />
        )}
      </section>
    </div>
  );
}
