export function PlatformGrowthPath() {
  return (
    <section className="path-section" id="growth-path" aria-labelledby="path-title">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Research growth path</div>
          <h2 id="path-title">科研成长路径</h2>
        </div>
        <p>将分散的科研准备串成四个可以理解、可以继续扩展的阶段。</p>
      </div>
      <div className="path-grid">
        <article className="path-step">
          <div className="step-number">01</div>
          <h3>认识科研</h3>
          <p>了解实验室、论文、课题和本科生科研的基本方式。</p>
          <span className="step-note">科研入门</span>
        </article>
        <article className="path-step is-key">
          <div className="step-number">02</div>
          <h3>探索方向</h3>
          <p>通过公开信息比较研究方向、导师和代表性成果。</p>
          <span className="step-note">连接 Academic Intelligence</span>
        </article>
        <article className="path-step">
          <div className="step-number">03</div>
          <h3>准备进组</h3>
          <p>整理个人介绍、邮件、课程基础和实验安全准备。</p>
          <span className="step-note">准备清单</span>
        </article>
        <article className="path-step">
          <div className="step-number">04</div>
          <h3>沉淀成果</h3>
          <p>记录过程、整理汇报、归档材料并形成可复用经验。</p>
          <span className="step-note">成果整理</span>
        </article>
      </div>
    </section>
  );
}
