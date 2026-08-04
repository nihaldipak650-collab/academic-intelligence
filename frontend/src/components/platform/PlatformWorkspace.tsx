export function PlatformWorkspace() {
  return (
    <section
      className="workspace-section"
      id="workspace"
      aria-labelledby="workspace-title"
    >
      <div className="section-heading">
        <div>
          <div className="section-kicker">Student workspace</div>
          <h2 id="workspace-title">学生工作台</h2>
        </div>
        <span className="prototype-note">静态展示数据，暂未连接教务系统</span>
      </div>
      <div className="workspace-grid">
        <article className="widget schedule-widget">
          <div className="widget-head">
            <h3>本周课表</h3>
            <span className="widget-meta">第 3 教学周 · 示例</span>
          </div>
          <div className="schedule-days">
            <div />
            <div className="day">周一</div>
            <div className="day">周二</div>
            <div className="day">周三</div>
            <div className="day">周四</div>
            <div className="day">周五</div>
            <div className="time">08:00</div>
            <div className="class-block">
              细胞生物学
              <br />
              示例教室
            </div>
            <div className="class-block empty" />
            <div className="class-block gold">
              遗传学
              <br />
              示例教室
            </div>
            <div className="class-block empty" />
            <div className="class-block">
              生物化学
              <br />
              示例教室
            </div>
            <div className="time">14:00</div>
            <div className="class-block empty" />
            <div className="class-block">
              实验课程
              <br />
              示例实验室
            </div>
            <div className="class-block empty" />
            <div className="class-block gold">
              专业英语
              <br />
              示例教室
            </div>
            <div className="class-block empty" />
            <div className="time">19:00</div>
            <div className="class-block gold">
              小组汇报
              <br />
              课程任务
            </div>
            <div className="class-block empty" />
            <div className="class-block empty" />
            <div className="class-block">
              科研讲座
              <br />
              示例活动
            </div>
            <div className="class-block empty" />
          </div>
        </article>
        <article className="widget">
          <div className="widget-head">
            <h3>待办事项</h3>
            <span className="widget-meta">示例</span>
          </div>
          <div className="todo-list">
            <div className="todo">
              <span className="check" />
              <span>
                <strong>从零开始读一篇文献</strong>
                <small>选择一篇综述作为起点</small>
              </span>
            </div>
            <div className="todo">
              <span className="check" />
              <span>
                <strong>了解一个感兴趣的研究领域</strong>
                <small>神经科学、血液或基因</small>
              </span>
            </div>
            <div className="todo">
              <span className="check" />
              <span>
                <strong>整理高数学习与课程汇报框架</strong>
                <small>建立自己的系统学习路径</small>
              </span>
            </div>
          </div>
        </article>
        <article className="widget">
          <div className="widget-head">
            <h3>最近使用</h3>
            <span className="widget-meta">示例</span>
          </div>
          <div className="recent-list">
            <div className="recent">
              <span className="recent-icon">AI</span>
              <span>
                <strong>Academic Intelligence</strong>
                <small>导师与研究方向</small>
              </span>
            </div>
            <div className="recent">
              <span className="recent-icon">P</span>
              <span>
                <strong>PPT与汇报</strong>
                <small>AI辅助制作PPT</small>
              </span>
            </div>
            <div className="recent">
              <span className="recent-icon">¥</span>
              <span>
                <strong>报销指南</strong>
                <small>学生会与学院报销流程</small>
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
