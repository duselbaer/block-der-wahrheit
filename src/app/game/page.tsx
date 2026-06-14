"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useGameNavigation } from "@/hooks/useGameNavigation";
import { selectCurrentRound, selectCanAdvanceToPlaying, selectAllActualsEntered } from "@/store/selectors";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { RoundHeader } from "@/components/game/RoundHeader";
import { ScoreTable } from "@/components/game/ScoreTable";
import { BiddingPhase } from "@/components/game/BiddingPhase";
import { PlayingPhase } from "@/components/game/PlayingPhase";

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

  return (
    <div className="flex flex-col gap-6">
      <RoundHeader
        roundNumber={round.roundNumber}
        totalRounds={game.rounds.length}
        cardCount={round.cardCount}
      />

      {game.status === "bidding" && (
        <BiddingPhase
          game={game}
          round={round}
          canAdvance={selectCanAdvanceToPlaying(game)}
          onBidChange={enterBid}
          onAdvance={advanceToPlaying}
        />
      )}

      {game.status === "playing" && (
        <PlayingPhase
          game={game}
          round={round}
          canComplete={selectAllActualsEntered(game)}
          onActualChange={enterActualTricks}
          onComplete={completeRound}
        />
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
