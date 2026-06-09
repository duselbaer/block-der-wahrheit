# Implementierungsplan: abandon-game

**Feature:** Spiel während des Spiels beenden  
**Datum:** 2026-06-09  
**Referenz:** [abandon-game.md](abandon-game.md), [ADR-008](../decisions/ADR-008-abandon-game-last-player-names.md)

---

## 1. Paketübersicht

Das Feature besteht aus drei klar abgegrenzten Paketen, die von zwei Entwicklern parallel umgesetzt werden können:

| Paket | Inhalt | Abhängigkeiten |
|-------|--------|----------------|
| P1 — Store-Erweiterung | `lastPlayerNames` + `abandonGame()` | keine |
| P2 — Game-Page-Button | "Spiel beenden"-Button + Navigation | P1 |
| P3 — Setup-Page-Vorausfüllen | Lesen von `lastPlayerNames` im Setup | P1 |

P2 und P3 können parallel umgesetzt werden, sobald P1 abgeschlossen ist.

---

## 2. Pro Paket

### P1 — Store-Erweiterung (`src/store/gameStore.ts`)

| Feld | Inhalt |
|------|--------|
| Verantwortungsbereich | Neue Action `abandonGame()`, neues State-Feld `lastPlayerNames` |
| Interface | `abandonGame(): void`, `lastPlayerNames: string[]` |
| Dateipfade | `src/store/gameStore.ts` |
| Abhängigkeiten | keine |
| Testanforderungen | Unit-Test: `abandonGame()` speichert Namen und setzt `game: null` |

**Konkrete Änderungen:**

```typescript
// Neue Felder im Interface
interface GameStore {
  // ...bestehend...
  lastPlayerNames: string[];
  abandonGame: () => void;
}

// Implementierung
lastPlayerNames: [],

abandonGame: () => {
  set((state) => ({
    lastPlayerNames: state.game?.players.map((p) => p.name) ?? state.lastPlayerNames,
    game: null,
  }));
},
```

Der bestehende `version`-Wert des `persist`-Adapters wird von `1` auf `2` erhöht, damit der neue Key `lastPlayerNames` korrekt initialisiert wird (ohne Migration bricht der Store für bestehende Nutzer nicht, Zustand ignoriert unbekannte Keys).

---

### P2 — Game-Page-Button (`src/app/game/page.tsx`)

| Feld | Inhalt |
|------|--------|
| Verantwortungsbereich | "Spiel beenden"-Button mit Bestätigungs-Dialog, Navigation zur Startseite |
| Interface | Keine neue öffentliche API; reiner UI-Baustein |
| Dateipfade | `src/app/game/page.tsx` |
| Abhängigkeiten | P1 (`abandonGame` aus Store) |
| Testanforderungen | Kein Unit-Test (UI-Logik); manueller Test ausreichend |

**Konkrete Änderungen:**

- `abandonGame` aus dem Store abonnieren
- Button "Spiel beenden" am unteren Rand der Seite einfügen (unterhalb Scorecard)
- Vor dem Abbruch einen `window.confirm()`-Dialog anzeigen ("Spiel wirklich beenden?"), um versehentliche Klicks zu verhindern
- Nach Bestätigung: `abandonGame()` aufrufen, dann `router.push("/")`

```tsx
const abandonGame = useGameStore((s) => s.abandonGame);

function handleAbandon() {
  if (!window.confirm("Spiel wirklich beenden? Der aktuelle Spielstand geht verloren.")) return;
  abandonGame();
  router.push("/");
}

// Im JSX, nach dem ScoreTable-Block:
<button
  onClick={handleAbandon}
  className="w-full rounded-xl border-2 border-red-200 bg-white px-6 py-3 text-base font-semibold text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50 active:scale-95"
>
  Spiel beenden
</button>
```

---

### P3 — Setup-Page-Vorausfüllen (`src/app/game/setup/page.tsx`)

| Feld | Inhalt |
|------|--------|
| Verantwortungsbereich | Initialisierung von `names` aus `lastPlayerNames` des Stores |
| Interface | Keine neue öffentliche API; reiner UI-Baustein |
| Dateipfade | `src/app/game/setup/page.tsx` |
| Abhängigkeiten | P1 (`lastPlayerNames` aus Store) |
| Testanforderungen | Unit-Test: `lastPlayerNames` werden korrekt als Startwert übernommen |

**Konkrete Änderungen:**

```tsx
// Neu: lastPlayerNames aus Store lesen
const lastPlayerNames = useGameStore((s) => s.lastPlayerNames);

// Geändert: useState-Initialwert
const [names, setNames] = useState<string[]>(() => {
  if (lastPlayerNames.length >= 2) return lastPlayerNames;
  return ["", ""];
});
```

Der `useState`-Initializer läuft nur einmal beim Mount — kein Re-Render-Problem.

---

## 3. Umsetzungsreihenfolge

```
Phase 1 (alleine):
  └── P1: Store-Erweiterung (gameStore.ts)
      - lastPlayerNames: string[] hinzufügen
      - abandonGame() implementieren
      - version: 2 setzen

Phase 2 (parallel):
  ├── P2: Game-Page-Button (game/page.tsx)
  └── P3: Setup-Page-Vorausfüllen (setup/page.tsx)
```

---

## 4. Betroffene Dateien (Zusammenfassung)

| Datei | Änderungsart |
|-------|-------------|
| `src/store/gameStore.ts` | Erweiterung (lastPlayerNames, abandonGame, version: 2) |
| `src/app/game/page.tsx` | Erweiterung (Button + Handler) |
| `src/app/game/setup/page.tsx` | Erweiterung (useState-Initialwert) |
| `src/tests/gameStore.test.ts` | Neuer Test für abandonGame |
