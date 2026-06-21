import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { upsertProfile } from "@services/users";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

/**
 * Mirror the Auth user into `users/{uid}` so we keep a public profile doc.
 * Called after every sign-in so the profile stays in sync.
 */
export const syncUserProfile = async (user: User): Promise<void> => {
  await upsertProfile(user.uid, {
    displayName: user.displayName ?? user.email?.split("@")[0] ?? "Player",
    email: user.email ?? "",
    photoURL: user.photoURL ?? null,
  });
};

export const signInWithGoogle = async (): Promise<User> => {
  const { user } = await signInWithPopup(auth, googleProvider);
  await syncUserProfile(user);
  return user;
};

export const signOut = (): Promise<void> => fbSignOut(auth);
