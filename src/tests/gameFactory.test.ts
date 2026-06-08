import { describe, it, expect } from "vitest";
import { createGame, createRound, createPlayer } from "@/domain/gameFactory";

describe("createPlayer", () => {
  it("erstellt Spieler mit getrimmtem Namen und UUID", () => {
    const p = createPlayer("  Alice  ");
    expect(p.name).toBe("Alice");
    expect(p.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("createGame", () => {
  it("erstellt Spiel mit Status 'setup'", () => {
    const game = createGame(["Alice", "Bob", "Carol"]);
    expect(game.status).toBe("setup");
  });

  it("erstellt korrekte Spieleranzahl", () => {
    const game = createGame(["Alice", "Bob", "Carol"]);
    expect(game.players).toHaveLength(3);
  });

  it("3 Spieler → 20 Runden", () => {
    const game = createGame(["Alice", "Bob", "Carol"]);
    expect(game.rounds).toHaveLength(20);
  });

  it("2 Spieler (Minimum) → 30 Runden", () => {
    const game = createGame(["Alice", "Bob"]);
    expect(game.rounds).toHaveLength(30);
  });

  it("6 Spieler (Maximum) → 10 Runden", () => {
    const game = createGame(["A", "B", "C", "D", "E", "F"]);
    expect(game.rounds).toHaveLength(10);
  });

  it("Runde 1 hat cardCount=1, Runde 5 hat cardCount=5", () => {
    const game = createGame(["Alice", "Bob", "Carol"]);
    expect(game.rounds[0]!.cardCount).toBe(1);
    expect(game.rounds[4]!.cardCount).toBe(5);
  });

  it("alle PlayerScores initial auf null", () => {
    const game = createGame(["Alice", "Bob"]);
    const firstRound = game.rounds[0]!;
    for (const ps of firstRound.playerScores) {
      expect(ps.predictedTricks).toBeNull();
      expect(ps.actualTricks).toBeNull();
      expect(ps.score).toBeNull();
    }
  });

  it("currentRoundIndex startet bei 0", () => {
    const game = createGame(["Alice", "Bob"]);
    expect(game.currentRoundIndex).toBe(0);
  });

  it("zwei aufeinanderfolgende Spiele haben unterschiedliche IDs", () => {
    const g1 = createGame(["Alice", "Bob"]);
    const g2 = createGame(["Alice", "Bob"]);
    expect(g1.id).not.toBe(g2.id);
  });
});

describe("createRound", () => {
  it("Runde 3 hat cardCount=3", () => {
    const players = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ];
    const round = createRound(3, players);
    expect(round.roundNumber).toBe(3);
    expect(round.cardCount).toBe(3);
  });

  it("Status ist 'bidding'", () => {
    const round = createRound(1, [{ id: "p1", name: "Alice" }]);
    expect(round.status).toBe("bidding");
  });

  it("PlayerScore-Einträge für jeden Spieler erstellt", () => {
    const players = [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ];
    const round = createRound(1, players);
    expect(round.playerScores).toHaveLength(2);
    expect(round.playerScores[0]!.playerId).toBe("p1");
    expect(round.playerScores[1]!.playerId).toBe("p2");
  });
});
