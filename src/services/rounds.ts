import {
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { roundDoc, roundsCol, type RoundResult } from "@data/rounds";
import type { Round } from "@data/rounds";

/** A round document plus its Firestore id. */
export type RoundWithId = Round & { id: string };

/**
 * Live-subscribe to a game's rounds. The query filters on ownerId — required so
 * the read rule (resource.data.ownerId == uid) can authorize the listener — and
 * we sort by round number client-side to avoid a composite index.
 */
export const subscribeRounds = (
  gameId: string,
  ownerId: string,
  cb: (rounds: RoundWithId[]) => void
): Unsubscribe => {
  const q = query(roundsCol(gameId), where("ownerId", "==", ownerId));
  return onSnapshot(q, (snap) => {
    const rounds = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rounds.sort((a, b) => a.roundNumber - b.roundNumber);
    cb(rounds);
  });
};

export const createRound = async (
  ownerId: string,
  gameId: string,
  roundNumber: number,
  results: RoundResult[]
): Promise<string> => {
  const ref = await addDoc(roundsCol(gameId), {
    ownerId,
    roundNumber,
    results,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateRound = (
  gameId: string,
  roundId: string,
  results: RoundResult[]
): Promise<void> =>
  updateDoc(roundDoc(gameId, roundId), {
    results,
    updatedAt: serverTimestamp(),
  });

export const deleteRound = (
  gameId: string,
  roundId: string
): Promise<void> => deleteDoc(roundDoc(gameId, roundId));
