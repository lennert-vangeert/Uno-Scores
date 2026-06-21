import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@global/firebase/config";
import { converter } from "./_shared";

export type GameStatus = "active" | "finished";

/** A player within a game. Players are ad-hoc (scoped to the game), not accounts. */
export type Player = {
  id: string;
  name: string;
  /**
   * Imported starting points (from migration). Added to the round sum for the
   * player's displayed total, but EXCLUDED from round-level stats. 0 for games
   * created in-app.
   */
  baseline: number;
};

export type Game = {
  ownerId: string;
  name: string;
  status: GameStatus;
  players: Player[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  finishedAt: Timestamp | null;
};

const gameConverter = converter<Game>();

export const gamesCol = (): CollectionReference<Game> =>
  collection(db, "games").withConverter(gameConverter);

export const gameDoc = (id: string): DocumentReference<Game> =>
  doc(db, "games", id).withConverter(gameConverter);
