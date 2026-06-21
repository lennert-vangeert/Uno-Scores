import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@global/firebase/config";
import { converter } from "./_shared";

/** One player's points for a single round. */
export type RoundResult = {
  playerId: string;
  points: number;
};

export type Round = {
  /** Denormalized owner uid — enables the collectionGroup stats query + simple rules. */
  ownerId: string;
  roundNumber: number;
  results: RoundResult[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const roundConverter = converter<Round>();

export const roundsCol = (gameId: string): CollectionReference<Round> =>
  collection(db, "games", gameId, "rounds").withConverter(roundConverter);

export const roundDoc = (
  gameId: string,
  roundId: string
): DocumentReference<Round> =>
  doc(db, "games", gameId, "rounds", roundId).withConverter(roundConverter);
