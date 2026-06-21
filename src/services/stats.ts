import {
  collectionGroup,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@global/firebase/config";
import type { Round } from "@data/rounds";

/** A round plus its id and the id of the game it belongs to. */
export type RoundWithGame = Round & { id: string; gameId: string };

/**
 * Live-subscribe to every round the user owns, across all their games, via a
 * collectionGroup query. The query filters on the denormalized ownerId, which
 * the recursive-wildcard rule in firestore.rules requires.
 */
export const subscribeAllRounds = (
  ownerId: string,
  cb: (rounds: RoundWithGame[]) => void
): Unsubscribe => {
  const q = query(collectionGroup(db, "rounds"), where("ownerId", "==", ownerId));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        gameId: d.ref.parent.parent?.id ?? "",
        ...(d.data() as Round),
      }))
    );
  });
};
