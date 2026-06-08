# Implementierungsplan: Stich-Summen-Validierung

**Feature:** `actual-tricks-sum-validation`  
**Datum:** 2026-06-09  
**Autor:** Senior-SE-Rolle

---

## 1. Paketübersicht

Zwei unabhängige Pakete; Paket B hängt von A ab.

| # | Paket | Dateien | Abhängigkeit |
|---|-------|---------|-------------|
| A | Selektoren | `src/store/selectors.ts` | keines |
| B | UI-Komponente | `src/app/game/page.tsx` | A |

Da nur 2 Pakete, kann Paket A allein entwickelt und getestet werden, bevor B
integriert wird.

---

## 2. Paket A — Selektoren

### Verantwortungsbereich
Berechnung des erlaubten Maximums pro Spieler und Prüfung der Summen-Invariante.

### Interfaces / öffentliche API

```ts
// src/store/selectors.ts

/**
 * Wie viele Stiche darf dieser Spieler noch eintragen?
 * = cardCount minus Summe der bereits eingetragenen Stiche der anderen Spieler.
 */
export function selectRemainingActualTricks(game: Game, playerId: string): number

/**
 * true wenn: alle actualTricks !== null UND sum === cardCount
 * Ersetzt die bisherige Prüfung in selectAllActualsEntered.
 */
export function selectAllActualsEntered(game: Game): boolean  // Signatur unverändert, Logik erweitert
```

### Implementierungsdetail

```ts
export function selectRemainingActualTricks(game: Game, playerId: string): number {
  const round = selectCurrentRound(game);
  if (!round) return 0;
  const othersSum = round.playerScores
    .filter((ps) => ps.playerId !== playerId && ps.actualTricks !== null)
    .reduce((sum, ps) => sum + (ps.actualTricks ?? 0), 0);
  return Math.max(0, round.cardCount - othersSum);
}

// selectAllActualsEntered: zusätzlich sum === cardCount prüfen
export function selectAllActualsEntered(game: Game): boolean {
  const round = selectCurrentRound(game);
  if (!round) return false;
  const allEntered = round.playerScores.every((ps) => ps.actualTricks !== null);
  if (!allEntered) return false;
  const sum = round.playerScores.reduce((s, ps) => s + (ps.actualTricks ?? 0), 0);
  return sum === round.cardCount;
}
```

### Dateipfade
- `src/store/selectors.ts` (bestehend, erweitern)

### Testanforderungen
- `selectRemainingActualTricks`: Alle Stiche vergeben → 0 für letzten Spieler
- `selectRemainingActualTricks`: Kein anderer hat Stiche → cardCount
- `selectRemainingActualTricks`: Teilweise vergeben → Restbetrag korrekt
- `selectAllActualsEntered`: Summe korrekt → true
- `selectAllActualsEntered`: Summe falsch trotz aller eingetragen → false
- `selectAllActualsEntered`: Nicht alle eingetragen → false

---

## 3. Paket B — UI game/page.tsx

### Verantwortungsbereich
Verwendung von `selectRemainingActualTricks` als Obergrenze für den
`+`-Button der tatsächlichen Stiche in der `playing`-Phase.

### Änderung (game/page.tsx, Zeile ~107)

**Vorher:**
```tsx
onClick={() =>
  enterActualTricks(player.id, Math.min(round.cardCount, (ps.actualTricks ?? 0) + 1))
}
```

**Nachher:**
```tsx
onClick={() => {
  const remaining = selectRemainingActualTricks(game, player.id);
  const max = (ps.actualTricks ?? 0) + remaining;
  enterActualTricks(player.id, Math.min(max, (ps.actualTricks ?? 0) + 1));
}}
```

Vereinfacht: Da `remaining = cardCount - othersSum` und der aktuelle Spieler
noch nicht bei anderen gezählt wird, ist `max = actualTricks + remaining`:

```tsx
onClick={() => {
  const max = (ps.actualTricks ?? 0) + selectRemainingActualTricks(game, player.id);
  enterActualTricks(player.id, Math.min(max, (ps.actualTricks ?? 0) + 1));
}}
```

### Dateipfade
- `src/app/game/page.tsx` (bestehend, 1 Zeile ändern)

### Testanforderungen
Kein separater Unit-Test nötig — das Verhalten wird durch die Selektor-Tests
abgedeckt. Manuelle Verifikation: Sicherstellen, dass + blockiert, wenn alle
Stiche verteilt.

---

## 4. Umsetzungsreihenfolge

```
1. [A] selectRemainingActualTricks implementieren
2. [A] selectAllActualsEntered erweitern
3. [A] Tests schreiben und grün machen
4. [B] game/page.tsx anpassen
5. Manuelle Verifikation im Browser
```

---

## 5. Nicht im Scope

- Store-Reducer anpassen (kein Mehrwert ohne Backend)
- Gebote-Phase (bids können cardCount überschreiten — Spielregel)
- Setup-Seite oder Abschluss-Seite
