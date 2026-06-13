"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useGameNavigation } from "@/hooks/useGameNavigation";
import { selectCurrentRound, selectCanAdvanceToPlaying, selectAllActualsEntered, selectRemainingActualTricks } from "@/store/selectors";
import { calculateHitScore, calculateMissScore } from "@/domain/scoreEngine";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CounterButton } from "@/components/ui/CounterButton";
import { RoundHeader } from "@/components/game/RoundHeader";
import { ScoreTable } from "@/components/game/ScoreTable";

export default function GamePage() {
  const router = useRouter();
  const game = useGameNavigation();
  const enterBid = useGameStore((s) => s.enterBid);
  const advanceToPlaying = useGameStore((s) => s.advanceToPlaying);
  const enterActualTricks = useGameStore((s) => s.enterActualTricks);
  const completeRound = useGameStore((s) => s.completeRound);
  const abandonGame = useGameStore((s) => s.abandonGame);

  function handleAbandon() {
    if (!window.confirm("Spiel wirklich beenden? Der aktuelle Spielstand geht verloren.")) return;
    abandonGame();
    router.push("/");
  }

  if (!game || game.status === "finished" || game.status === "setup") return null;

  const round = selectCurrentRound(game);
  if (!round) return null;

  const allBidsDone = selectCanAdvanceToPlaying(game);
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
            const ps = round.playerScores.find((s) => s.playerId === player.id);
            if (!ps) return null;
            return (
              <div key={player.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="flex-1 font-medium text-slate-800">{player.name}</span>
                <div className="flex items-center gap-2">
                  <CounterButton
                    onClick={() => enterBid(player.id, Math.max(0, (ps.predictedTricks ?? 0) - 1))}
                    aria-label={`${player.name} Ansage um 1 reduzieren`}
                  >
                    −
                  </CounterButton>
                  <span className="w-10 text-center text-xl font-bold tabular-nums text-slate-900">
                    {ps.predictedTricks ?? 0}
                  </span>
                  <CounterButton
                    onClick={() => enterBid(player.id, Math.min(round.cardCount, (ps.predictedTricks ?? 0) + 1))}
                    aria-label={`${player.name} Ansage um 1 erhöhen`}
                  >
                    +
                  </CounterButton>
                </div>
              </div>
            );
          })}
          <PrimaryButton onClick={advanceToPlaying} disabled={!allBidsDone} className="mt-2">
            Runde spielen
          </PrimaryButton>
        </div>
      )}

      {game.status === "playing" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Wie viele Stiche hattest du?</h2>
          {game.players.map((player) => {
            const ps = round.playerScores.find((s) => s.playerId === player.id);
            if (!ps) return null;
            const predicted = ps.predictedTricks ?? 0;
            const currentActual = ps.actualTricks ?? 0;
            const remaining = selectRemainingActualTricks(game, player.id);
            return (
              <div key={player.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="font-medium text-slate-800">{player.name}</span>
                    <span className="ml-2 text-sm text-slate-400">Ansage: {predicted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CounterButton
                      onClick={() => enterActualTricks(player.id, Math.max(0, currentActual - 1))}
                      disabled={currentActual <= 0}
                      aria-label={`${player.name} Stiche um 1 reduzieren`}
                    >
                      −
                    </CounterButton>
                    <span className="w-10 text-center text-xl font-bold tabular-nums text-slate-900">
                      {currentActual}
                    </span>
                    <CounterButton
                      onClick={() => enterActualTricks(player.id, Math.min(remaining, currentActual + 1))}
                      disabled={currentActual >= remaining}
                      aria-label={`${player.name} Stiche um 1 erhöhen`}
                    >
                      +
                    </CounterButton>
                  </div>
                </div>
                {ps.actualTricks !== null && (
                  <div className="mt-2 text-sm">
                    {ps.actualTricks === predicted ? (
                      <span className="font-semibold text-emerald-600">
                        Treffer! +{calculateHitScore(predicted)} Punkte
                      </span>
                    ) : (
                      <span className="font-semibold text-red-600">
                        Daneben − {calculateMissScore(predicted, ps.actualTricks)} Punkte
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <PrimaryButton variant="emerald" onClick={completeRound} disabled={!allActualsDone} className="mt-2">
            Runde abschliessen
          </PrimaryButton>
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

      <PrimaryButton variant="red-outline" onClick={handleAbandon} className="py-3 text-base">
        Spiel beenden
      </PrimaryButton>
    </div>
  );
}
