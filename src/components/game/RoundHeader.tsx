interface Props {
  roundNumber: number;
  totalRounds: number;
  cardCount: number;
}

export function RoundHeader({ roundNumber, totalRounds, cardCount }: Props) {
  return (
    <div className="rounded-xl bg-indigo-600 px-5 py-4 text-white shadow-md">
      <p className="text-xs font-medium uppercase tracking-widest text-indigo-200">
        Runde {roundNumber} von {totalRounds}
      </p>
      <h2 className="mt-1 text-2xl font-bold">
        {cardCount} {cardCount === 1 ? "Karte" : "Karten"} pro Spieler
      </h2>
    </div>
  );
}
