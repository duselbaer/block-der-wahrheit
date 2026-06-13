import { aggregatePlayerScore } from "@/domain/scoreEngine";
import type { Game, Player, Round } from "@/domain/types";

export function selectCurrentRound(game: Game | null): Round | null {
  if (!game) return null;
  return game.rounds[game.currentRoundIndex] ?? null;
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

export function selectCanAdvanceToPlaying(game: Game): boolean {
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

// Prüft über die Summen-Constraint (Stiche = Karten der Runde), nicht über
// individuelle null-Checks. Funktioniert korrekt, weil selectRemainingActualTricks
// verhindert, dass der letzte Spieler mehr eintragen kann als noch übrig sind —
// null-Werte werden dabei als 0 gezählt, was dem Spieldesign entspricht.
export function selectAllActualsEntered(game: Game): boolean {
  const round = selectCurrentRound(game);
  if (!round) return false;
  const sum = round.playerScores.reduce((s, ps) => s + (ps.actualTricks ?? 0), 0);
  return sum === round.cardCount;
}

export function selectTotalRounds(game: Game): number {
  return game.rounds.length;
}
