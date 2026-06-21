import {
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { gameDoc, gamesCol, type Game, type Player } from "@data/games";
import { roundsCol } from "@data/rounds";

/** A game document plus its Firestore id (what the UI consumes). */
export type GameWithId = Game & { id: string };

/**
 * Live-subscribe to the signed-in user's games. We sort client-side (newest
 * first) to avoid needing an ownerId+createdAt composite index.
 */
export const subscribeGames = (
  ownerId: string,
  cb: (games: GameWithId[]) => void
): Unsubscribe => {
  const q = query(gamesCol(), where("ownerId", "==", ownerId));
  return onSnapshot(q, (snap) => {
    const games = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    games.sort(
      (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
    );
    cb(games);
  });
};

/** Live-subscribe to a single game; cb(null) when it doesn't exist. */
export const subscribeGame = (
  id: string,
  cb: (game: GameWithId | null) => void
): Unsubscribe =>
  onSnapshot(gameDoc(id), (snap) =>
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  );

export const createGame = async (
  ownerId: string,
  name: string,
  players: Player[] = []
): Promise<string> => {
  const ref = await addDoc(gamesCol(), {
    ownerId,
    name,
    status: "active",
    players,
    finishedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const renameGame = (id: string, name: string): Promise<void> =>
  updateDoc(gameDoc(id), { name, updatedAt: serverTimestamp() });

export const finishGame = (id: string): Promise<void> =>
  updateDoc(gameDoc(id), {
    status: "finished",
    finishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const reopenGame = (id: string): Promise<void> =>
  updateDoc(gameDoc(id), {
    status: "active",
    finishedAt: null,
    updatedAt: serverTimestamp(),
  });

/** Replace the players array (used for add/remove/rename of ad-hoc players). */
export const setPlayers = (id: string, players: Player[]): Promise<void> =>
  updateDoc(gameDoc(id), { players, updatedAt: serverTimestamp() });

/** Delete a game and all of its rounds (Firestore has no cascade). */
export const deleteGame = async (id: string): Promise<void> => {
  const rounds = await getDocs(roundsCol(id));
  await Promise.all(rounds.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(gameDoc(id));
};

/** Build a new ad-hoc player. */
export const makePlayer = (name: string, baseline = 0): Player => ({
  id: crypto.randomUUID(),
  name,
  baseline,
});
