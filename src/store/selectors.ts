import { aggregatePlayerScore } from "@/domain/scoreEngine";
import type { Game, Player, Round } from "@/domain/types";

export function selectCurrentRound(game: Game | null): Round | null {
  if (!game) return null;
  return game.rounds[game.currentRoundIndex] ?? null;
}

export function selectPlayerTotalScore(game: Game, playerId: string): number {
  return aggregatePlayerScore(game, playerId);
}

export interface LeaderboardEntry {
  player: Player;
  score: number;
  rank: number;
}

export function selectLeaderboard(game: Game): LeaderboardEntry[] {
  return game.players
    .map((player) => ({
      player,
      score: aggregatePlayerScore(game, player.id),
    }))
    .sort((a, b) => b.score - a.score || a.player.name.localeCompare(b.player.name))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function selectAllBidsEntered(game: Game): boolean {
  return selectCurrentRound(game) !== null;
}

export function selectRemainingActualTricks(game: Game, playerId: string): number {
  const round = selectCurrentRound(game);
  if (!round) return 0;
  const othersSum = round.playerScores
    .filter((ps) => ps.playerId !== playerId && ps.actualTricks !== null)
    .reduce((sum, ps) => sum + (ps.actualTricks ?? 0), 0);
  return Math.max(0, round.cardCount - othersSum);
}

export function selectAllActualsEntered(game: Game): boolean {
  const round = selectCurrentRound(game);
  if (!round) return false;
  const allEntered = round.playerScores.every((ps) => ps.actualTricks !== null);
  if (!allEntered) return false;
  const sum = round.playerScores.reduce((s, ps) => s + (ps.actualTricks ?? 0), 0);
  return sum === round.cardCount;
}

export function selectTotalRounds(game: Game): number {
  return game.rounds.length;
}
