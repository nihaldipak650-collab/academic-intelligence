import { Link } from "react-router-dom";

export function PlatformFooter() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            CSU
          </span>
          <span>
            <strong>生命科学本科生培养与科研服务平台</strong>
            <span>知行合一 · 经世致用</span>
          </span>
        </div>
        <div className="disclaimer">
          <strong>学生创新项目原型，非学校官方信息发布平台。</strong>
          <span>页面内容为展示用途，具体流程请以学校与学院正式通知为准。</span>
          <Link className="footer-updates-link" to="/updates">
            更新日志
          </Link>
        </div>
      </div>
    </footer>
  );
}
