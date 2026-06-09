"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createGame } from "@/domain/gameFactory";
import { calculateScore } from "@/domain/scoreEngine";
import { selectCurrentRound, selectAllBidsEntered, selectAllActualsEntered } from "./selectors";
import type { Game } from "@/domain/types";

interface GameStore {
  game: Game | null;
  startGame: (playerNames: string[]) => void;
  enterBid: (playerId: string, predicted: number) => void;
  advanceToPlaying: () => void;
  enterActualTricks: (playerId: string, actual: number) => void;
  completeRound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,

      startGame: (playerNames) => {
        const game = createGame(playerNames);
        set({ game: { ...game, status: "bidding" } });
      },

      enterBid: (playerId, predicted) => {
        set((state) => {
          if (!state.game) return state;
          const rounds = state.game.rounds.map((round, i) => {
            if (i !== state.game!.currentRoundIndex) return round;
            return {
              ...round,
              playerScores: round.playerScores.map((ps) =>
                ps.playerId === playerId ? { ...ps, predictedTricks: predicted } : ps,
              ),
            };
          });
          return { game: { ...state.game, rounds } };
        });
      },

      advanceToPlaying: () => {
        set((state) => {
          if (!state.game) return state;
          if (!selectAllBidsEntered(state.game)) return state;
          const rounds = state.game.rounds.map((round, i) => {
            if (i !== state.game!.currentRoundIndex) return round;
            return {
              ...round,
              status: "playing" as const,
              playerScores: round.playerScores.map((ps) => ({
                ...ps,
                predictedTricks: ps.predictedTricks ?? 0,
              })),
            };
          });
          return { game: { ...state.game, rounds, status: "playing" } };
        });
      },

      enterActualTricks: (playerId, actual) => {
        set((state) => {
          if (!state.game) return state;
          const rounds = state.game.rounds.map((round, i) => {
            if (i !== state.game!.currentRoundIndex) return round;
            return {
              ...round,
              playerScores: round.playerScores.map((ps) => {
                if (ps.playerId !== playerId) return ps;
                const score =
                  ps.predictedTricks !== null
                    ? calculateScore(ps.predictedTricks, actual)
                    : null;
                return { ...ps, actualTricks: actual, score };
              }),
            };
          });
          return { game: { ...state.game, rounds } };
        });
      },

      completeRound: () => {
        set((state) => {
          if (!state.game) return state;
          if (!selectAllActualsEntered(state.game)) return state;

          const nextIndex = state.game.currentRoundIndex + 1;
          const isLastRound = nextIndex >= state.game.rounds.length;

          const rounds = state.game.rounds.map((round, i) =>
            i === state.game!.currentRoundIndex ? { ...round, status: "complete" as const } : round,
          );

          return {
            game: {
              ...state.game,
              rounds,
              currentRoundIndex: isLastRound ? state.game.currentRoundIndex : nextIndex,
              status: isLastRound ? "finished" : "bidding",
            },
          };
        });
      },

      resetGame: () => {
        set({ game: null });
      },
    }),
    {
      name: "wizard-game-store",
      version: 1,
    },
  ),
);
