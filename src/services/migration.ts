import { createGame, makePlayer } from "./games";
import type { Player } from "@data/games";

const STORAGE_KEY_USERS = "users";
const STORAGE_KEY_NEXT_ID = "nextId";
const MIGRATION_DISMISSED = "uno_migration_dismissed";

/** Legacy localStorage player shape (pre-Firebase). */
export type LocalUser = { id: number; name: string; score: number };

/** Read the legacy localStorage scoreboard, if any. */
export const readLocalUsers = (): LocalUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    const parsed = raw ? (JSON.parse(raw) as LocalUser[]) : [];
    return Array.isArray(parsed)
      ? parsed.filter((u) => u && typeof u.name === "string")
      : [];
  } catch {
    return [];
  }
};

/** True when there's a legacy scoreboard worth offering to migrate. */
export const hasLocalData = (): boolean => readLocalUsers().length > 0;

export const migrationDismissed = (): boolean =>
  localStorage.getItem(MIGRATION_DISMISSED) === "true";

export const dismissMigration = (): void =>
  localStorage.setItem(MIGRATION_DISMISSED, "true");

/**
 * Create one active game from the legacy localStorage scoreboard. Current totals
 * become each player's `baseline` (excluded from round stats), so the user keeps
 * their standings and continues playing. Clears the legacy keys on success.
 * Returns the new game id.
 */
export const migrateLocalToFirestore = async (
  ownerId: string,
  gameName: string
): Promise<string> => {
  const players: Player[] = readLocalUsers().map((u) =>
    makePlayer(u.name, Number.isFinite(u.score) ? u.score : 0)
  );
  const gameId = await createGame(ownerId, gameName, players);
  localStorage.removeItem(STORAGE_KEY_USERS);
  localStorage.removeItem(STORAGE_KEY_NEXT_ID);
  return gameId;
};
