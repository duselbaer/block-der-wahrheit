export type GameStatus = "setup" | "bidding" | "playing" | "finished";
export type RoundStatus = "bidding" | "playing" | "complete";

export interface Player {
  id: string;
  name: string;
}

export interface PlayerRoundScore {
  playerId: string;
  predictedTricks: number | null;
  actualTricks: number | null;
  score: number | null;
}

export interface Round {
  roundNumber: number;
  cardCount: number;
  playerScores: PlayerRoundScore[];
  status: RoundStatus;
}

export interface Game {
  id: string;
  createdAt: string;
  players: Player[];
  rounds: Round[];
  status: GameStatus;
  currentRoundIndex: number;
}
