import { describe, it, expect } from "vitest";
import {
  calculateScore,
  calculateTotalRounds,
  aggregatePlayerScore,
} from "@/domain/scoreEngine";
import type { Game } from "@/domain/types";

describe("calculateScore", () => {
  it("Treffer: Voraussage 3, tatsächlich 3 → +50", () => {
    expect(calculateScore(3, 3)).toBe(50);
  });

  it("Treffer: Nullrunde – Voraussage 0, tatsächlich 0 → +20", () => {
    expect(calculateScore(0, 0)).toBe(20);
  });

  it("Treffer: Voraussage 1, tatsächlich 1 → +30", () => {
    expect(calculateScore(1, 1)).toBe(30);
  });

  it("Verfehlt: zu viele Stiche (3→5) → -20", () => {
    expect(calculateScore(3, 5)).toBe(-20);
  });

  it("Verfehlt: zu wenige Stiche (5→2) → -30", () => {
    expect(calculateScore(5, 2)).toBe(-30);
  });

  it("Verfehlt: Differenz 1 → -10", () => {
    expect(calculateScore(2, 3)).toBe(-10);
  });

  it("Verfehlt: Differenz ist symmetrisch (über/unter)", () => {
    expect(calculateScore(3, 4)).toBe(calculateScore(4, 3));
  });
});

describe("calculateTotalRounds", () => {
  it("2 Spieler → 30 Runden", () => {
    expect(calculateTotalRounds(2)).toBe(30);
  });

  it("3 Spieler → 20 Runden", () => {
    expect(calculateTotalRounds(3)).toBe(20);
  });

  it("4 Spieler → 15 Runden", () => {
    expect(calculateTotalRounds(4)).toBe(15);
  });

  it("5 Spieler → 12 Runden", () => {
    expect(calculateTotalRounds(5)).toBe(12);
  });

  it("6 Spieler → 10 Runden", () => {
    expect(calculateTotalRounds(6)).toBe(10);
  });
});

describe("aggregatePlayerScore", () => {
  const playerId = "p1";

  const makeGame = (scores: Array<number | null>): Game => ({
    id: "g1",
    createdAt: "2026-01-01T00:00:00Z",
    players: [{ id: playerId, name: "Alice" }],
    status: "playing",
    currentRoundIndex: scores.length - 1,
    rounds: scores.map((score, i) => ({
      roundNumber: i + 1,
      cardCount: i + 1,
      status: score !== null ? "complete" : "playing",
      playerScores: [
        {
          playerId,
          predictedTricks: 1,
          actualTricks: score !== null ? 1 : null,
          score,
        },
      ],
    })),
  });

  it("keine abgeschlossenen Runden → 0", () => {
    expect(aggregatePlayerScore(makeGame([null]), playerId)).toBe(0);
  });

  it("eine abgeschlossene Runde mit +30 → 30", () => {
    expect(aggregatePlayerScore(makeGame([30]), playerId)).toBe(30);
  });

  it("mehrere Runden werden addiert", () => {
    expect(aggregatePlayerScore(makeGame([30, 50, -10]), playerId)).toBe(70);
  });

  it("unbekannter Spieler → 0", () => {
    expect(aggregatePlayerScore(makeGame([30]), "unbekannt")).toBe(0);
  });
});
