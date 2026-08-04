import { useAdvisorData } from "../data/AdvisorDataContext";

interface FeedbackLinkProps {
  compact?: boolean;
}

export function FeedbackLink({ compact = false }: FeedbackLinkProps) {
  const { siteConfig } = useAdvisorData();
  const feedbackUrl = siteConfig?.feedbackUrl ?? null;
  if (!feedbackUrl) {
    return (
      <span className={compact ? "feedback-link is-muted" : "button is-muted"}>
        反馈链接待配置
      </span>
    );
  }
  return (
    <a
      className={compact ? "feedback-link" : "button button--secondary"}
      href={feedbackUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      发现错误，提交反馈
    </a>
  );
}
