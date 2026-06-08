"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { selectLeaderboard } from "@/store/selectors";
import { ScoreTable } from "@/components/game/ScoreTable";

export default function FinishedPage() {
  const router = useRouter();
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);

  useEffect(() => {
    if (!game) router.replace("/");
  }, [game, router]);

  if (!game) return null;

  const leaderboard = selectLeaderboard(game);
  const winner = leaderboard[0]!;

  function handleNewGame() {
    resetGame();
    router.push("/game/setup");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-amber-400 px-5 py-6 text-center shadow-md">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-800">Sieger</p>
        <h2 className="mt-1 text-3xl font-extrabold text-white">{winner.player.name}</h2>
        <p className="mt-1 text-lg font-bold text-amber-900">{winner.score} Punkte</p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Abschlussrangliste
        </h3>
        {leaderboard.map((entry) => (
          <div
            key={entry.player.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <span className="text-xl font-bold text-slate-300">#{entry.rank}</span>
            <span className="flex-1 font-medium text-slate-800">{entry.player.name}</span>
            <span className="text-xl font-bold tabular-nums text-slate-900">{entry.score}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Alle Runden
        </h3>
        <ScoreTable game={game} />
      </div>

      <button
        onClick={handleNewGame}
        className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
      >
        Neues Spiel starten
      </button>
    </div>
  );
}
