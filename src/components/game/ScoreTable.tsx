"use client";

import type { Game } from "@/domain/types";
import { aggregatePlayerScore } from "@/domain/scoreEngine";

interface Props {
  game: Game;
}

export function ScoreTable({ game }: Props) {
  const completedRounds = game.rounds.filter((r) => r.status === "complete");

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="py-3 pl-4 pr-3 text-left font-semibold text-slate-700">Spieler</th>
            {completedRounds.map((r) => (
              <th
                key={r.roundNumber}
                className="px-2 py-3 text-center font-semibold text-slate-700"
              >
                R{r.roundNumber}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-semibold text-slate-900">Gesamt</th>
          </tr>
        </thead>
        <tbody>
          {game.players.map((player, pi) => {
            const total = aggregatePlayerScore(game, player.id);
            return (
              <tr
                key={player.id}
                className={pi % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <td className="py-2 pl-4 pr-3 font-medium text-slate-800">{player.name}</td>
                {completedRounds.map((round) => {
                  const ps = round.playerScores.find((s) => s.playerId === player.id);
                  const score = ps?.score ?? 0;
                  return (
                    <td
                      key={round.roundNumber}
                      className={`px-2 py-2 text-center tabular-nums ${score >= 0 ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {score > 0 ? `+${score}` : score}
                    </td>
                  );
                })}
                <td className="px-4 py-2 text-right font-bold tabular-nums text-slate-900">
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
