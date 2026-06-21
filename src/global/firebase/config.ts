import { initializeApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { IS_DEV } from "@global/env";

const USE_EMULATORS = IS_DEV;

// In emulator mode we talk to a "demo-" project, which needs no real credentials.
// In production the values below come from VITE_FIREBASE_* (see firebase-setup.md).
// These are the public Firebase web-app config values — they ship to the browser
// by design; access is gated by firestore.rules, not by keeping them secret.
const firebaseConfig: FirebaseOptions = USE_EMULATORS
  ? {
      projectId: "demo-uno",
      apiKey: "demo",
      authDomain: "localhost",
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (USE_EMULATORS) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
