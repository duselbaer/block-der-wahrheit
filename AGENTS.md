# AGENTS.md — Block der Wahrheit

Dieses Dokument beschreibt Projektkonventionen, Architektur und Entwicklungsregeln für KI-Agenten (Claude Code, Codex, Copilot o. Ä.), die in diesem Repository arbeiten.

---

## Projekt-Überblick

**Block der Wahrheit** ist eine digitale Punktetafel für das Kartenspiel *Wizard*.  
Keine Backend-Anbindung – der Spielstand lebt ausschließlich im Browser (`localStorage`).

| Eigenschaft    | Wert                                             |
|----------------|--------------------------------------------------|
| Framework      | Next.js 16 (App Router)                          |
| Sprache        | TypeScript (strict)                              |
| Styling        | Tailwind CSS                                     |
| State          | Zustand 5 mit `persist`-Middleware               |
| Validierung    | Zod 4                                            |
| Tests          | Vitest                                           |
| Node           | ≥ 24                                             |
| Deployment     | Vercel (statisch, kein Server-Side-Rendering)    |

---

## Spielregeln (Domänenwissen)

- **Spieler:** 2–6
- **Rundenzahl:** `Math.floor(60 / Spieleranzahl)`
- **Punkte bei Treffer:** `+20 + Stiche × 10`
- **Punkte bei Verfehlung:** `-10 × |Ist – Soll|`

---

## Verzeichnisstruktur

```
src/
  app/              # Next.js App-Router-Seiten
    page.tsx        # Startseite (Spieler-Setup)
    game/
      page.tsx      # Spielrunden-Ansicht
      setup/
        page.tsx    # Runden-Setup (Gebote)
    finished/
      page.tsx      # Spielergebnis
  components/
    game/           # Wiederverwendbare UI-Komponenten
  domain/
    types.ts        # Domänen-Typen (Game, Player, Round …)
    scoreEngine.ts  # Pure Scoring-Funktionen
    gameFactory.ts  # Fabrik-Funktionen für Spiel-Objekte
  hooks/            # React Custom Hooks
  store/
    gameStore.ts    # Zustand-Store (mit localStorage-Persistenz)
    selectors.ts    # Abgeleitete Zustände (keine Logik im UI)
  tests/            # Vitest-Testdateien (Unit)
doc/
  architecture/     # Architektur-Dokumente & Implementierungspläne
  decisions/        # ADRs
  use-cases/        # Use-Case-Beschreibungen
```

---

## Architektur-Entscheidungen

| ADR | Entscheidung |
|-----|-------------|
| ADR-001 | Next.js ohne tRPC/Prisma – reiner Frontend-Prototyp |
| ADR-002 | Zustand + localStorage statt Server-State |

Vollständige ADRs: `doc/decisions/`

---

## Entwicklungsregeln

### Implementierungsreihenfolge

1. **Score Engine** (`src/domain/`) – pure Funktionen, voll getestet
2. **Store** (`src/store/`) – Zustand + Selektoren
3. **UI-Komponenten** (`src/components/game/`)
4. **Seiten** (`src/app/`)

### Code-Stil

- Keine Kommentare, die das *Was* erklären – nur das *Warum*, wenn nicht offensichtlich
- Keine unnötige Abstraktion, keine vorzeitigen Generalisierungen
- Keine Error-Handler für unmögliche Fälle
- Validierung nur an Systemgrenzen (Nutzereingaben), nicht intern
- Keine Backwards-Compatibility-Hacks

### Tests

- Unit-Tests für alle Domänen-Funktionen (`scoreEngine`, `gameFactory`, `gameStore`)
- Keine Datenbank-Mocks nötig (kein Backend)
- Testdateien liegen unter `src/tests/`

### Commits & Branches

Dieses Projekt folgt **Conventional Commits**:

```
feat:     neue Funktion
fix:      Fehlerbehebung
docs:     nur Dokumentation
refactor: Umstrukturierung ohne Funktionsänderung
test:     Tests
chore:    Tooling, Abhängigkeiten
```

Branch-Schema: `<type>/<kurze-beschreibung-in-kebab-case>`

---

## Wichtige Skripte

```bash
npm run dev        # Entwicklungsserver starten
npm run build      # Produktions-Build
npm run typecheck  # TypeScript prüfen (tsc --noEmit)
npm run lint       # ESLint
npm run test       # Vitest (einmalig)
npm run test:watch # Vitest (watch)
```

---

## Persistenz-Details

- localStorage-Schlüssel: `wizard-game-store`
- Kein Server, kein API-Endpunkt
- Spielstand ist gerätegebunden
