"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { calculateTotalRounds } from "@/domain/scoreEngine";

export default function SetupPage() {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);
  const [names, setNames] = useState<string[]>(["", ""]);

  const validNames = names.map((n) => n.trim()).filter((n) => n.length > 0);
  const canStart = validNames.length >= 2;
  const totalRounds = canStart ? calculateTotalRounds(validNames.length) : null;

  function addPlayer() {
    if (names.length < 6) setNames([...names, ""]);
  }

  function removePlayer(index: number) {
    if (names.length > 2) setNames(names.filter((_, i) => i !== index));
  }

  function updateName(index: number, value: string) {
    setNames(names.map((n, i) => (i === index ? value : n)));
  }

  function handleStart() {
    if (!canStart) return;
    startGame(validNames);
    router.push("/game");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Spieler eintragen</h1>
        <p className="mt-1 text-slate-500">2 bis 6 Spieler</p>
      </div>

      <div className="flex flex-col gap-3">
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 text-center text-sm font-medium text-slate-400">{i + 1}.</span>
            <input
              type="text"
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder={`Spieler ${i + 1}`}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {names.length > 2 && (
              <button
                onClick={() => removePlayer(i)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Spieler entfernen"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {names.length < 6 && (
        <button
          onClick={addPlayer}
          className="self-start rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
        >
          + Spieler hinzufügen
        </button>
      )}

      {totalRounds && (
        <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          {validNames.length} Spieler → <strong>{totalRounds} Runden</strong>
        </p>
      )}

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
      >
        Spiel starten
      </button>
    </div>
  );
}
