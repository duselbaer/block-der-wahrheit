import type { Game } from "./types";

export function calculateScore(predicted: number, actual: number): number {
  return predicted === actual
    ? 20 + actual * 10
    : -10 * Math.abs(actual - predicted);
}

export function calculateTotalRounds(playerCount: number): number {
  return Math.floor(60 / playerCount);
}

export function aggregatePlayerScore(game: Game, playerId: string): number {
  return game.rounds
    .filter((r) => r.status === "complete")
    .reduce((total, round) => {
      const ps = round.playerScores.find((s) => s.playerId === playerId);
      return total + (ps?.score ?? 0);
    }, 0);
}
