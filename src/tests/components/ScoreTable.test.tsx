// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { ScoreTable } from "@/components/game/ScoreTable";
import type { Game } from "@/domain/types";

afterEach(cleanup);

const makeGame = (overrides?: Partial<Game>): Game => ({
  id: "g1",
  createdAt: "2026-01-01T00:00:00Z",
  status: "playing",
  currentRoundIndex: 1,
  players: [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
  ],
  rounds: [
    {
      roundNumber: 1,
      cardCount: 1,
      status: "complete",
      playerScores: [
        { playerId: "p1", predictedTricks: 1, actualTricks: 1, score: 30 },
        { playerId: "p2", predictedTricks: 0, actualTricks: 0, score: 20 },
      ],
    },
    {
      roundNumber: 2,
      cardCount: 2,
      status: "bidding",
      playerScores: [
        { playerId: "p1", predictedTricks: null, actualTricks: null, score: null },
        { playerId: "p2", predictedTricks: null, actualTricks: null, score: null },
      ],
    },
  ],
  ...overrides,
});

describe("ScoreTable", () => {
  it("zeigt Spielernamen als Zeilenköpfe", () => {
    render(<ScoreTable game={makeGame()} />);
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("zeigt nur abgeschlossene Runden als Spalten", () => {
    render(<ScoreTable game={makeGame()} />);
    expect(screen.getByText("R1")).toBeDefined();
    expect(screen.queryByText("R2")).toBeNull();
  });

  it("zeigt positive Scores mit + Prefix", () => {
    render(<ScoreTable game={makeGame()} />);
    expect(screen.getAllByText("+30").length).toBeGreaterThan(0);
  });

  it("zeigt negative Scores ohne + Prefix", () => {
    const game = makeGame({
      rounds: [
        {
          roundNumber: 1,
          cardCount: 1,
          status: "complete",
          playerScores: [
            { playerId: "p1", predictedTricks: 1, actualTricks: 0, score: -10 },
            { playerId: "p2", predictedTricks: 0, actualTricks: 0, score: 20 },
          ],
        },
      ],
    });
    render(<ScoreTable game={game} />);
    expect(screen.getAllByText("-10").length).toBeGreaterThan(0);
  });

  it("zeigt Gesamtscore als Zeilensumme", () => {
    render(<ScoreTable game={makeGame()} />);
    expect(screen.getAllByText("30").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20").length).toBeGreaterThan(0);
  });

  it("zeigt leere Tabelle wenn keine Runde abgeschlossen", () => {
    const game = makeGame({
      rounds: [
        {
          roundNumber: 1,
          cardCount: 1,
          status: "bidding",
          playerScores: [
            { playerId: "p1", predictedTricks: null, actualTricks: null, score: null },
            { playerId: "p2", predictedTricks: null, actualTricks: null, score: null },
          ],
        },
      ],
    });
    render(<ScoreTable game={game} />);
    expect(screen.queryByText("R1")).toBeNull();
  });
});
