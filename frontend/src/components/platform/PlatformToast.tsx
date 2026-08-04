import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface PlatformToastContextValue {
  showToast: (message: string) => void;
}

const PlatformToastContext = createContext<PlatformToastContextValue | null>(
  null,
);

export function usePlatformToast() {
  const ctx = useContext(PlatformToastContext);
  if (!ctx) {
    throw new Error("usePlatformToast must be used within PlatformToastProvider");
  }
  return ctx;
}

export function PlatformToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((next: string) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setMessage(next);
    setVisible(true);
    timerRef.current = window.setTimeout(() => setVisible(false), 2800);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return (
    <PlatformToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`toast${visible ? " show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </PlatformToastContext.Provider>
  );
}
