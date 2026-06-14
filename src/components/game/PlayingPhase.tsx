import type { Game, Round } from "@/domain/types";
import { selectRemainingActualTricks } from "@/store/selectors";
import { calculateHitScore, calculateMissScore } from "@/domain/scoreEngine";
import { CounterButton } from "@/components/ui/CounterButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface Props {
  game: Game;
  round: Round;
  canComplete: boolean;
  onActualChange: (playerId: string, value: number) => void;
  onComplete: () => void;
}

export function PlayingPhase({ game, round, canComplete, onActualChange, onComplete }: Props) {
  return (
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
                  onClick={() => onActualChange(player.id, Math.max(0, currentActual - 1))}
                  disabled={currentActual <= 0}
                  aria-label={`${player.name} Stiche um 1 reduzieren`}
                >
                  −
                </CounterButton>
                <span className="w-10 text-center text-xl font-bold tabular-nums text-slate-900">
                  {currentActual}
                </span>
                <CounterButton
                  onClick={() => onActualChange(player.id, Math.min(remaining, currentActual + 1))}
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
      <PrimaryButton variant="emerald" onClick={onComplete} disabled={!canComplete} className="mt-2">
        Runde abschliessen
      </PrimaryButton>
    </div>
  );
}
