/** Prototype A — Responsive candidate frozen. */
import { PlatformHeader } from "../components/platform/PlatformHeader";
import { PlatformFeedbackFloat } from "../components/platform/PlatformFeedbackFloat";
import { BaoyanEntryList } from "../components/baoyan/BaoyanEntryList";
import { BaoyanGrowthPath } from "../components/baoyan/BaoyanGrowthPath";
import { BaoyanMobileSectionNav } from "../components/baoyan/BaoyanMobileSectionNav";
import { BaoyanQuickFacts } from "../components/baoyan/BaoyanQuickFacts";
import { BaoyanRoadmap } from "../components/baoyan/BaoyanRoadmap";
import { BaoyanSourceArchive } from "../components/baoyan/BaoyanSourceArchive";
import { BaoyanTableOfContents } from "../components/baoyan/BaoyanTableOfContents";
import { BaoyanYearHistory } from "../components/baoyan/BaoyanYearHistory";
import { QuestionAnswerCard } from "../components/baoyan/QuestionAnswerCard";
import {
  BAOYAN_META,
  ELIGIBILITY_QUESTIONS,
  EVALUATION_QUESTIONS,
  GROWTH_STAGES,
  NAV_ENTRIES,
  QUICK_FACTS_2026,
  YEAR_HISTORY,
} from "../data/baoyanMockData";
import "../styles/platform-home.css";
import "../styles/baoyan-prototype-a.css";

export function BaoyanPrototypeAPage() {
  return (
    <div className="platform-home baoyan-prototype-a">
      <div className="baoyan-prototype-banner" role="note">
        UI Prototype A — 视觉探索，非最终政策发布页
      </div>
      <PlatformHeader />
      <BaoyanMobileSectionNav />

      <main className="baoyan-main">
        <div className="shell baoyan-page-layout">
          <BaoyanTableOfContents />

          <div className="baoyan-page-main">
            <header className="baoyan-hero">
              <div className="baoyan-hero-main">
                <div className="baoyan-hero-meta">
                  <p className="baoyan-hero-college">{BAOYAN_META.college}</p>
                  <span className="baoyan-hero-meta-divider" aria-hidden="true">
                    /
                  </span>
                  <p className="baoyan-hero-module">{BAOYAN_META.moduleTitle}</p>
                </div>
                <h1 className="baoyan-hero-title serif">{BAOYAN_META.heroTitle}</h1>
                <p className="baoyan-hero-subtitle">{BAOYAN_META.heroSubtitle}</p>
                <p className="baoyan-hero-boundary">
                  <span className="baoyan-hero-boundary-mark" aria-hidden="true">
                    —
                  </span>
                  {BAOYAN_META.heroBoundary}
                </p>
                <div className="baoyan-hero-status">
                  {BAOYAN_META.statusItems.map((item) => (
                    <span key={item.label} className="baoyan-status-pill">
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
              <aside className="baoyan-hero-aside" aria-label="页面定位">
                <p className="baoyan-hero-aside-kicker">{BAOYAN_META.cohortFocus}</p>
                <p className="baoyan-hero-aside-title">政策导航 · 试点版</p>
                <ul className="baoyan-hero-aside-list">
                  <li>官方原文可核对</li>
                  <li>看不懂的说人话</li>
                  <li>历年情况持续补齐</li>
                </ul>
              </aside>
            </header>

            <div className="baoyan-content">
              <BaoyanEntryList entries={NAV_ENTRIES} />
              <BaoyanQuickFacts items={QUICK_FACTS_2026} cohortLabel="2026 届" />

              <section className="baoyan-section" id="section-eligibility">
                <header className="baoyan-section-head">
                  <p className="baoyan-eyebrow">资格与成绩</p>
                  <h2 className="baoyan-section-title serif">我能不能保研？</h2>
                </header>
                <div className="baoyan-qacard-grid">
                  {ELIGIBILITY_QUESTIONS.map((item) => (
                    <QuestionAnswerCard key={item.id} item={item} />
                  ))}
                </div>
              </section>

              <BaoyanGrowthPath stages={GROWTH_STAGES} />

              <section className="baoyan-section" id="section-evaluation">
                <header className="baoyan-section-head">
                  <p className="baoyan-eyebrow">专项评价</p>
                  <h2 className="baoyan-section-title serif">科研、竞赛、论文怎么算？</h2>
                </header>
                <div className="baoyan-qacard-grid">
                  {EVALUATION_QUESTIONS.map((item) => (
                    <QuestionAnswerCard key={item.id} item={item} />
                  ))}
                </div>
              </section>

              <BaoyanYearHistory years={YEAR_HISTORY} />
              <BaoyanRoadmap />
              <BaoyanSourceArchive />
            </div>
          </div>
        </div>
      </main>

      <footer className="baoyan-footer shell">
        <p>数据来自《生命科学学院保研证据交接包 v0.2》</p>
      </footer>
      <PlatformFeedbackFloat mailSubject="[保研导航反馈]" />
    </div>
  );
}
