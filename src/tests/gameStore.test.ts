import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/gameStore";
import {
  selectCurrentRound,
  selectLeaderboard,
  selectCanAdvanceToPlaying,
  selectAllActualsEntered,
} from "@/store/selectors";
import type { Player } from "@/domain/types";

function s() {
  return useGameStore.getState();
}

function reset() {
  useGameStore.setState({ game: null, lastPlayerNames: [] });
}

function players(): Player[] {
  return s().game!.players;
}

describe("Store: vollständiger Spielzyklus", () => {
  beforeEach(reset);

  it("startGame legt ein Spiel mit Status 'bidding' an", () => {
    s().startGame(["Alice", "Bob", "Carol"]);
    expect(s().game).not.toBeNull();
    expect(s().game!.status).toBe("bidding");
    expect(s().game!.players).toHaveLength(3);
  });

  it("enterBid trägt Voraussage für Spieler ein", () => {
    s().startGame(["Alice", "Bob"]);
    const alice = players()[0]!;
    s().enterBid(alice.id, 1);
    const round = selectCurrentRound(s().game);
    const ps = round!.playerScores.find((x) => x.playerId === alice.id);
    expect(ps!.predictedTricks).toBe(1);
  });

  it("advanceToPlaying wechselt zu 'playing' wenn alle geboten haben", () => {
    s().startGame(["Alice", "Bob"]);
    s().enterBid(players()[0]!.id, 0);
    s().enterBid(players()[1]!.id, 1);
    s().advanceToPlaying();
    expect(s().game!.status).toBe("playing");
  });

  it("advanceToPlaying normalisiert null-Gebote zu 0", () => {
    s().startGame(["Alice", "Bob"]);
    s().advanceToPlaying();
    const round = selectCurrentRound(s().game);
    round!.playerScores.forEach((ps) => {
      expect(ps.predictedTricks).toBe(0);
    });
  });

  it("advanceToPlaying normalisiert nur null — explizite Gebote bleiben erhalten", () => {
    s().startGame(["Alice", "Bob"]);
    s().enterBid(players()[0]!.id, 2);
    s().advanceToPlaying();
    const round = selectCurrentRound(s().game);
    expect(round!.playerScores.find((ps) => ps.playerId === players()[0]!.id)!.predictedTricks).toBe(2);
    expect(round!.playerScores.find((ps) => ps.playerId === players()[1]!.id)!.predictedTricks).toBe(0);
  });

  it("completeRound berechnet Scores und wechselt zur nächsten Runde", () => {
    s().startGame(["Alice", "Bob"]);
    const [alice, bob] = [players()[0]!, players()[1]!];

    s().enterBid(alice.id, 1);
    s().enterBid(bob.id, 0);
    s().advanceToPlaying();
    s().enterActualTricks(alice.id, 1); // Treffer 1/1 → +30
    s().enterActualTricks(bob.id, 0);   // Nullrunde 0/0 → +20
    s().completeRound();

    const game = s().game!;
    expect(game.rounds[0]!.status).toBe("complete");
    expect(game.currentRoundIndex).toBe(1);
    expect(game.status).toBe("bidding");

    const alicePs = game.rounds[0]!.playerScores.find((x) => x.playerId === alice.id);
    expect(alicePs!.score).toBe(30);
    const bobPs = game.rounds[0]!.playerScores.find((x) => x.playerId === bob.id);
    expect(bobPs!.score).toBe(20);
  });

  it("nach der letzten Runde ist das Spiel 'finished'", () => {
    s().startGame(["A", "B", "C", "D", "E", "F"]); // 6 Spieler = 10 Runden

    for (let i = 0; i < 10; i++) {
      const cardCount = i + 1; // cardCount == roundNumber
      players().forEach((p) => s().enterBid(p.id, 0));
      s().advanceToPlaying();
      // Erster Spieler bekommt alle Stiche, damit sum === cardCount
      s().enterActualTricks(players()[0]!.id, cardCount);
      players().slice(1).forEach((p) => s().enterActualTricks(p.id, 0));
      s().completeRound();
    }

    expect(s().game!.status).toBe("finished");
  });

  it("completeRound normalisiert null-Actual zu 0 und berechnet Score", () => {
    s().startGame(["Alice", "Bob", "Carol"]);
    const [alice, bob, carol] = [players()[0]!, players()[1]!, players()[2]!];

    // Runde 1 (cardCount=1): Alice sagt 1 an, Bob/Carol bleiben null (= implizit 0)
    s().enterBid(alice.id, 1);
    s().advanceToPlaying();
    s().enterActualTricks(alice.id, 1);
    // Bob und Carol bleiben null → completeRound soll auf 0 normalisieren

    s().completeRound();

    const round = s().game!.rounds[0]!;
    const bobPs = round.playerScores.find((ps) => ps.playerId === bob.id)!;
    const carolPs = round.playerScores.find((ps) => ps.playerId === carol.id)!;

    expect(bobPs.actualTricks).toBe(0);
    expect(carolPs.actualTricks).toBe(0);
    // predictedTricks=0, actual=0 → Treffer → 20 + 0*10 = 20
    expect(bobPs.score).toBe(20);
    expect(carolPs.score).toBe(20);
  });

  it("resetGame löscht das Spiel", () => {
    s().startGame(["Alice", "Bob"]);
    s().resetGame();
    expect(s().game).toBeNull();
  });

  it("abandonGame setzt game auf null und speichert lastPlayerNames", () => {
    s().startGame(["Alice", "Bob", "Carol"]);
    s().abandonGame();
    expect(s().game).toBeNull();
    expect(s().lastPlayerNames).toEqual(["Alice", "Bob", "Carol"]);
  });

  it("abandonGame ohne laufendes Spiel lässt lastPlayerNames unverändert", () => {
    useGameStore.setState({ game: null, lastPlayerNames: ["X", "Y"] });
    s().abandonGame();
    expect(s().game).toBeNull();
    expect(s().lastPlayerNames).toEqual(["X", "Y"]);
  });

  it("resetGame verändert lastPlayerNames nicht", () => {
    s().startGame(["Alice", "Bob"]);
    s().abandonGame();
    s().startGame(["Alice", "Bob"]);
    s().resetGame();
    expect(s().lastPlayerNames).toEqual(["Alice", "Bob"]);
  });
});

describe("Store: Selektoren", () => {
  beforeEach(reset);

  it("selectCurrentRound gibt null zurück wenn kein Spiel", () => {
    expect(selectCurrentRound(null)).toBeNull();
  });

  it("selectLeaderboard sortiert absteigend nach Score", () => {
    s().startGame(["Alice", "Bob"]);
    const [alice, bob] = [players()[0]!, players()[1]!];

    s().enterBid(alice.id, 1);
    s().enterBid(bob.id, 0);
    s().advanceToPlaying();
    s().enterActualTricks(alice.id, 1); // +30
    s().enterActualTricks(bob.id, 0);   // +20
    s().completeRound();

    const lb = selectLeaderboard(s().game!);
    expect(lb[0]!.player.id).toBe(alice.id);
    expect(lb[0]!.score).toBe(30);
    expect(lb[1]!.score).toBe(20);
  });

  it("selectCanAdvanceToPlaying ist true ohne jede Interaktion", () => {
    s().startGame(["Alice", "Bob"]);
    expect(selectCanAdvanceToPlaying(s().game!)).toBe(true);
  });

  it("selectCanAdvanceToPlaying ist true wenn alle geboten haben", () => {
    s().startGame(["Alice", "Bob"]);
    s().enterBid(players()[0]!.id, 0);
    s().enterBid(players()[1]!.id, 1);
    expect(selectCanAdvanceToPlaying(s().game!)).toBe(true);
  });

  it("selectAllActualsEntered ist true wenn alle eingetragen", () => {
    s().startGame(["Alice", "Bob"]);
    s().enterBid(players()[0]!.id, 0);
    s().enterBid(players()[1]!.id, 1);
    s().advanceToPlaying();
    s().enterActualTricks(players()[0]!.id, 0);
    s().enterActualTricks(players()[1]!.id, 1);
    expect(selectAllActualsEntered(s().game!)).toBe(true);
  });
});
