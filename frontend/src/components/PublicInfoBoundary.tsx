export function PublicInfoBoundary() {
  return (
    <section className="content-section public-info-section" id="more-info">
      <span className="section-number">08</span>
      <div>
        <span className="eyebrow">WHAT ELSE TO VERIFY</span>
        <h2>你可能还想知道</h2>
        <div className="public-info-grid">
          <article>
            <span>OFFICIAL ADMISSIONS</span>
            <h3>官方招生信息</h3>
            <p className="public-info-empty">暂无公开信息</p>
            <small>只有正式公开来源进入页面；当前获准公开资料未提供此项信息。</small>
          </article>
          <article>
            <span>PUBLIC PROJECTS</span>
            <h3>公开项目或基金</h3>
            <p className="public-info-empty">暂无公开信息</p>
            <small>不根据论文、研究方向或机构信息推断项目与经费。</small>
          </article>
          <article className="public-info-unknown">
            <span>NEEDS A CONVERSATION</span>
            <h3>公开资料无法可靠判断</h3>
            <ul>
              <li>导师管理风格与沟通方式</li>
              <li>实验室真实氛围与学生体验</li>
              <li>当前名额与具体招募安排</li>
              <li>毕业难度、成果或论文保证</li>
            </ul>
            <p>建议通过官方渠道联系，并在正式面谈中进一步了解。</p>
          </article>
        </div>
      </div>
    </section>
  );
}
