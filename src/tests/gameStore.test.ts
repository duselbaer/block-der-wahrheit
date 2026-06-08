import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/gameStore";
import {
  selectCurrentRound,
  selectLeaderboard,
  selectAllBidsEntered,
  selectAllActualsEntered,
} from "@/store/selectors";
import type { Player } from "@/domain/types";

function s() {
  return useGameStore.getState();
}

function reset() {
  useGameStore.setState({ game: null });
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

  it("advanceToPlaying tut nichts wenn Voraussagen fehlen", () => {
    s().startGame(["Alice", "Bob"]);
    s().enterBid(players()[0]!.id, 1);
    s().advanceToPlaying();
    expect(s().game!.status).toBe("bidding");
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
      players().forEach((p) => s().enterBid(p.id, 0));
      s().advanceToPlaying();
      players().forEach((p) => s().enterActualTricks(p.id, 0));
      s().completeRound();
    }

    expect(s().game!.status).toBe("finished");
  });

  it("resetGame löscht das Spiel", () => {
    s().startGame(["Alice", "Bob"]);
    s().resetGame();
    expect(s().game).toBeNull();
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

  it("selectAllBidsEntered ist false wenn Bids fehlen", () => {
    s().startGame(["Alice", "Bob"]);
    s().enterBid(players()[0]!.id, 0);
    expect(selectAllBidsEntered(s().game!)).toBe(false);
  });

  it("selectAllBidsEntered ist true wenn alle geboten haben", () => {
    s().startGame(["Alice", "Bob"]);
    s().enterBid(players()[0]!.id, 0);
    s().enterBid(players()[1]!.id, 1);
    expect(selectAllBidsEntered(s().game!)).toBe(true);
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
