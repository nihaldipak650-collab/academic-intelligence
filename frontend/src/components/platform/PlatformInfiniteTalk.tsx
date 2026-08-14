import { usePlatformToast } from "./PlatformToast";

export function PlatformInfiniteTalk() {
  const { showToast } = usePlatformToast();

  return (
    <section className="infinite-talk" aria-labelledby="infinite-title">
      <div className="infinite-card">
        <div className="section-kicker">Infinite Talk</div>
        <h2 id="infinite-title">如果 AI 的脑力近乎无限，一个人能把自己变成什么？</h2>
        <p className="infinite-copy">
          一个还没展开的思想专题：当一个人拥有近乎无限的机器脑力，他还能把自己扩展成什么。
        </p>
        <button
          type="button"
          className="talk-button"
          onClick={() => showToast("Infinite Talk 专题正在整理，之后会展开。")}
        >
          进入 Infinite Talk →
        </button>
      </div>
    </section>
  );
}
