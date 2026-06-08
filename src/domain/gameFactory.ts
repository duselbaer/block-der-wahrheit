import { randomUUID } from "node:crypto";
import { calculateTotalRounds } from "./scoreEngine";
import type { Game, Player, Round } from "./types";

export function createPlayer(name: string): Player {
  return { id: randomUUID(), name: name.trim() };
}

export function createRound(roundNumber: number, players: Player[]): Round {
  return {
    roundNumber,
    cardCount: roundNumber,
    playerScores: players.map((p) => ({
      playerId: p.id,
      predictedTricks: null,
      actualTricks: null,
      score: null,
    })),
    status: "bidding",
  };
}

export function createGame(playerNames: string[]): Game {
  const players = playerNames.map(createPlayer);
  const totalRounds = calculateTotalRounds(players.length);
  const rounds: Round[] = Array.from({ length: totalRounds }, (_, i) =>
    createRound(i + 1, players),
  );

  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    players,
    rounds,
    status: "setup",
    currentRoundIndex: 0,
  };
}
