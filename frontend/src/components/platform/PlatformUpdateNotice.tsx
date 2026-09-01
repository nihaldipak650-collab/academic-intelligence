import { useEffect, useId, useRef, useState } from "react";

const STORAGE_KEY = "platform-home:last-seen-update-id";

interface LatestUpdate {
  id: string;
  version: string;
  title: string;
  points: string[];
}

export function PlatformUpdateNotice() {
  const titleId = useId();
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const [update, setUpdate] = useState<LatestUpdate | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("data/latest-update.json", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as LatestUpdate;
        if (!payload?.id || cancelled) return;

        const seenId = window.localStorage.getItem(STORAGE_KEY);
        if (seenId !== payload.id) {
          setUpdate(payload);
          setOpen(true);
        }
      } catch {
        // 更新提示是增强体验，拉取失败时静默跳过
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    dismissButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function dismissForNow() {
    setOpen(false);
  }

  function dismissUntilNextUpdate() {
    if (update) {
      window.localStorage.setItem(STORAGE_KEY, update.id);
    }
    setOpen(false);
  }

  if (!open || !update) return null;

  return (
    <div className="update-notice-backdrop" onClick={dismissForNow}>
      <div
        className="update-notice-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="update-notice-kicker">
          <span className="update-notice-pill">有新更新</span>
          <span className="update-notice-version">{update.version}</span>
        </div>
        <h2 className="update-notice-title" id={titleId}>
          {update.title}
        </h2>
        <ul className="update-notice-list">
          {update.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="update-notice-actions">
          <button
            ref={dismissButtonRef}
            type="button"
            className="update-notice-btn update-notice-btn--primary"
            onClick={dismissForNow}
          >
            知道了
          </button>
          <button
            type="button"
            className="update-notice-btn update-notice-btn--quiet"
            onClick={dismissUntilNextUpdate}
          >
            下次更新前不再提醒
          </button>
          <a className="update-notice-btn update-notice-btn--ghost" href="updates.html">
            查看全部更新
          </a>
        </div>
      </div>
    </div>
  );
}
