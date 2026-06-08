import { describe, it, expect } from "vitest";
import {
  selectRemainingActualTricks,
  selectAllActualsEntered,
} from "@/store/selectors";
import type { Game } from "@/domain/types";

function makeGame(
  cardCount: number,
  actuals: (number | null)[],
): Game {
  const players = actuals.map((_, i) => ({ id: `p${i}`, name: `P${i}` }));
  return {
    id: "g1",
    createdAt: "2026-01-01T00:00:00Z",
    players,
    status: "playing",
    currentRoundIndex: 0,
    rounds: [
      {
        roundNumber: 1,
        cardCount,
        status: "playing",
        playerScores: players.map((p, i) => ({
          playerId: p.id,
          predictedTricks: 0,
          actualTricks: actuals[i] ?? null,
          score: null,
        })),
      },
    ],
  };
}

describe("selectRemainingActualTricks", () => {
  it("kein anderer Spieler hat Stiche → cardCount zurück", () => {
    const game = makeGame(3, [null, null, null]);
    expect(selectRemainingActualTricks(game, "p0")).toBe(3);
  });

  it("alle anderen haben Stiche vergeben (Summe = cardCount) → 0", () => {
    const game = makeGame(3, [null, 2, 1]);
    expect(selectRemainingActualTricks(game, "p0")).toBe(0);
  });

  it("andere haben teilweise Stiche → Restbetrag korrekt", () => {
    const game = makeGame(5, [null, 2, null]);
    expect(selectRemainingActualTricks(game, "p0")).toBe(3);
  });

  it("eigene eingetragene Stiche werden nicht abgezogen (nur andere zählen)", () => {
    // p2 hat bereits 1 eingetragen — eigener Wert darf nicht in sum einfließen
    const gameWithOwn = makeGame(5, [2, 2, 1]);
    // p2 fragt: wie viele darf ich noch? others = 2+2 = 4 → remaining = 1
    expect(selectRemainingActualTricks(gameWithOwn, "p2")).toBe(1);
    // zum Vergleich: gleiche anderen, aber p2 hat null → selbes Ergebnis
    const gameWithNull = makeGame(5, [2, 2, null]);
    expect(selectRemainingActualTricks(gameWithNull, "p2")).toBe(1);
  });

  it("negativer Rest wird auf 0 geklemmt", () => {
    // Theoretisch unmöglich in der normalen App — defensiver Test
    const game = makeGame(2, [null, 2, 1]);
    expect(selectRemainingActualTricks(game, "p0")).toBe(0);
  });

  it("kein Spiel → 0", () => {
    expect(selectRemainingActualTricks(null as unknown as Game, "p0")).toBe(0);
  });
});

describe("selectAllActualsEntered", () => {
  it("alle eingetragen und Summe korrekt → true", () => {
    const game = makeGame(3, [1, 2]);
    expect(selectAllActualsEntered(game)).toBe(true);
  });

  it("alle eingetragen aber Summe falsch → false (Bug-Regression)", () => {
    const game = makeGame(3, [2, 2]);
    expect(selectAllActualsEntered(game)).toBe(false);
  });

  it("nicht alle eingetragen → false", () => {
    const game = makeGame(3, [1, null]);
    expect(selectAllActualsEntered(game)).toBe(false);
  });

  it("niemand eingetragen → false", () => {
    const game = makeGame(3, [null, null]);
    expect(selectAllActualsEntered(game)).toBe(false);
  });

  it("einziger Spieler trifft exakt cardCount → true", () => {
    const game = makeGame(3, [3]);
    expect(selectAllActualsEntered(game)).toBe(true);
  });
});
