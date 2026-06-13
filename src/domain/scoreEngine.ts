import type { Game } from "./types";

export const HIT_BASE = 20;
export const HIT_PER_TRICK = 10;
export const MISS_PER_TRICK = 10;

export function calculateScore(predicted: number, actual: number): number {
  return predicted === actual
    ? HIT_BASE + actual * HIT_PER_TRICK
    : -MISS_PER_TRICK * Math.abs(actual - predicted);
}

export function calculateHitScore(predicted: number): number {
  return HIT_BASE + predicted * HIT_PER_TRICK;
}

export function calculateMissScore(predicted: number, actual: number): number {
  return MISS_PER_TRICK * Math.abs(actual - predicted);
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
