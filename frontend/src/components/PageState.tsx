import { Link } from "react-router-dom";
import { EmptyState } from "./EmptyState";

export function LoadingState() {
  return (
    <div className="page-state" role="status" aria-live="polite">
      <span className="loading-dot" aria-hidden="true" />
      正在读取已审核资料…
    </div>
  );
}

export function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="page-state page-state--error">
      <EmptyState
        title={title}
        description={description}
        action={
          <Link className="button" to="/">
            返回导师列表
          </Link>
        }
      />
    </div>
  );
}
