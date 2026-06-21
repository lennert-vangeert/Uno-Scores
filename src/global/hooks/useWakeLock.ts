import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "wake";

type WakeLockNavigator = Navigator & {
  wakeLock?: { request(type: "screen"): Promise<WakeLockSentinel> };
};

export const wakeSupported =
  typeof navigator !== "undefined" && "wakeLock" in navigator;

/**
 * Keep the screen awake while scoring.
 *
 * The browser auto-releases a screen wake lock every time the tab is hidden
 * (app switch, phone lock), so we re-acquire on every `visibilitychange` while
 * the preference is on — and always re-attach the release listener so this keeps
 * working across repeated hide/show cycles. Preference persists to localStorage.
 *
 * Returns `enabled` (the persisted preference) and `active` (whether a lock is
 * actually held right now).
 */
export function useWakeLock() {
  const [enabled, setEnabled] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(STORAGE_KEY) === "true"
  );
  const [active, setActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    if (!wakeSupported) return;
    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    if (!wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      // already holding one, or the tab is hidden (request would throw)
      if (sentinelRef.current || document.visibilityState !== "visible") return;
      try {
        const sentinel = await wakeLock.request("screen");
        if (cancelled) {
          await sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        setActive(true);
        // Fires when the browser auto-releases (tab hidden) — clear so the next
        // visibilitychange re-acquires a fresh lock.
        sentinel.addEventListener("release", () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = null;
            setActive(false);
          }
        });
      } catch {
        setActive(false); // rejected, e.g. low battery or not visible
      }
    };

    const release = async () => {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      setActive(false);
      if (sentinel) await sentinel.release().catch(() => {});
    };

    const onVisibility = () => {
      if (enabled && document.visibilityState === "visible") acquire();
    };

    if (enabled) {
      acquire();
      document.addEventListener("visibilitychange", onVisibility);
    } else {
      release();
    }

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      release();
    };
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((p) => !p), []);

  return { enabled, active, toggle, supported: wakeSupported };
}
