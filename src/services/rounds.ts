import {
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { roundDoc, roundsCol, type RoundResult } from "@data/rounds";
import type { Round } from "@data/rounds";

/** A round document plus its Firestore id. */
export type RoundWithId = Round & { id: string };

/** Live-subscribe to a game's rounds, ordered by round number. */
export const subscribeRounds = (
  gameId: string,
  cb: (rounds: RoundWithId[]) => void
): Unsubscribe => {
  const q = query(roundsCol(gameId), orderBy("roundNumber", "asc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
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
