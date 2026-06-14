import type { Game, Round } from "@/domain/types";
import { CounterButton } from "@/components/ui/CounterButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface Props {
  game: Game;
  round: Round;
  canAdvance: boolean;
  onBidChange: (playerId: string, value: number) => void;
  onAdvance: () => void;
}

export function BiddingPhase({ game, round, canAdvance, onBidChange, onAdvance }: Props) {
  return (
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
                onClick={() => onBidChange(player.id, Math.max(0, (ps.predictedTricks ?? 0) - 1))}
                aria-label={`${player.name} Ansage um 1 reduzieren`}
              >
                −
              </CounterButton>
              <span className="w-10 text-center text-xl font-bold tabular-nums text-slate-900">
                {ps.predictedTricks ?? 0}
              </span>
              <CounterButton
                onClick={() => onBidChange(player.id, Math.min(round.cardCount, (ps.predictedTricks ?? 0) + 1))}
                aria-label={`${player.name} Ansage um 1 erhöhen`}
              >
                +
              </CounterButton>
            </div>
          </div>
        );
      })}
      <PrimaryButton onClick={onAdvance} disabled={!canAdvance} className="mt-2">
        Runde spielen
      </PrimaryButton>
    </div>
  );
}
