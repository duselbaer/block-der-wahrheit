"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createGame } from "@/domain/gameFactory";
import { calculateScore } from "@/domain/scoreEngine";
import { selectCanAdvanceToPlaying, selectAllActualsEntered } from "./selectors";
import type { Game, Round } from "@/domain/types";

interface GameStore {
  game: Game | null;
  lastPlayerNames: string[];
  startGame: (playerNames: string[]) => void;
  enterBid: (playerId: string, predicted: number) => void;
  advanceToPlaying: () => void;
  enterActualTricks: (playerId: string, actual: number) => void;
  completeRound: () => void;
  resetGame: () => void;
  abandonGame: () => void;
}

function updateCurrentRound(game: Game, fn: (round: Round) => Round): Game {
  return {
    ...game,
    rounds: game.rounds.map((r, i) => (i === game.currentRoundIndex ? fn(r) : r)),
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: null,
      lastPlayerNames: [],

      startGame: (playerNames) => {
        const game = createGame(playerNames);
        set({ game: { ...game, status: "bidding" } });
      },

      enterBid: (playerId, predicted) => {
        set((state) => {
          if (!state.game) return state;
          return {
            game: updateCurrentRound(state.game, (round) => ({
              ...round,
              playerScores: round.playerScores.map((ps) =>
                ps.playerId === playerId ? { ...ps, predictedTricks: predicted } : ps,
              ),
            })),
          };
        });
      },

      advanceToPlaying: () => {
        set((state) => {
          if (!state.game) return state;
          if (!selectCanAdvanceToPlaying(state.game)) return state;
          return {
            game: {
              ...updateCurrentRound(state.game, (round) => ({
                ...round,
                status: "playing" as const,
                playerScores: round.playerScores.map((ps) => ({
                  ...ps,
                  predictedTricks: ps.predictedTricks ?? 0,
                })),
              })),
              status: "playing",
            },
          };
        });
      },

      enterActualTricks: (playerId, actual) => {
        set((state) => {
          if (!state.game) return state;
          return {
            game: updateCurrentRound(state.game, (round) => ({
              ...round,
              playerScores: round.playerScores.map((ps) => {
                if (ps.playerId !== playerId) return ps;
                const score =
                  ps.predictedTricks !== null
                    ? calculateScore(ps.predictedTricks, actual)
                    : null;
                return { ...ps, actualTricks: actual, score };
              }),
            })),
          };
        });
      },

      completeRound: () => {
        set((state) => {
          if (!state.game) return state;
          if (!selectAllActualsEntered(state.game)) return state;

          const nextIndex = state.game.currentRoundIndex + 1;
          const isLastRound = nextIndex >= state.game.rounds.length;

          const updated = updateCurrentRound(state.game, (round) => ({
            ...round,
            status: "complete" as const,
            playerScores: round.playerScores.map((ps) => {
              if (ps.actualTricks !== null) return ps;
              const actual = 0;
              const score =
                ps.predictedTricks !== null ? calculateScore(ps.predictedTricks, actual) : null;
              return { ...ps, actualTricks: actual, score };
            }),
          }));

          return {
            game: {
              ...updated,
              currentRoundIndex: isLastRound ? state.game.currentRoundIndex : nextIndex,
              status: isLastRound ? "finished" : "bidding",
            },
          };
        });
      },

      resetGame: () => {
        set({ game: null });
      },

      abandonGame: () => {
        set((state) => ({
          lastPlayerNames: state.game?.players.map((p) => p.name) ?? state.lastPlayerNames,
          game: null,
        }));
      },
    }),
    {
      name: "wizard-game-store",
      version: 2,
    },
  ),
);
