import { useSiteFeedbackConfig } from "../../hooks/useSiteFeedbackConfig";
import { usePlatformToast } from "./PlatformToast";

const CONTACT_EMAIL = (import.meta.env.VITE_PUBLIC_CONTACT_EMAIL as string | undefined)?.trim() || null;

export function PlatformRealityProbe() {
  const config = useSiteFeedbackConfig();
  const { showToast } = usePlatformToast();
  const feedbackUrl = config?.feedbackUrl ?? "";
  const feedbackEmail = config?.feedbackEmail ?? CONTACT_EMAIL;

  return (
    <section className="reality-probe" aria-labelledby="probe-title">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Reality probe</div>
          <h2 id="probe-title">你也有这种问题？</h2>
        </div>
      </div>
      <p className="section-intro">
        如果你也有一件一直很麻烦的事，可以告诉我。我会继续拿真实问题测试 AI 到底能做到什么。
      </p>
      {feedbackUrl ? (
        <a className="probe-button" href={feedbackUrl} target="_blank" rel="noopener">
          我也有这个问题 →
        </a>
      ) : (
        <button
          type="button"
          className="probe-button"
          onClick={() => showToast("问卷正在配置，之后会开放。")}
        >
          我也有这个问题 →
        </button>
      )}
      {feedbackEmail ? (
        <p className="contact-email">
          有其他问题，也可以直接发邮件联系我：
          <a href={`mailto:${feedbackEmail}`} rel="noopener noreferrer">
            {feedbackEmail}
          </a>
        </p>
      ) : null}
    </section>
  );
}
