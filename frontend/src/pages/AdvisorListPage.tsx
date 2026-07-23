import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfidenceTag } from "../components/ConfidenceTag";
import { EmptyState } from "../components/EmptyState";
import { advisors, allDirections } from "../data/advisors";

export function AdvisorListPage() {
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("全部");

  const filteredAdvisors = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return advisors.filter((advisor) => {
      const matchesQuery =
        !normalizedQuery ||
        advisor.name.includes(normalizedQuery) ||
        advisor.englishName.toLocaleLowerCase().includes(normalizedQuery);
      const matchesDirection =
        direction === "全部" || advisor.directions.includes(direction);
      return matchesQuery && matchesDirection;
    });
  }, [direction, query]);

  function resetFilters() {
    setQuery("");
    setDirection("全部");
  }

  return (
    <>
      <section className="hero">
        <div className="hero__eyebrow">Advisor evidence, made readable.</div>
        <h1>
          在选择导师之前，
          <br />
          先看清公开证据。
        </h1>
        <p>
          面向生命科学学院本科生，整理导师的研究主线、技术路径、成长任务与证据边界。
        </p>
        <div className="hero__meta">
          <span>{advisors.length} 位导师样例</span>
          <span>本科生阅读视角</span>
          <span>人工复核后发布</span>
        </div>
      </section>

      <section className="directory" aria-labelledby="directory-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">DIRECTORY</span>
            <h2 id="directory-title">导师一览</h2>
          </div>
          <p>{filteredAdvisors.length} 个结果</p>
        </div>

        <div className="filters">
          <label className="search-field">
            <span className="sr-only">按导师姓名搜索</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="搜索导师姓名 / Name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="segments" aria-label="按研究方向筛选">
            {["全部", ...allDirections].map((item) => (
              <button
                className={direction === item ? "is-active" : ""}
                key={item}
                type="button"
                aria-pressed={direction === item}
                onClick={() => setDirection(item)}
              >
                {item}
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
                  <ConfidenceTag
                    level={advisor.confidence}
                    note={advisor.confidenceNote}
                  />
                </div>
                <div>
                  <h3>
                    {advisor.name}
                    <small>{advisor.englishName}</small>
                  </h3>
                  <p>{advisor.summary}</p>
                </div>
                <div className="tag-list" aria-label="研究方向">
                  {advisor.directions.slice(0, 3).map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <Link className="card-link" to={`/advisor/${advisor.id}`}>
                  查看证据画像 <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="没有找到匹配的导师"
            description="试试其他姓名，或清除当前研究方向筛选。"
            action={
              <button className="text-button" type="button" onClick={resetFilters}>
                清除筛选
              </button>
            }
          />
        )}
      </section>

      <section className="usage-boundary" id="usage-boundary">
        <span className="section-kicker">HOW TO READ</span>
        <h2>把它当作起点，不是结论。</h2>
        <p>
          本站区分学术事实与学生经历，只展示公开材料可以支持的内容。未知信息不会被推断，
          个体经历也不会被推广为实验室普遍情况。
        </p>
      </section>
    </>
  );
}

