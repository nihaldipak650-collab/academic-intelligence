import { Link } from "react-router-dom";

interface StateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function LoadingState() {
  return (
    <section className="page-state" aria-busy="true" aria-live="polite">
      <div className="loading-mark" aria-hidden="true"><span /><span /><span /></div>
      <p>正在准备安全的本地演示界面…</p>
    </section>
  );
}

export function MessageState({ title, description, action }: StateProps) {
  return (
    <section className="page-state" role="status">
      <span className="state-kicker">SAFE STATE</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {action}
    </section>
  );
}

export function ErrorState({ title, description }: Omit<StateProps, "action">) {
  return (
    <MessageState
      title={title}
      description={description}
      action={<Link className="button" to="/">返回导师目录</Link>}
    />
  );
}

export function RouteErrorPage() {
  return <ErrorState title="页面不存在" description="这个本地演示地址无效，请返回导师目录继续浏览。" />;
}
