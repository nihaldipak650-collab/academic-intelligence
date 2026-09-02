import { Link } from "react-router-dom";

const KEYWORD_CLASS = "growth-nav-keywords";

function KeywordTags({ items }: { items: string[] }) {
  return (
    <div className={KEYWORD_CLASS}>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export function PlatformGrowthNavigator() {
  return (
    <section
      className="growth-navigator-section"
      id="growth-navigator"
      aria-labelledby="growth-navigator-title"
    >
      <div className="section-heading">
        <div>
          <div className="section-kicker">Growth Navigator</div>
          <h2 id="growth-navigator-title">有些事，可以先从这里找。</h2>
        </div>
        <p>
          保研、考研、竞赛这些事，信息常常散在官网、通知和经验帖里。能整理清楚的先放进来，还没做完的就先标着。
        </p>
      </div>

      <div className="growth-navigator-grid">
        <article className="growth-nav-card growth-nav-card--featured">
          <span className="growth-nav-badge growth-nav-badge--open">保研 · 已开放</span>
          <h3>保研的信息，先从这里查</h3>
          <p>
            政策、名额、排名、科研竞赛怎么算、往年是什么情况，以及不同阶段可以提前准备什么，都先放到一个入口里。看不懂的政策尽量说人话，官方原文也留着，想核可以自己点回去。
          </p>
          <KeywordTags items={["政策", "排名", "历年", "科研竞赛", "经验"]} />
          <Link className="growth-nav-cta" to="/baoyan/prototype-a">
            进入保研导航 <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="growth-nav-card growth-nav-card--pending">
          <span className="growth-nav-badge growth-nav-badge--pending">考研 · 准备中</span>
          <h3>如果以后想考研，也不用从几十个网页开始翻</h3>
          <p>
            学校怎么选、专业课考什么、什么时候开始准备、复试又在看什么。以后把招生简章和真实经验分开整理，先告诉你该去哪里找。
          </p>
          <KeywordTags items={["选校", "初试", "专业课", "复试"]} />
        </article>

        <article className="growth-nav-card growth-nav-card--pending">
          <span className="growth-nav-badge growth-nav-badge--pending">竞赛 · 准备中</span>
          <h3>想打比赛，先搞清楚参加哪个、跟谁一起打</h3>
          <p>
            有哪些比赛、适不适合现在的你、什么时候报名、去哪里找队友，再到分工、往届经验和比赛怎么准备，之后慢慢补进来。
          </p>
          <KeywordTags items={["找比赛", "报名", "组队", "分工", "往届经验"]} />
        </article>
      </div>
    </section>
  );
}
