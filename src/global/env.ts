/**
 * Emulator vs real-project switch.
 *
 *   dev -> Firebase emulators (auth :9099, firestore :8080), no real credentials.
 *   prd -> the real project, read from VITE_FIREBASE_* (see firebase-setup.md).
 *
 * Resolution order:
 *   1. explicit VITE_APP_ENV ("dev" | "prd") if set
 *   2. otherwise Vite's build flag — `vite` dev server -> dev, `vite build` -> prd
 *
 * So local `npm run dev` uses the emulators with zero env setup, while a
 * production build automatically targets the real project.
 */
export type AppEnv = "dev" | "prd";

const override = import.meta.env.VITE_APP_ENV as string | undefined;

export const APP_ENV: AppEnv = override
  ? override === "dev"
    ? "dev"
    : "prd"
  : import.meta.env.DEV
    ? "dev"
    : "prd";

export const IS_DEV = APP_ENV === "dev";
