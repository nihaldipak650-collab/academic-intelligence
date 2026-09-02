import { PlatformHeader } from "../components/platform/PlatformHeader";
import { PlatformFeedbackFloat } from "../components/platform/PlatformFeedbackFloat";
import { EditorialHero } from "../components/baoyan/prototype-b/EditorialHero";
import {
  EditorialContents,
  type EditorialContentEntry,
} from "../components/baoyan/prototype-b/EditorialContents";
import { PolicyStory } from "../components/baoyan/prototype-b/PolicyStory";
import { BigNumber } from "../components/baoyan/prototype-b/BigNumber";
import { YearChronicle } from "../components/baoyan/prototype-b/YearChronicle";
import { StudentStageEssay } from "../components/baoyan/prototype-b/StudentStageEssay";
import { SourceFootnotes } from "../components/baoyan/prototype-b/SourceFootnotes";
import {
  buildSourceRegistry,
  collectAllSourceIds,
} from "../components/baoyan/prototype-b/sourceRegistry";
import {
  ELIGIBILITY_QUESTIONS,
  EVALUATION_QUESTIONS,
  GROWTH_STAGES,
  QUICK_FACTS_2026,
  YEAR_HISTORY,
} from "../data/baoyanMockData";
import "../styles/platform-home.css";
import "../styles/baoyan-prototype-b.css";

const EDITORIAL_CONTENTS: EditorialContentEntry[] = [
  {
    number: "01",
    title: "先判断：我有没有资格？",
    sectionId: "section-eligibility",
  },
  {
    number: "02",
    title: "再理解：排名到底怎么算？",
    sectionId: "section-ranking",
  },
  {
    number: "03",
    title: "然后考虑：科研和竞赛意味着什么？",
    sectionId: "section-evaluation",
  },
  {
    number: "04",
    title: "如果想申请外校，该准备什么？",
    sectionId: "section-external",
  },
  {
    number: "05",
    title: "过去几年，生命院实际发生了什么？",
    sectionId: "section-history",
  },
  {
    number: "06",
    title: "我现在是大一 / 大二 / 大三，该做什么？",
    sectionId: "section-stages",
  },
];

export function BaoyanPrototypeBPage() {
  const allSourceIds = collectAllSourceIds(
    ...ELIGIBILITY_QUESTIONS.map((q) => q.sourceIds),
    ...EVALUATION_QUESTIONS.map((q) => q.sourceIds),
    ...YEAR_HISTORY.map((y) => y.sourceIds),
    ...QUICK_FACTS_2026.map((f) => f.sourceIds),
  );
  const registry = buildSourceRegistry(allSourceIds);

  const rankingQuestions = [
    ...ELIGIBILITY_QUESTIONS.filter((q) =>
      ["qa-retake", "qa-entry-bio", "qa-entry-info"].includes(q.id),
    ),
    ...EVALUATION_QUESTIONS.filter((q) => q.id === "qa-score-structure"),
  ];

  const externalQuestions = [
    ...ELIGIBILITY_QUESTIONS.filter((q) => q.id === "qa-english"),
    ...EVALUATION_QUESTIONS.filter((q) => q.id === "qa-sci-required"),
  ];

  const grade4 = GROWTH_STAGES.find((s) => s.grade === "大四");
  const year2025 = YEAR_HISTORY.find((y) => y.year === 2025);

  return (
    <div className="platform-home baoyan-prototype-b">
      <div className="ed-prototype-banner" role="note">
        UI Prototype B — Editorial 视觉探索，非最终政策发布页
      </div>
      <PlatformHeader />

      <main className="ed-main">
        <div className="ed-shell ed-hero-wrap">
          <EditorialHero />
          <EditorialContents entries={EDITORIAL_CONTENTS} />
        </div>

        <article className="ed-article">
          {/* 01 资格 */}
          <section className="ed-section" id="section-eligibility">
            <p className="ed-section-num">01</p>
            <h2 className="ed-section-title serif">先判断：我有没有资格？</h2>
            <p className="ed-section-lede">
              推免资格不是一道简单的是非题。挂科、补考、入围范围，各自有不同的官方口径。
            </p>
            {ELIGIBILITY_QUESTIONS.filter((q) =>
              ["qa-fail", "qa-retake"].includes(q.id),
            ).map((item) => (
              <PolicyStory key={item.id} item={item} registry={registry} />
            ))}
          </section>

          <hr className="ed-separator" />

          {/* 数据故事：2026 指标 */}
          <section className="ed-section ed-section--data">
            <div className="ed-data-story">
              <BigNumber
                value="20"
                label="2026 届"
                sublabel="生物科学普通指标"
                sourceIds={["A-2026-SCHOOL-NOTICE", "A-2026-LIFE-RULES"]}
                registry={registry}
                body={
                  <>
                    <p>
                      生物信息学为 <strong>5</strong> 个普通指标。此外生命科学学院还有{" "}
                      <strong>2</strong> 个工程硕博指标。
                    </p>
                    <p className="ed-data-aside">
                      但指标数量不等于最后会严格按照固定排名截止。
                    </p>
                  </>
                }
              />
            </div>
          </section>

          {/* 02 排名 */}
          <section className="ed-section" id="section-ranking">
            <p className="ed-section-num">02</p>
            <h2 className="ed-section-title serif">再理解：排名到底怎么算？</h2>
            {rankingQuestions.map((item) => (
              <PolicyStory key={item.id} item={item} registry={registry} />
            ))}
          </section>

          <hr className="ed-separator" />

          {/* 03 科研竞赛 */}
          <section className="ed-section" id="section-evaluation">
            <p className="ed-section-num">03</p>
            <h2 className="ed-section-title serif">然后考虑：科研和竞赛意味着什么？</h2>
            <p className="ed-section-lede">
              专项评价是入围之后的加分战场。论文、课题、竞赛各有上限与审核要求。
            </p>
            {EVALUATION_QUESTIONS.filter((q) => q.id !== "qa-score-structure").map(
              (item) => (
                <PolicyStory key={item.id} item={item} registry={registry} />
              ),
            )}
          </section>

          <hr className="ed-separator" />

          {/* 04 外校 */}
          <section className="ed-section" id="section-external">
            <p className="ed-section-num">04</p>
            <h2 className="ed-section-title serif">如果想申请外校，该准备什么？</h2>
            <p className="ed-section-lede">
              官方文件主要规定的是<strong>本校推免资格</strong>。外校夏令营与预推免的具体要求，往往来自目标院校——本页仅收录 mock
              数据中已有的相关条目。
            </p>
            {externalQuestions.map((item) => (
              <PolicyStory key={item.id} item={item} registry={registry} />
            ))}
            {grade4 && (
              <div className="ed-policy-story ed-policy-story--plain">
                <h3 className="ed-policy-question serif">获得资格之后呢？</h3>
                <ul className="ed-plain-list">
                  {grade4.shouldKnow.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="ed-stage-policy-ref">
                  相关规则：{grade4.relatedPolicies.join("；")}
                </p>
              </div>
            )}
            <div className="ed-stage-block ed-stage-block--experience">
              <span className="ed-experience-badge">经验建议</span>
              <p>
                外校申请策略（选校梯度、材料口径、套磁时机）待学长学姐访谈与公众号交叉内容录入后补充。当前不展示未经验证的经验引语。
              </p>
            </div>
          </section>

          <hr className="ed-separator" />

          {/* 05 历年 */}
          <section className="ed-section" id="section-history">
            <p className="ed-section-num">05</p>
            <h2 className="ed-section-title serif">过去几年，生命院实际发生了什么？</h2>
            <p className="ed-section-lede">
              指标、排名、放弃、递补——这四件事经常被混在一起。2025 届是目前最适合对照的公开样本。
            </p>

            {year2025?.execution?.bioScience && (
              <div className="ed-narrative-pair">
                <div className="ed-narrative-item">
                  <span className="ed-narrative-value serif">15</span>
                  <span className="ed-narrative-arrow">→</span>
                  <span className="ed-narrative-label">放弃</span>
                </div>
                <div className="ed-narrative-item">
                  <span className="ed-narrative-value serif">18</span>
                  <span className="ed-narrative-label">最终普通推荐延伸位置</span>
                </div>
                <p className="ed-narrative-caption">
                  2025 届生物科学普通指标 17 个；综合排名第 15 名放弃后，普通拟推荐递至第 18 名。
                  <FootnoteInline
                    sourceIds={["A-2025-LIFE-RANKING"]}
                    registry={registry}
                  />
                </p>
              </div>
            )}

            <YearChronicle years={YEAR_HISTORY} registry={registry} />
          </section>

          <hr className="ed-separator" />

          {/* 06 阶段 */}
          <section className="ed-section ed-section--human" id="section-stages">
            <p className="ed-section-num">06</p>
            <h2 className="ed-section-title serif">我现在是大一 / 大二 / 大三，该做什么？</h2>
            <p className="ed-section-lede">
              从这里开始，视觉从「政策」转向「人」。官方规则告诉你边界；具体怎么行动，还需要经验与访谈补充。
            </p>
            <StudentStageEssay stages={GROWTH_STAGES} />
          </section>
        </article>

        <div className="ed-shell">
          <SourceFootnotes registry={registry} />
        </div>
      </main>

      <footer className="ed-footer">
        <p>
          Prototype B · 数据来自《生命科学学院保研证据交接包 v0.2》· Crystal 二审 2026-09-02 ·
          人工核验待完成
        </p>
      </footer>
      <PlatformFeedbackFloat mailSubject="[保研导航反馈]" />
    </div>
  );
}

function FootnoteInline({
  sourceIds,
  registry,
}: {
  sourceIds: string[];
  registry: ReturnType<typeof buildSourceRegistry>;
}) {
  const refs = sourceIds
    .map((id) => registry.get(id))
    .filter(Boolean) as { index: number }[];
  if (refs.length === 0) return null;
  return (
    <sup className="ed-fn-refs">
      {refs.map((r) => (
        <a key={r.index} href={`#source-${r.index}`} className="ed-fn-link">
          [{String(r.index).padStart(2, "0")}]
        </a>
      ))}
    </sup>
  );
}
