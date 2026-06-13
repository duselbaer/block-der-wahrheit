"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function Home() {
  const router = useRouter();
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);

  function handleNewGame() {
    resetGame();
    router.push("/game/setup");
  }

  function handleContinue() {
    if (!game) return;
    if (game.status === "finished") {
      router.push("/finished");
    } else {
      router.push("/game");
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 pt-10">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Block der Wahrheit
        </h1>
        <p className="mt-2 text-slate-500">Punktetafel für das Kartenspiel Wizard</p>
      </div>

      <div className="flex w-full flex-col gap-3">
        {game && game.status !== "setup" && (
          <PrimaryButton onClick={handleContinue}>
            Spiel fortsetzen
            <span className="ml-2 text-sm font-normal text-indigo-200">
              ({game.players.map((p) => p.name).join(", ")})
            </span>
          </PrimaryButton>
        )}
        <PrimaryButton variant="secondary" onClick={handleNewGame}>
          Neues Spiel starten
        </PrimaryButton>
      </div>
    </div>
  );
}
