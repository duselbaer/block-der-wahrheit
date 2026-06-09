# Implementierungsplan: Null-Actual Default Zero

**Feature:** `null-actual-default-zero`  
**Datum:** 2026-06-09  
**Autor:** Senior-SE-Rolle  
**Input:** `doc/architecture/null-actual-default-zero.md`, `doc/decisions/ADR-007-null-actual-default-zero.md`

---

## 1. Paketübersicht

Zwei unabhängige Pakete — können von einer Person sequenziell, oder von zwei Personen parallel umgesetzt werden.

| Paket | Dateien | Abhängigkeit |
|---|---|---|
| A: Selektor | `src/store/selectors.ts` | keines |
| B: Store-Action | `src/store/gameStore.ts` | Paket A (nutzt geänderten Selektor) |
| C: Tests Selektor | `src/tests/selectors.test.ts` | Paket A |
| D: Tests Store | `src/tests/gameStore.test.ts` | Paket B |

---

## 2. Pro Paket

### Paket A — Selektor `selectAllActualsEntered`

| Feld | Inhalt |
|---|---|
| Verantwortungsbereich | Bestimmt, ob alle tatsächlichen Stiche vollständig eingetragen sind |
| Interface | `selectAllActualsEntered(game: Game): boolean` |
| Dateipfade | `src/store/selectors.ts` |
| Abhängigkeiten | keine |
| Testanforderungen | Neuer Good-Case: null-Actual + korrekter Sum → true |

**Änderung:** `selectAllActualsEntered` in `src/store/selectors.ts`:

```typescript
// VORHER
export function selectAllActualsEntered(game: Game): boolean {
  const round = selectCurrentRound(game);
  if (!round) return false;
  const allEntered = round.playerScores.every((ps) => ps.actualTricks !== null);
  if (!allEntered) return false;
  const sum = round.playerScores.reduce((s, ps) => s + (ps.actualTricks ?? 0), 0);
  return sum === round.cardCount;
}

// NACHHER
export function selectAllActualsEntered(game: Game): boolean {
  const round = selectCurrentRound(game);
  if (!round) return false;
  const sum = round.playerScores.reduce((s, ps) => s + (ps.actualTricks ?? 0), 0);
  return sum === round.cardCount;
}
```

**Begründung:** Die `!== null`-Prüfung ist redundant — `null ?? 0 = 0` fließt korrekt in die Summe ein. Einzige relevante Invariante: `∑ = cardCount`.

---

### Paket B — Store-Action `completeRound`

| Feld | Inhalt |
|---|---|
| Verantwortungsbereich | Rundenwechsel mit Normalisierung null → 0 |
| Interface | `completeRound(): void` (Store-Action) |
| Dateipfade | `src/store/gameStore.ts` |
| Abhängigkeiten | Paket A (Selektor muss angepasst sein) |
| Testanforderungen | Neuer Test: completeRound mit null-Actual setzt Score korrekt |

**Änderung:** `completeRound` in `src/store/gameStore.ts`:

```typescript
// VORHER — playerScores werden unverändert übernommen
const rounds = state.game.rounds.map((round, i) =>
  i === state.game!.currentRoundIndex
    ? { ...round, status: "complete" as const }
    : round,
);

// NACHHER — null-Actuals werden auf 0 normalisiert + Score berechnet
const rounds = state.game.rounds.map((round, i) => {
  if (i !== state.game!.currentRoundIndex) return round;
  return {
    ...round,
    status: "complete" as const,
    playerScores: round.playerScores.map((ps) => {
      if (ps.actualTricks !== null) return ps;
      const actual = 0;
      const score = ps.predictedTricks !== null
        ? calculateScore(ps.predictedTricks, actual)
        : null;
      return { ...ps, actualTricks: actual, score };
    }),
  };
});
```

**Begründung:** Normalisierung analog zu `advanceToPlaying` (ADR-005). Stellt sicher, dass nach `completeRound` keine `null`-Werte im fertigen Round-State verbleiben. Score-Berechnung ist notwendig, da `enterActualTricks` für diese Spieler nie aufgerufen wurde.

---

### Paket C — Tests Selektor

| Feld | Inhalt |
|---|---|
| Dateipfade | `src/tests/selectors.test.ts` |
| Abhängigkeiten | Paket A |
| Testanforderungen | Good-Case: null = implizit 0, Summe stimmt → true |

**Neuer Test:**
```typescript
it("ein Spieler hat null (implizit 0), Summe stimmt → true", () => {
  const game = makeGame(3, [3, null]);
  expect(selectAllActualsEntered(game)).toBe(true);
});
```

---

### Paket D — Tests Store

| Feld | Inhalt |
|---|---|
| Dateipfade | `src/tests/gameStore.test.ts` |
| Abhängigkeiten | Paket B |
| Testanforderungen | completeRound mit null-Actual: Score korrekt, actualTricks = 0 |

**Neuer Test:**
```typescript
it("completeRound normalisiert null-Actual zu 0 und berechnet Score", () => {
  s().startGame(["Alice", "Bob", "Carol"]);
  const [alice, bob, carol] = [players()[0]!, players()[1]!, players()[2]!];

  // Runde 1 (cardCount=1): Alice sagt 1 an, Bob/Carol bleiben null (= implizit 0)
  s().enterBid(alice.id, 1);
  s().advanceToPlaying();
  s().enterActualTricks(alice.id, 1); // Alice: 1 Stich

  // Bob und Carol bleiben null — completeRound soll sie auf 0 setzen
  s().completeRound();

  const round = s().game!.rounds[0]!;
  const bobPs = round.playerScores.find((ps) => ps.playerId === bob.id)!;
  const carolPs = round.playerScores.find((ps) => ps.playerId === carol.id)!;

  expect(bobPs.actualTricks).toBe(0);
  expect(carolPs.actualTricks).toBe(0);
  // predictedTricks=0, actual=0 → Treffer → 20 + 0*10 = 20
  expect(bobPs.score).toBe(20);
  expect(carolPs.score).toBe(20);
});
```

---

## 3. Umsetzungsreihenfolge

```
[A] selectors.ts ──► [C] selectors.test.ts
                │
                └──► [B] gameStore.ts ──► [D] gameStore.test.ts
```

Empfohlene Reihenfolge für eine Person: A → C → B → D
