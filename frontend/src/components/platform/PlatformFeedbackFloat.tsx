import { useEffect, useId, useRef, useState } from "react";
import { useSiteFeedbackConfig } from "../../hooks/useSiteFeedbackConfig";

interface PlatformFeedbackFloatProps {
  mailSubject?: string;
}

export function PlatformFeedbackFloat({
  mailSubject = "[本科生平台反馈]",
}: PlatformFeedbackFloatProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const config = useSiteFeedbackConfig();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const surveyUrl = config?.feedbackUrl ?? "";
  const feedbackEmail = config?.feedbackEmail ?? "";
  const mailtoHref = feedbackEmail
    ? `mailto:${feedbackEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(
        `当前页面：${window.location.href}\n\n`,
      )}`
    : "";

  return (
    <div className="fb-float" ref={rootRef}>
      {open ? (
        <div className="fb-float-panel" id={panelId} role="dialog" aria-label="反馈方式">
          <p className="fb-float-copy">
            有问题、发现错误，或者有什么特别想要的功能，都可以直接告诉我。
          </p>
          <div className="fb-float-actions">
            {surveyUrl ? (
              <a href={surveyUrl} target="_blank" rel="noopener noreferrer">
                填个反馈 →
              </a>
            ) : (
              <span className="fb-float-muted">问卷正在配置</span>
            )}
          </div>
          {feedbackEmail ? (
            <p className="fb-float-email">
              也可以直接发邮件：
              <a href={mailtoHref}>{feedbackEmail}</a>
            </p>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        className="fb-float-btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        反馈
      </button>
    </div>
  );
}
