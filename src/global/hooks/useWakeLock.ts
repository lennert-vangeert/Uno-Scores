import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "wake";

export const wakeSupported =
  typeof navigator !== "undefined" && "wakeLock" in navigator;

/**
 * Keep the screen awake while scoring. Preference persists to localStorage and
 * the sentinel is re-acquired when the tab becomes visible again (the lock is
 * auto-released by the browser on visibility change).
 */
export function useWakeLock() {
  const [wake, setWake] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true"
  );
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const releaseHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(wake));
  }, [wake]);

  useEffect(() => {
    if (!wakeSupported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wakeLock = (navigator as any).wakeLock;

    const acquire = async () => {
      try {
        const sentinel: WakeLockSentinel = await wakeLock.request("screen");
        sentinelRef.current = sentinel;
        const onRelease = () => {
          if (document.visibilityState === "visible" && wake) acquire();
        };
        releaseHandlerRef.current = onRelease;
        sentinel.addEventListener("release", onRelease);
      } catch {
        // wake lock can be rejected (e.g. low battery) — ignore.
      }
    };

    const release = async () => {
      const sentinel = sentinelRef.current;
      if (!sentinel) return;
      if (releaseHandlerRef.current) {
        sentinel.removeEventListener("release", releaseHandlerRef.current);
        releaseHandlerRef.current = null;
      }
      await sentinel.release();
      sentinelRef.current = null;
    };

    if (wake) acquire();
    else release();

    return () => {
      if (sentinelRef.current) release();
    };
  }, [wake]);

  useEffect(() => {
    const handleVisibility = () => {
      if (wake && document.visibilityState === "visible" && !sentinelRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).wakeLock
          .request("screen")
          .then((s: WakeLockSentinel) => {
            sentinelRef.current = s;
          })
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [wake]);

  return { wake, toggle: () => setWake((p) => !p), supported: wakeSupported };
}
