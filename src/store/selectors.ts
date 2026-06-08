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
  const round = selectCurrentRound(game);
  if (!round) return false;
  return round.playerScores.every((ps) => ps.predictedTricks !== null);
}

export function selectAllActualsEntered(game: Game): boolean {
  const round = selectCurrentRound(game);
  if (!round) return false;
  return round.playerScores.every((ps) => ps.actualTricks !== null);
}

export function selectTotalRounds(game: Game): number {
  return game.rounds.length;
}
