import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@global/firebase/useAuth";
import { subscribeGames, type GameWithId } from "@services/games";
import { subscribeAllRounds, type RoundWithGame } from "@services/stats";
import { computeTotals, roundWinnerIds } from "@global/game/totals";

export type Stats = {
  gamesPlayed: number;
  roundsPlayed: number;
  avgPointsPerRound: number | null;
  lowestGameTotal: { value: number; gameName: string; playerName: string } | null;
  mostPointsInRound: {
    points: number;
    playerName: string;
    gameName: string;
    roundNumber: number;
  } | null;
  roundWins: { name: string; wins: number }[];
};

/**
 * Aggregates the user's whole history (all games + all rounds) into the handful
 * of stats surfaced in the UI. Everything derives from the round log; imported
 * baselines are never counted as rounds, so they don't pollute round stats.
 * Per-player figures are name-keyed (players are ad-hoc per game).
 */
export function useStats() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameWithId[] | null>(null);
  const [rounds, setRounds] = useState<RoundWithGame[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const u1 = subscribeGames(user.uid, setGames);
    const u2 = subscribeAllRounds(user.uid, setRounds);
    return () => {
      u1();
      u2();
    };
  }, [user]);

  const loading = games === null || rounds === null;

  const stats = useMemo<Stats | null>(() => {
    if (!games || !rounds) return null;

    const nameLookup = new Map<string, string>(); // `${gameId}:${playerId}` -> name
    const gameNames = new Map<string, string>();
    const roundsByGame = new Map<string, RoundWithGame[]>();
    games.forEach((g) => {
      gameNames.set(g.id, g.name);
      g.players.forEach((p) => nameLookup.set(`${g.id}:${p.id}`, p.name));
    });
    rounds.forEach((r) => {
      const arr = roundsByGame.get(r.gameId) ?? [];
      arr.push(r);
      roundsByGame.set(r.gameId, arr);
    });

    let most: Stats["mostPointsInRound"] = null;
    const wins = new Map<string, number>();
    let totalPoints = 0;
    let resultCount = 0;

    rounds.forEach((r) => {
      roundWinnerIds(r.results).forEach((pid) => {
        const name = nameLookup.get(`${r.gameId}:${pid}`);
        if (name) wins.set(name, (wins.get(name) ?? 0) + 1);
      });
      r.results.forEach((res) => {
        totalPoints += res.points;
        resultCount += 1;
        if (!most || res.points > most.points) {
          const name = nameLookup.get(`${r.gameId}:${res.playerId}`);
          if (name) {
            most = {
              points: res.points,
              playerName: name,
              gameName: gameNames.get(r.gameId) ?? "",
              roundNumber: r.roundNumber,
            };
          }
        }
      });
    });

    let lowest: Stats["lowestGameTotal"] = null;
    games.forEach((g) => {
      const gr = roundsByGame.get(g.id) ?? [];
      if (gr.length === 0) return; // only games that were actually played
      computeTotals(g.players, gr).forEach((tot) => {
        if (lowest === null || tot.total < lowest.value) {
          lowest = { value: tot.total, gameName: g.name, playerName: tot.name };
        }
      });
    });

    return {
      gamesPlayed: games.length,
      roundsPlayed: rounds.length,
      avgPointsPerRound: resultCount ? totalPoints / resultCount : null,
      lowestGameTotal: lowest,
      mostPointsInRound: most,
      roundWins: [...wins.entries()]
        .map(([name, w]) => ({ name, wins: w }))
        .sort((a, b) => b.wins - a.wins),
    };
  }, [games, rounds]);

  return { stats, loading };
}
