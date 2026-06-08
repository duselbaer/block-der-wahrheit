# Implementierungsplan: Block der Wahrheit

**Basis:** [Architekturdokumentation](./block-der-wahrheit.md)  
**Datum:** 2026-06-08

---

## 1. Paketübersicht

Die App ist in **5 unabhängige Pakete** aufgeteilt, die von einem Team parallel entwickelt werden können:

| # | Paket | Verzeichnis | Abhängigkeiten |
|---|-------|-------------|----------------|
| A | Domain-Typen & Score Engine | `src/domain/` | keine |
| B | Zustand-Store (State + Persistenz) | `src/store/` | A |
| C | UI-Komponenten (atomar) | `src/components/` | A |
| D | Feature-Seiten (Next.js Pages) | `src/app/` | B, C |
| E | Projektgerüst (T3 Init, Config) | Root + `src/` | keine |

---

## 2. Paket-Details

### Paket A — Domain-Typen & Score Engine

| Feld | Inhalt |
|------|--------|
| **Verantwortung** | Alle TypeScript-Interfaces, Typen und pure Berechnungsfunktionen |
| **Interface (public API)** | `types.ts` (re-exportiert alle Interfaces), `scoreEngine.ts` (Berechnungsfunktionen) |
| **Dateipfade** | `src/domain/types.ts`, `src/domain/scoreEngine.ts`, `src/domain/gameFactory.ts` |
| **Abhängigkeiten** | keine |
| **Testanforderungen** | Unit-Tests für `scoreEngine.ts` und `gameFactory.ts` |

```typescript
// src/domain/types.ts
export interface Game { ... }
export interface Player { ... }
export interface Round { ... }
export interface PlayerRoundScore { ... }
export type GameStatus = 'setup' | 'bidding' | 'playing' | 'finished';
export type RoundStatus = 'bidding' | 'playing' | 'complete';

// src/domain/scoreEngine.ts
export function calculateScore(predicted: number, actual: number): number
export function calculateTotalRounds(playerCount: number): number
export function aggregatePlayerScore(game: Game, playerId: string): number

// src/domain/gameFactory.ts
export function createGame(playerNames: string[]): Game
export function createRound(roundNumber: number, players: Player[]): Round
```

---

### Paket B — Zustand-Store

| Feld | Inhalt |
|------|--------|
| **Verantwortung** | Globaler App-State, alle Mutationen, localStorage-Persistenz |
| **Interface (public API)** | `useGameStore` Hook mit klar definierten Actions |
| **Dateipfade** | `src/store/gameStore.ts`, `src/store/selectors.ts` |
| **Abhängigkeiten** | Paket A (Domain-Typen), `zustand` npm-Paket |
| **Testanforderungen** | Use-Case-Tests für alle Store-Actions |

```typescript
// src/store/gameStore.ts
interface GameStore {
  // State
  game: Game | null;
  
  // Actions
  startGame(playerNames: string[]): void;
  enterBid(playerId: string, predicted: number): void;
  advanceToPlaying(): void;
  enterActualTricks(playerId: string, actual: number): void;
  completeRound(): void;
  resetGame(): void;
}

// src/store/selectors.ts
export function selectCurrentRound(game: Game): Round | null
export function selectPlayerTotalScore(game: Game, playerId: string): number
export function selectLeaderboard(game: Game): Array<{player: Player, score: number}>
export function selectAllBidsEntered(game: Game): boolean
export function selectAllActualsEntered(game: Game): boolean
```

---

### Paket C — UI-Komponenten

| Feld | Inhalt |
|------|--------|
| **Verantwortung** | Wiederverwendbare React-Komponenten ohne Geschäftslogik |
| **Interface (public API)** | Props-Interfaces für jede Komponente |
| **Dateipfade** | `src/components/ui/` (shadcn-Basis), `src/components/game/` (domänenspezifisch) |
| **Abhängigkeiten** | Paket A (nur Typen), Tailwind CSS |
| **Testanforderungen** | Keine automatisierten Tests (visuelle Komponenten); manuelle Verifikation |

```
src/components/
├── ui/                        # generische UI-Bausteine (shadcn/ui oder Tailwind-only)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Badge.tsx
└── game/                      # domänenspezifische Komponenten
    ├── PlayerNameInput.tsx    # Eingabe eines Spielernamens (mit Add/Remove)
    ├── BidInput.tsx           # Stich-Voraussage für einen Spieler
    ├── ActualInput.tsx        # Tatsächliche Stiche nach der Runde
    ├── ScoreTable.tsx         # Gesamtpunktetabelle (alle Spieler, alle Runden)
    ├── RoundHeader.tsx        # Rundeninfo: Runde X von Y, Z Karten
    └── LeaderboardRow.tsx     # Eine Zeile in der Abschlussrangliste
```

---

### Paket D — Feature-Seiten (Next.js App Router)

| Feld | Inhalt |
|------|--------|
| **Verantwortung** | Next.js-Seiten und -Layouts; koordiniert Store und Komponenten |
| **Interface (public API)** | URL-Routen |
| **Dateipfade** | `src/app/` |
| **Abhängigkeiten** | Pakete B (Store) und C (Komponenten) |
| **Testanforderungen** | E2E-Smoke-Test für den Hauptfluss |

```
src/app/
├── layout.tsx                 # Root-Layout (Tailwind, Metadaten)
├── page.tsx                   # Startseite: Neues Spiel / Spiel fortsetzen
├── game/
│   ├── setup/
│   │   └── page.tsx           # Spieler-Setup (Namen eingeben)
│   ├── bidding/
│   │   └── page.tsx           # Voraussagen für aktuelle Runde
│   ├── playing/
│   │   └── page.tsx           # Stiche eintragen nach der Runde
│   └── results/
│       └── page.tsx           # Zwischenstand / Rundenabschluss
└── finished/
    └── page.tsx               # Abschlussrangliste
```

**Navigation (clientseitig):**
- Store-Status steuert den Redirect: `status === 'bidding'` → `/game/bidding` usw.
- Ein zentraler `GameGuard`-Hook in `src/hooks/useGameNavigation.ts` übernimmt die Weiterleitung.

---

### Paket E — Projektgerüst & Konfiguration

| Feld | Inhalt |
|------|--------|
| **Verantwortung** | T3-Stack-Initialisierung, Tooling-Konfiguration |
| **Interface (public API)** | — |
| **Dateipfade** | `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`, `.env.example` |
| **Abhängigkeiten** | keine |
| **Testanforderungen** | `tsc --noEmit` muss fehlerfrei durchlaufen |

**Abhängigkeiten (npm):**
```
next@14, react@18, react-dom@18
typescript, @types/react, @types/node
tailwindcss, postcss, autoprefixer
zustand
zod
uuid, @types/uuid
```

---

## 3. Umsetzungsreihenfolge

### Phase 1 — Parallel (kein gegenseitiger Block)
| Entwickler | Aufgabe |
|------------|---------|
| Dev 1      | Paket E: Projektgerüst aufsetzen (`create-t3-app` ohne tRPC/Prisma) |
| Dev 2      | Paket A: Domain-Typen und Score Engine implementieren + Unit-Tests schreiben |

### Phase 2 — Parallel (nach Phase 1)
| Entwickler | Aufgabe |
|------------|---------|
| Dev 1      | Paket B: Zustand-Store implementieren |
| Dev 2      | Paket C: UI-Basiskomponenten aufbauen (PlayerNameInput, BidInput, ActualInput, ScoreTable) |

### Phase 3 — Integration (nach Phase 2)
| Entwickler | Aufgabe |
|------------|---------|
| Dev 1      | Paket D: Seiten verknüpfen (Setup → Bidding → Playing → Results → Finished) |
| Dev 2      | Paket D: Navigation und GameGuard implementieren |

### Phase 4 — Abschluss
- Manuelle End-to-End-Verifikation (komplettes Spiel mit 3 Spielern durchspielen)
- `vercel deploy` und Smoke-Test auf Preview-URL

---

## 4. Kritische Interfaces (müssen vor Implementierung festgelegt sein)

1. **`Game`-Interface** (Paket A) — Basis für Store und alle Komponenten
2. **`useGameStore`-Hook-Signatur** (Paket B) — Komponenten binden sich daran
3. **Routing-Konvention** (Paket D) — welche URL korrespondiert zu welchem Status

---

## 5. Qualitätssicherung

- **TypeScript strict mode** aktiviert (`tsconfig.json`)
- **Zod** validiert Formular-Eingaben (Spielernamen: min 1 Zeichen, Stiche: 0 ≤ n ≤ cardCount)
- **localStorage-Schlüssel:** `wizard-game-store` (Version 1)
- **Schema-Migration:** Zustand `version: 1` – bei Inkompatibilität wird der Store zurückgesetzt und der Nutzer informiert
