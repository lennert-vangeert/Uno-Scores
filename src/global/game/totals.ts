import type { Player } from "@data/games";
import type { RoundResult } from "@data/rounds";
import type { RoundWithId } from "@services/rounds";

export type PlayerTotal = { id: string; name: string; total: number };

/**
 * Player total = baseline + sum of the player's points across all rounds.
 * Rounds are the source of truth, so editing/deleting a round always reconciles.
 */
export const computeTotals = (
  players: Player[],
  rounds: RoundWithId[]
): PlayerTotal[] =>
  players.map((p) => {
    const fromRounds = rounds.reduce((sum, r) => {
      const res = r.results.find((x) => x.playerId === p.id);
      return sum + (res ? res.points : 0);
    }, 0);
    return { id: p.id, name: p.name, total: p.baseline + fromRounds };
  });

/** Penalty scoring: lowest total leads. Returns a new array sorted ascending. */
export const rankAscending = (totals: PlayerTotal[]): PlayerTotal[] =>
  [...totals].sort((a, b) => a.total - b.total);

/** Round winner(s): the playerId(s) with the minimum points that round. */
export const roundWinnerIds = (results: RoundResult[]): string[] => {
  if (results.length === 0) return [];
  const min = Math.min(...results.map((r) => r.points));
  return results.filter((r) => r.points === min).map((r) => r.playerId);
};
