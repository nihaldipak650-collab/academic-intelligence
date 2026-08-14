export function PlatformFlagship() {
  return (
    <section id="academic-intelligence" aria-labelledby="ai-title">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Find your research direction</div>
          <h2 id="ai-title">找导师、看方向、看公开成果与信息来源</h2>
        </div>
        <p className="section-intro">
          帮本科生判断「哪位导师在研究什么、我能不能参与、怎么联系」——先从导师和研究方向开始。
        </p>
      </div>
      <article className="flagship">
        <div className="flagship-copy">
          <span className="flagship-badge">旗舰科研入口</span>
          <h2>
            Academic
            <br />
            Intelligence
          </h2>
          <p className="flagship-subtitle">
            找导师、看研究方向、看公开成果与信息来源——判断这个方向适不适合自己，再决定要不要深入了解。
          </p>
          <div className="flagship-features">
            <span>找导师</span>
            <span>看研究方向</span>
            <span>公开成果与来源</span>
          </div>
          <div className="button-row">
            <a className="button button-light" href="academic/">
              进入导师目录 <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-ghost" href="#academic-intelligence">
              了解更多
            </a>
          </div>
        </div>

        <div className="intelligence-preview" aria-label="第一次怎么用 Academic Intelligence">
          <div className="preview-top">
            <strong>第一次怎么用 Academic Intelligence</strong>
            <span>按这五步开始</span>
          </div>
          <ol className="steps">
            <li><b>01 先搜一个方向 / 导师</b><p>比如「肿瘤」「AI」「蛋白质」或「陈苗」</p></li>
            <li><b>02 看研究方向</b><p>先判断：这位老师到底在研究什么</p></li>
            <li><b>03 看公开成果与研究脉络</b><p>了解近几年大概在解决哪些问题</p></li>
            <li><b>04 看本科生可以做什么</b><p>可能参与的任务、需要先补的技能、入门建议</p></li>
            <li><b>05 最后再联系导师</b><p>回到官方主页 / 官方联系方式</p></li>
          </ol>
          <div className="preview-foot">公开信息整理 ≠ 导师官方招生承诺；详情以官方主页为准。</div>
        </div>
      </article>
    </section>
  );
}
