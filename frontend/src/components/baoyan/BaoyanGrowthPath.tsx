import { useState } from "react";
import type { GrowthStage } from "../../data/baoyanMockData";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { BaoyanEditorNote } from "./BaoyanEditorNote";

interface BaoyanGrowthPathProps {
  stages: GrowthStage[];
}

function GrowthStageContent({ stage }: { stage: GrowthStage }) {
  return (
    <>
      <div className="baoyan-growth-grid">
        <div className="baoyan-growth-col">
          <h3>这一阶段先想清楚什么</h3>
          <ul>
            {stage.shouldKnow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="baoyan-growth-col">
          <h3>这一阶段可以做什么</h3>
          <ul>
            {stage.canStart.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="baoyan-growth-col baoyan-growth-col--policy">
          <h3>相关的官方规则</h3>
          <ul>
            {stage.relatedPolicies.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {stage.editorNote && (
        <div className="baoyan-growth-editor">
          <BaoyanEditorNote>{stage.editorNote}</BaoyanEditorNote>
        </div>
      )}

      {stage.experienceStatus === "pending" && (
        <p className="baoyan-growth-pending">学长学姐经验内容待补充，访谈后会单独收录。</p>
      )}
    </>
  );
}

export function BaoyanGrowthPath({ stages }: BaoyanGrowthPathProps) {
  const isStackedLayout = useMediaQuery("(max-width: 1199px)");
  const [activeId, setActiveId] = useState(stages[2]?.id ?? stages[0].id);
  const active = stages.find((s) => s.id === activeId) ?? stages[0];

  return (
    <section className="baoyan-growth" id="section-growth">
      <header className="baoyan-section-head">
        <p className="baoyan-eyebrow">分年级准备</p>
        <h2 className="baoyan-section-title serif">我现在能做什么？</h2>
      </header>

      {isStackedLayout ? (
        <div className="baoyan-growth-stack">
          {stages.map((stage) => (
            <article key={stage.id} className="baoyan-growth-stage" id={`grade-${stage.id}`}>
              <header className="baoyan-growth-stage-head">
                <span className="baoyan-growth-grade">{stage.grade}</span>
                <span className="baoyan-growth-step-title">{stage.title}</span>
              </header>
              <div className="baoyan-growth-stage-body">
                <GrowthStageContent stage={stage} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <>
          <div className="baoyan-growth-nav" role="tablist" aria-label="年级阶段">
            {stages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                role="tab"
                aria-selected={activeId === stage.id}
                className={`baoyan-growth-step${activeId === stage.id ? " is-active" : ""}`}
                id={`grade-${stage.id}`}
                onClick={() => setActiveId(stage.id)}
              >
                <span className="baoyan-growth-grade">{stage.grade}</span>
                <span className="baoyan-growth-step-title">{stage.title}</span>
              </button>
            ))}
          </div>

          <div className="baoyan-growth-panel" role="tabpanel">
            <GrowthStageContent stage={active} />
          </div>
        </>
      )}
    </section>
  );
}
