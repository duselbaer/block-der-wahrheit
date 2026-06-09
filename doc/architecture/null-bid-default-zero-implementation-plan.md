# Implementierungsplan: Leere Vorhersage zählt als 0

**Feature:** `null-bid-default-zero`  
**Datum:** 2026-06-09  
**Autor:** Senior-SE-Rolle

---

## Paketübersicht

Das Feature berührt zwei unabhängige Schichten, die parallel bearbeitet werden können:

| Paket | Dateipfad | Abhängigkeiten |
|-------|-----------|----------------|
| A – Selektor | `src/store/selectors.ts` | keine |
| B – Store | `src/store/gameStore.ts` | Paket A (liest Selektor) |
| C – Tests | `src/tests/gameStore.test.ts`, `src/tests/selectors.test.ts` | A + B |

---

## Paket A — Selektor: `selectAllBidsEntered`

| Feld | Inhalt |
|------|--------|
| Verantwortungsbereich | Gibt an, ob alle Spieler ein Gebot abgegeben haben |
| Interface | `selectAllBidsEntered(game: Game): boolean` |
| Dateipfade | `src/store/selectors.ts` |
| Abhängigkeiten | keine |
| Testanforderungen | Good-Case: gibt `true` zurück, wenn alle `null` (implizit 0); gibt `true` bei explizit eingetragenen Werten |

### Änderung

```ts
// vorher
export function selectAllBidsEntered(game: Game): boolean {
  const round = selectCurrentRound(game);
  if (!round) return false;
  return round.playerScores.every((ps) => ps.predictedTricks !== null);
}

// nachher
export function selectAllBidsEntered(game: Game): boolean {
  const round = selectCurrentRound(game);
  return round !== null;
}
```

`null` zählt als gültiges implizites Gebot von `0`. Die Schaltfläche ist aktiv, sobald eine gültige Runde vorliegt.

---

## Paket B — Store: `advanceToPlaying`

| Feld | Inhalt |
|------|--------|
| Verantwortungsbereich | Übergang `bidding → playing`, inklusive Normalisierung der Gebote |
| Interface | `advanceToPlaying(): void` |
| Dateipfade | `src/store/gameStore.ts` |
| Abhängigkeiten | Paket A (`selectAllBidsEntered`) |
| Testanforderungen | Good-Case: `null`-Gebote werden zu `0`; Status wechselt zu `playing` |

### Änderung

In `advanceToPlaying` vor dem `status`-Wechsel alle `null`-Gebote auf `0` normalisieren:

```ts
advanceToPlaying: () => {
  set((state) => {
    if (!state.game) return state;
    if (!selectAllBidsEntered(state.game)) return state;
    const rounds = state.game.rounds.map((round, i) => {
      if (i !== state.game!.currentRoundIndex) return round;
      return {
        ...round,
        status: "playing" as const,
        playerScores: round.playerScores.map((ps) => ({
          ...ps,
          predictedTricks: ps.predictedTricks ?? 0,
        })),
      };
    });
    return { game: { ...state.game, rounds, status: "playing" } };
  });
},
```

---

## Paket C — Tests

| Feld | Inhalt |
|------|--------|
| Verantwortungsbereich | Korrektheit der geänderten Logik sicherstellen |
| Dateipfade | `src/tests/gameStore.test.ts`, `src/tests/selectors.test.ts` |
| Abhängigkeiten | Pakete A + B |
| Testanforderungen | Bestehende Tests anpassen; neue Good-Cases für Null-Default ergänzen |

### Anzupassende Tests

**`gameStore.test.ts`:**
- `"advanceToPlaying tut nichts wenn Voraussagen fehlen"` → **entfernen** (Verhalten existiert nicht mehr)
- `"selectAllBidsEntered ist false wenn Bids fehlen"` → **anpassen**: gibt jetzt `true` zurück, wenn Runde existiert

**Neue Tests:**
- `"advanceToPlaying normalisiert null-Gebote zu 0"`
- `"selectAllBidsEntered ist true auch ohne explizite Gebote"`

---

## Umsetzungsreihenfolge

```
Paket A (Selektor) → Paket B (Store) → Paket C (Tests)
```

A muss zuerst fertig sein, damit B den angepassten Selektor nutzen kann. Tests laufen zuletzt.

---

## Nicht geändert

- Domain-Typ `PlayerRoundScore.predictedTricks: number | null` bleibt unverändert.
- `actualTricks`-Logik ist nicht betroffen.
- UI-Komponente in `game/page.tsx` benötigt keine Änderung (Button ist ohnehin mit `disabled={!allBidsDone}` gebunden — dieser Wert ist jetzt immer `true`).
