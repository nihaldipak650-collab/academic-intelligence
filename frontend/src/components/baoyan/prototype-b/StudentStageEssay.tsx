import type { GrowthStage } from "../../../data/baoyanMockData";

interface StudentStageEssayProps {
  stages: GrowthStage[];
}

export function StudentStageEssay({ stages }: StudentStageEssayProps) {
  const focusGrades = stages.filter((s) => ["大一", "大二", "大三"].includes(s.grade));

  return (
    <div className="ed-stages">
      {focusGrades.map((stage) => (
        <section key={stage.id} className="ed-stage-essay" id={`stage-${stage.id}`}>
          <p className="ed-stage-kicker">如果你现在{stage.grade}</p>
          <h3 className="ed-stage-title serif">{stage.title}</h3>

          <div className="ed-stage-block ed-stage-block--official">
            <h4>你应该先搞清楚</h4>
            <ol>
              {stage.shouldKnow.map((item, i) => (
                <li key={item}>
                  <span className="ed-stage-index">{["①", "②", "③"][i] ?? `${i + 1}.`}</span>
                  {item}
                </li>
              ))}
            </ol>
            {stage.relatedPolicies.length > 0 && (
              <p className="ed-stage-policy-ref">
                相关规则：{stage.relatedPolicies.join("；")}
              </p>
            )}
          </div>

          <div className="ed-stage-block ed-stage-block--action">
            <h4>现在可以开始</h4>
            <ul>
              {stage.canStart.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="ed-stage-block ed-stage-block--experience">
            <span className="ed-experience-badge">经验建议</span>
            <h4>常见误解</h4>
            <ul>
              {stage.misconceptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <blockquote className="ed-stage-quote ed-stage-quote--placeholder">
            {stage.experienceStatus === "pending" ? (
              <>
                <p>「如果让我重新回到{stage.grade}，我会……」</p>
                <footer>— 学长学姐采访待补充</footer>
              </>
            ) : (
              <p>采访内容待录入</p>
            )}
          </blockquote>
        </section>
      ))}
    </div>
  );
}
