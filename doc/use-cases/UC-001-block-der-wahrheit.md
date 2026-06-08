# UC-001: Block der Wahrheit – Wizard-Spielprotokoll

**Status:** abgeschlossen  
**Datum:** 2026-06-08  
**Autor:** Dokumentenschreiber-Rolle

---

## Beschreibung

Dieser Use-Case beschreibt die vollständige Funktionalität der Web-App „Block der Wahrheit". Die App ersetzt den physischen Notizblock im Kartenspiel **Wizard**: Sie protokolliert für jede Runde die Stich-Voraussagen aller Spieler, nimmt nach der Runde die tatsächlichen Stiche auf und berechnet automatisch die Punkte.

Die App richtet sich an 2–6 Spieler, die Wizard physisch am Tisch spielen und einen digitalen Spielleiter für die Punktebuchhaltung wünschen. Es ist keine Spielsimulation — Karten, Trümpfe und Stiche werden weiterhin am Tisch gespielt.

---

## Akteure

- **Spielleiter** (bedient die App; kann ein beliebiger Spieler sein)
- **Spieler** (deren Namen und Punkte verwaltet werden; 2–6 Personen)

---

## Ablauf

### Schritt 1: Startseite
Der Spielleiter öffnet die App. Falls ein gespeichertes Spiel im Browser vorhanden ist, erscheint ein Button „Spiel fortsetzen". Alternativ kann „Neues Spiel starten" gewählt werden (löscht den vorherigen Spielstand).

### Schritt 2: Spieler-Setup
Der Spielleiter gibt die Namen aller Spieler ein (mindestens 2, maximal 6). Die App zeigt an, wie viele Runden gespielt werden:

| Spieleranzahl | Runden |
|---------------|--------|
| 2             | 30     |
| 3             | 20     |
| 4             | 15     |
| 5             | 12     |
| 6             | 10     |

Mit „Spiel starten" wird der erste Stich-Voraussage-Bildschirm geöffnet.

### Schritt 3: Stich-Voraussagen (vor jeder Runde)
Für jede neue Runde zeigt die App an:
- Runde X von Y
- Wie viele Karten jeder Spieler erhält (= Rundennummer)

Der Spielleiter trägt für jeden Spieler ein, wie viele Stiche dieser zu machen gedenkt (Voraussage: 0 bis Kartenanzahl). Erst wenn alle Spieler ihre Voraussage eingetragen haben, wird die Runde freigegeben.

### Schritt 4: Runde spielen
Die Spieler spielen die Runde physisch am Tisch. Die App bleibt auf einem Wartebildschirm (oder der Spielleiter schließt das Display).

### Schritt 5: Ergebnisse eintragen (nach jeder Runde)
Der Spielleiter trägt ein, wie viele Stiche jeder Spieler tatsächlich gemacht hat. Die App berechnet sofort die Punkte:

| Situation | Formel |
|-----------|--------|
| Voraussage exakt getroffen | `+20 + (Stiche × 10)` |
| Voraussage verfehlt | `–10 × \|Ist – Soll\|` |

**Beispiel:** Voraussage 3, tatsächlich 3 → **+50 Punkte**  
**Beispiel:** Voraussage 3, tatsächlich 5 → **–20 Punkte**

Nach der Eingabe wird die Gesamtpunktetabelle angezeigt (alle Spieler, alle bisherigen Runden).

### Schritt 6: Nächste Runde oder Spielende
- Falls weitere Runden offen sind: weiter mit Schritt 3 (nächste Runde)
- Nach der letzten Runde: Die App zeigt die Abschlussrangliste mit dem Sieger

### Schritt 7: Spielende
Die Abschlussrangliste zeigt alle Spieler nach Gesamtpunkten sortiert. Der Spielleiter kann „Neues Spiel starten" wählen.

---

## Designentscheidungen

- [ADR-001](../decisions/ADR-001-nextjs-t3-ohne-backend.md): Next.js T3-Stack ohne Backend — Prototyp läuft vollständig im Browser, kein Server, kein Datenbank-Setup nötig
- [ADR-002](../decisions/ADR-002-zustand-localstorage.md): Zustand als State-Manager — Spielstand wird automatisch im Browser-localStorage gespeichert, überlebt Browser-Refresh

---

## Technische Übersicht (für Entwickler)

### Projektstruktur

```
src/
├── domain/
│   ├── types.ts            # Game, Player, Round, PlayerRoundScore, Status-Enums
│   ├── scoreEngine.ts      # calculateScore(), calculateTotalRounds(), aggregatePlayerScore()
│   └── gameFactory.ts      # createGame(), createRound()
├── store/
│   ├── gameStore.ts        # Zustand-Store mit persist-Middleware
│   └── selectors.ts        # selectCurrentRound, selectLeaderboard, ...
├── components/
│   ├── ui/                 # Button, Input, Card, Badge (generisch)
│   └── game/               # PlayerNameInput, BidInput, ActualInput, ScoreTable, ...
└── app/
    ├── page.tsx             # Startseite
    ├── game/setup/          # Spieler-Setup
    ├── game/bidding/        # Voraussagen
    ├── game/playing/        # Wartebildschirm
    ├── game/results/        # Ergebnisse + Zwischenstand
    └── finished/            # Abschlussrangliste
```

### State-Fluss

```
null (kein Spiel)
  → [startGame]
'setup'
  → [Spieler eingegeben, starten]
'bidding'
  → [alle Voraussagen eingetragen]
'playing'
  → [alle Ergebnisse eingetragen, completeRound]
'bidding' (nächste Runde) → ... → 'finished'
```

### localStorage-Schlüssel

`wizard-game-store` (Schema-Version 1 — bei Version-Mismatch wird der Store automatisch zurückgesetzt)

---

## Teststatus

### Unit-Tests

| Unit | Good-Case | Weitere Tests |
|------|-----------|---------------|
| `calculateScore` – Treffer | ✅ | Grenzfall 0/0 → +20 |
| `calculateScore` – zu hoch/niedrig | ✅ | Alle Differenz-Varianten |
| `calculateTotalRounds` | ✅ | 2, 3, 4, 5, 6 Spieler |
| `aggregatePlayerScore` | ✅ | Leeres Spiel → 0 |
| `createGame` | ✅ | Min. (2) und Max. (6) Spieler |
| `createRound` | ✅ | Alle PlayerScores initial `null` |
| Store-Selektoren | ✅ | Sortierung, Null-Fälle |

### Use-Case-Tests

| Szenario | Status | Anmerkung |
|----------|--------|-----------|
| Vollständiger Spielzyklus (Store-Level) | ✅ | startGame → Runden → finished |
| localStorage-Round-Trip | ✅ | Serialize → Deserialize → State gleich |
| Reset schlägt Spiel zurück | ✅ | State nach reset → null |
| Gesamt-Score 5-Runden-Spiel | ✅ | Bekannte Eingaben → bekannter Output |

### Fehlende Tests und Begründung

| Test | Begründung |
|------|------------|
| UI-Komponenten-Tests (PlayerNameInput etc.) | Keine eigene Geschäftslogik; pure Render-Komponenten. Manueller Browser-Test ausreichend für Prototypen. |
| E2E-Playwright-Test | Aufwand zu hoch für Prototyp; empfohlen für v1.0 |
| `useGameNavigation`-Test als Routing-Test | Aktuell als pure Funktion geplant → Unit-Test ausreichend |

---

## Bekannte Schwachstellen und Risiken

- **Gerätegebunden:** Spielstand liegt im localStorage des Browsers — kein Sync zwischen Geräten oder Nutzern möglich
- **Datenverlust:** Browsercache leeren oder Private-Mode zerstören den Spielstand
- **SSR-Hydration:** Zustand muss als Client-Only-Store konfiguriert sein; serverseitiges Rendering darf nicht auf `window.localStorage` zugreifen (Gefahr: Hydration-Mismatch)
- **Keine Validierung der Gesamtstiche pro Runde:** Wizard-Regelung, dass die Summe aller Voraussagen ≠ Kartenzahl sein muss, wird nicht geprüft (optionale spätere Erweiterung)

---

## Nächste Schritte

1. T3-Projektgerüst aufsetzen (`create-t3-app`, tRPC/Prisma deaktivieren)
2. Score Engine implementieren und Unit-Tests schreiben (Test-Driven)
3. Zustand-Store implementieren, Use-Case-Tests schreiben
4. UI-Komponenten bauen, manuell im Browser verifizieren
5. Seiten verknüpfen und vollständiges Spiel durchspielen
6. Auf Vercel deployen
