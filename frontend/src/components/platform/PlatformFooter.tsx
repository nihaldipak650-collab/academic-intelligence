import { useEffect, useState } from "react";

export function PlatformFooter() {
  const [cfg, setCfg] = useState<{ feedbackUrl?: string; feedbackEmail?: string | null } | null>(null);

  useEffect(() => {
    fetch("data/site-config.json")
      .then((r) => r.json())
      .then((j) => setCfg(j))
      .catch(() => setCfg({}));
  }, []);

  const formEl = cfg?.feedbackUrl ? (
    <a href={cfg.feedbackUrl} target="_blank" rel="noopener">[填写反馈]</a>
  ) : (
    <span className="muted">反馈问卷正在配置</span>
  );
  const mailEl = cfg?.feedbackEmail ? (
    <a
      href={
        "mailto:" + cfg.feedbackEmail +
        "?subject=" + encodeURIComponent("[本科生平台反馈] 首页") +
        "&body=" + encodeURIComponent("当前页面：" + window.location.href)
      }
    >
      [邮件联系]
    </a>
  ) : (
    <span className="muted">邮件联系方式正在配置</span>
  );

  return (
    <footer>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            CSU
          </span>
          <span>
            <strong>生命科学本科生科研探索平台</strong>
            <span>知行合一 · 行胜于言</span>
          </span>
        </div>
        <div className="disclaimer">
          <strong>学生科研项目原型，非学校官方信息发布平台。</strong>
          <span>页面内容为展示用途，具体情况以学校 / 学院正式通知为准。</span>
        </div>
        <div className="feedback-line">
          <p className="muted">当前为试用版本。导师信息来自公开资料整理；如发现信息错误，欢迎反馈。</p>
          <p>
            有建议、发现信息错误，或者有哪里不好用？欢迎直接告诉我。
            {formEl} · {mailEl}
          </p>
        </div>
      </div>
      <div className="fb-float">
        {cfg?.feedbackUrl ? (
          <a
            href={cfg.feedbackUrl}
            target="_blank"
            rel="noopener"
            aria-label="反馈 / 联系我"
          >
            反馈
          </a>
        ) : (
          <button
            type="button"
            className="fb-float-btn"
            onClick={() => window.alert("反馈问卷正在配置")}
            aria-label="反馈 / 联系我"
          >
            反馈
          </button>
        )}
      </div>
    </footer>
  );
}
