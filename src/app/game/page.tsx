"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { selectCurrentRound, selectAllBidsEntered, selectAllActualsEntered, selectRemainingActualTricks } from "@/store/selectors";
import { RoundHeader } from "@/components/game/RoundHeader";
import { ScoreTable } from "@/components/game/ScoreTable";

export default function GamePage() {
  const router = useRouter();
  const game = useGameStore((s) => s.game);
  const enterBid = useGameStore((s) => s.enterBid);
  const advanceToPlaying = useGameStore((s) => s.advanceToPlaying);
  const enterActualTricks = useGameStore((s) => s.enterActualTricks);
  const completeRound = useGameStore((s) => s.completeRound);

  useEffect(() => {
    if (!game) router.replace("/");
    else if (game.status === "finished") router.replace("/finished");
  }, [game, router]);

  if (!game || game.status === "finished" || game.status === "setup") return null;

  const round = selectCurrentRound(game);
  if (!round) return null;

  const allBidsDone = selectAllBidsEntered(game);
  const allActualsDone = selectAllActualsEntered(game);

  return (
    <div className="flex flex-col gap-6">
      <RoundHeader
        roundNumber={round.roundNumber}
        totalRounds={game.rounds.length}
        cardCount={round.cardCount}
      />

      {game.status === "bidding" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Wie viele Stiche machst du?</h2>
          {game.players.map((player) => {
            const ps = round.playerScores.find((s) => s.playerId === player.id)!;
            return (
              <div key={player.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="flex-1 font-medium text-slate-800">{player.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      enterBid(player.id, Math.max(0, (ps.predictedTricks ?? 0) - 1))
                    }
                    className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-xl font-bold tabular-nums text-slate-900">
                    {ps.predictedTricks ?? 0}
                  </span>
                  <button
                    onClick={() =>
                      enterBid(player.id, Math.min(round.cardCount, (ps.predictedTricks ?? 0) + 1))
                    }
                    className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          <button
            onClick={advanceToPlaying}
            disabled={!allBidsDone}
            className="mt-2 w-full rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-40 active:scale-95"
          >
            Runde spielen
          </button>
        </div>
      )}

      {game.status === "playing" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Wie viele Stiche hattest du?</h2>
          {game.players.map((player) => {
            const ps = round.playerScores.find((s) => s.playerId === player.id)!;
            const predicted = ps.predictedTricks ?? 0;
            return (
              <div key={player.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="font-medium text-slate-800">{player.name}</span>
                    <span className="ml-2 text-sm text-slate-400">Ansage: {predicted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        enterActualTricks(player.id, Math.max(0, (ps.actualTricks ?? 0) - 1))
                      }
                      className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-xl font-bold tabular-nums text-slate-900">
                      {ps.actualTricks ?? 0}
                    </span>
                    <button
                      onClick={() =>
                        enterActualTricks(
                          player.id,
                          Math.min(
                            (ps.actualTricks ?? 0) + selectRemainingActualTricks(game, player.id),
                            (ps.actualTricks ?? 0) + 1,
                          ),
                        )
                      }
                      className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
                {ps.actualTricks !== null && (
                  <div className="mt-2 text-sm">
                    {ps.actualTricks === predicted ? (
                      <span className="font-semibold text-emerald-600">
                        Treffer! +{20 + predicted * 10} Punkte
                      </span>
                    ) : (
                      <span className="font-semibold text-red-500">
                        Daneben − {10 * Math.abs((ps.actualTricks ?? 0) - predicted)} Punkte
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={completeRound}
            disabled={!allActualsDone}
            className="mt-2 w-full rounded-xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-40 active:scale-95"
          >
            Runde abschliessen
          </button>
        </div>
      )}

      {game.rounds.some((r) => r.status === "complete") && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Zwischenstand
          </h3>
          <ScoreTable game={game} />
        </div>
      )}
    </div>
  );
}
