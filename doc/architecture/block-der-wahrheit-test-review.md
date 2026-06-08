# Test-Review: Block der Wahrheit

**Basis:** [Implementierungsplan](./block-der-wahrheit-implementation-plan.md)  
**Datum:** 2026-06-08

---

## 1. Unit-Test-Review

### Paket A — Score Engine (`src/domain/scoreEngine.ts`)

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `calculateScore(predicted, actual)` – Treffer (3/3) | ✅ | `calculateScore(3, 3)` → `50` |
| `calculateScore(predicted, actual)` – Treffer (0/0) | ✅ | `calculateScore(0, 0)` → `20` (Nullrunde!) |
| `calculateScore(predicted, actual)` – zu hoch (3/5) | ✅ | `calculateScore(3, 5)` → `-20` |
| `calculateScore(predicted, actual)` – zu niedrig (5/2) | ✅ | `calculateScore(5, 2)` → `-30` |
| `calculateTotalRounds(playerCount)` – 3 Spieler | ✅ | `calculateTotalRounds(3)` → `20` |
| `calculateTotalRounds(playerCount)` – 2 Spieler | ✅ | `calculateTotalRounds(2)` → `30` |
| `calculateTotalRounds(playerCount)` – 6 Spieler | ✅ | `calculateTotalRounds(6)` → `10` |
| `aggregatePlayerScore(game, playerId)` – mehrere Runden | ✅ | Summe aus abgeschlossenen Runden |
| `aggregatePlayerScore(game, playerId)` – keine abgeschlossenen Runden | ✅ | Ergebnis: `0` |

**⚠️ Fehlender Test: Grenzfall `predicted < 0`**  
Begründung: Die Zod-Validierung im Frontend blockiert negative Werte. Ein Unit-Test der Engine bei negativen Eingaben ist dennoch sinnvoll, da die Engine ohne Validierungs-Schicht aufgerufen werden könnte. → **Empfehlung: Defensive-Guard-Test hinzufügen.**

### Paket A — Game Factory (`src/domain/gameFactory.ts`)

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `createGame(playerNames)` – 3 Spieler | ✅ | Gibt `Game` mit Status `setup`, 3 Playern zurück |
| `createGame(playerNames)` – 2 Spieler (Minimum) | ✅ | Grenzfall: min. Spielerzahl |
| `createGame(playerNames)` – 6 Spieler (Maximum) | ✅ | Grenzfall: max. Spielerzahl |
| `createRound(roundNumber, players)` | ✅ | `playerScores` korrekt initialisiert (alle `null`) |

### Paket B — Store-Selektoren (`src/store/selectors.ts`)

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `selectCurrentRound` – Runde 1 | ✅ | Gibt erstes Round-Objekt zurück |
| `selectCurrentRound` – kein Spiel | ✅ | Gibt `null` zurück |
| `selectLeaderboard` – sortiert | ✅ | Absteigende Reihenfolge nach Gesamtpunkten |
| `selectAllBidsEntered` – alle eingetragen | ✅ | `true` wenn alle `predictedTricks !== null` |
| `selectAllBidsEntered` – einer fehlt | ✅ | `false` |
| `selectAllActualsEntered` – alle eingetragen | ✅ | Analog zu Bids |

### Paket C — UI-Komponenten

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `PlayerNameInput` | ❌ | Visuelle Komponente — kein automatisierter Test geplant. Verifikation manuell im Browser. |
| `BidInput` | ❌ | Gleiches Argument: pure Darstellung mit onChange-Callback |
| `ActualInput` | ❌ | Gleiches Argument |
| `ScoreTable` | ❌ | Gleiches Argument; Snapshot-Test optional |

**Begründung für fehlende UI-Komponenten-Tests:** Die Komponenten enthalten keine eigene Geschäftslogik — sie rendern nur Props. Die Logik liegt in Paket A und B. Snapshot-Tests würden bei jeder Styling-Änderung brechen und keinen echten Mehrwert liefern.

---

## 2. Use-Case-Test-Review

| Use-Case-Test | Sinnvoll? | Begründung |
|---------------|-----------|------------|
| **Store: Vollständiger Spielzyklus** (startGame → enterBid × N → advanceToPlaying → enterActualTricks × N → completeRound → … → letzteRunde → finished) | ✅ | Testet das Zusammenspiel aller Store-Actions in realistischer Reihenfolge. Kein Testcontainer nötig (pure In-Memory-Store). |
| **Store: Spielstand nach localStorage-Round-Trip** (Store befüllen → serialisieren → deserialisieren → State prüfen) | ✅ | Sichert Persistenz-Korrektheit ab. Wichtig, weil Typ-Fehler bei (De-)Serialisierung runtime-only sind. Ohne diesen Test könnten subtile Schema-Fehler unentdeckt bleiben. |
| **Store: Reset schlägt aktives Spiel zurück** (Spiel starten → reset → State ist `null`) | ✅ | Sichert kritische UX-Entscheidung ab: kein veralteter State nach Reset. |
| **Score: Gesamtspiel-Scoreberechnung** (3 Spieler, 5 Runden, bekannte Eingaben → erwarteter Gesamtscore) | ✅ | End-to-End-Verifikation der Score-Logik mit realistischen Daten. Ersetzt das manuelle Nachrechnen. |
| **Navigation: GameGuard** (Store-Status → erwartete URL-Weiterleitung) | ⚠️ | Sinnvoll als Unit-Test für den `useGameNavigation`-Hook (kann ohne Browser getestet werden). Als echter Routing-Test im Browser zu aufwändig für den Prototypen. → **Empfehlung: useGameNavigation als pure Funktion implementieren und unit-testen.** |

---

## 3. Empfehlungen

### Kritisch — muss implementiert werden

1. **`scoreEngine.test.ts` zuerst schreiben** (Test-Driven, da die Score-Logik das Herzstück ist)
   - Risikopriorisierung: Ein Fehler hier betrifft jeden Spielstand, jede Runde
   - Besonders der Grenzfall `predictedTricks = 0, actualTricks = 0` → `+20` ist kontraintuitiv

2. **Store-Use-Case-Test: localStorage-Round-Trip**
   - In Next.js (SSR) kann `window.localStorage` undefiniert sein — der Store muss client-only initialisiert werden. Dieser Test deckt Hydration-Fehler auf.

### Empfohlen — sollte implementiert werden

3. **`createGame`-Factory: UUID-Kollisionstest**
   - Zwei aufeinander folgende `createGame`-Aufrufe dürfen nicht dieselbe ID erzeugen

4. **Selektoren: `selectLeaderboard`-Sortierungstest mit Gleichstand**
   - Bei Punktegleichstand: stabile Sortierung? Alphabetisch? → Verhalten dokumentieren und testen

### Optional — für spätere Iterationen

5. **Playwright E2E-Smoke-Test:** Komplettes Spiel in 3 Runden durchklicken und Endpunktestand verifizieren
6. **Snapshot-Tests für `ScoreTable`:** Nur wenn das Layout stabil ist

---

## 4. Risikopriorisierung

| Risiko | Wahrscheinlichkeit | Auswirkung | Test |
|--------|--------------------|------------|------|
| Falsche Score-Berechnung (Nullrunde) | Mittel | Hoch | `scoreEngine.test.ts` |
| localStorage-Deserialisation bricht State | Niedrig | Hoch | Store-Round-Trip-Test |
| Falsche Rundenzahl bei 2 Spielern | Niedrig | Mittel | `gameFactory.test.ts` |
| Hydration-Fehler (SSR + localStorage) | Mittel | Mittel | Store-Use-Case-Test |
