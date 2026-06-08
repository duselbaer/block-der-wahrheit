"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

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
          <button
            onClick={handleContinue}
            className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
          >
            Spiel fortsetzen
            <span className="ml-2 text-sm font-normal text-indigo-200">
              ({game.players.map((p) => p.name).join(", ")})
            </span>
          </button>
        )}
        <button
          onClick={handleNewGame}
          className="w-full rounded-xl border-2 border-indigo-200 bg-white px-6 py-4 text-lg font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-400 active:scale-95"
        >
          Neues Spiel starten
        </button>
      </div>
    </div>
  );
}
