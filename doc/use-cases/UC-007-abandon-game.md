# UC-007: Spiel abbrechen

**Status:** abgeschlossen  
**Datum:** 2026-06-09  
**Autor:** Dokumentenschreiber-Rolle

---

## Beschreibung

Während einer laufenden Spielrunde soll ein Spieler jederzeit die Möglichkeit haben, das aktuelle Spiel vorzeitig zu beenden. Nach dem Abbruch wird er zur Startseite geleitet. Beim nächsten Aufruf der Spieler-Setup-Seite sind die zuletzt verwendeten Spielernamen bereits vorausgefüllt, um erneutes manuelles Eintippen zu vermeiden.

Dieser Use-Case ist relevant für Situationen, in denen ein Spiel unterbrochen werden muss (z. B. ein Spieler muss früher gehen) oder eine neue Konfiguration gewünscht wird.

---

## Akteure

- **Spieler** (am Gerät): Interagiert mit dem UI und löst den Abbruch aus

---

## Ablauf

1. Der Spieler befindet sich auf der Spiel-Seite (`/game`) — entweder in der Ansage- oder der Spielphase.
2. Der Spieler klickt den Button **„Spiel beenden"** (roter Button, unterhalb der Punktetafel).
3. Ein Bestätigungsdialog erscheint: *„Spiel wirklich beenden? Der aktuelle Spielstand geht verloren."*
4. Der Spieler bestätigt den Abbruch.
5. Der Store führt `abandonGame()` aus:
   - Die Spielernamen des aktuellen Spiels werden in `lastPlayerNames` gespeichert.
   - Das Spiel (`game`) wird auf `null` gesetzt.
   - Beide Werte werden im `localStorage` persistiert.
6. Der Spieler wird zur Startseite (`/`) weitergeleitet.
7. Wenn der Spieler auf der Startseite **„Neues Spiel starten"** klickt und zur Setup-Seite (`/game/setup`) navigiert, sind die Namenfelder mit den zuletzt verwendeten Spielernamen vorausgefüllt.
8. Der Spieler kann die Namen anpassen oder direkt das neue Spiel starten.

---

## Designentscheidungen

- [ADR-008](../decisions/ADR-008-abandon-game-last-player-names.md): Trennung von `abandonGame()` (speichert Namen) und `resetGame()` (verwirft alles) sowie Persistenz von `lastPlayerNames` im Store

---

## Teststatus

### Unit-Tests

| Unit | Good-Case | Weitere Tests |
|------|-----------|---------------|
| `abandonGame()` setzt `game: null` | ✅ | Edge-Case: Aufruf ohne laufendes Spiel |
| `abandonGame()` speichert `lastPlayerNames` | ✅ | Edge-Case: `game: null` → `lastPlayerNames` bleibt unverändert |
| `resetGame()` ändert `lastPlayerNames` nicht | ✅ | Regressionstest |
| Setup-Page initialisiert `names` aus `lastPlayerNames` | ⚠️ | Kein Unit-Test — manuell geprüft (kein Testing-Library-Setup) |

### Use-Case-Tests

| Szenario | Status | Anmerkung |
|----------|--------|-----------|
| Abbruch in Ansagephase (bidding) | ✅ | Store-Test |
| Abbruch in Spielphase (playing) | ✅ | Store-Test |
| Abbruch ohne laufendes Spiel | ✅ | Store-Test, Fehlerfall |
| Namen nach Abbruch auf Setup-Seite vorausgefüllt | ✅ | Manueller Smoke-Test |

### Fehlende Tests und Begründung

| Test | Begründung |
|------|------------|
| Render-Test Setup-Page mit vorausgefüllten Namen | Kein React Testing Library im Projekt; Aufwand für Einrichtung nicht verhältnismäßig für diesen einfachen Fall |
| `window.confirm`-Interaktion | Browser-nativer Dialog; nicht sinnvoll in Unit-Tests mockbar ohne erheblichen Setup-Aufwand |

---

## Bekannte Schwachstellen und Risiken

- **`window.confirm()` auf Mobile**: Auf manchen mobilen Browsern kann der native Dialog optisch unschön wirken. Falls ein benutzerdefinierter Dialog gewünscht wird, wäre das ein separates Feature.
- **`lastPlayerNames` bleibt nach `resetGame()`**: Wenn ein Spieler über „Neues Spiel starten" ein komplett neues Spiel mit anderen Spielern starten möchte, sieht er dennoch die alten Namen vorausgefüllt. Dies ist bewusstes Verhalten (Komfort), kann aber als überraschend wahrgenommen werden. Eine "Namen löschen"-Schaltfläche in der Setup-Seite könnte das adressieren.
- **Store-Version**: Der `persist`-Adapter wurde von `version: 1` auf `version: 2` erhöht. Nutzer mit gecachtem Store der Version 1 erhalten `lastPlayerNames: []` als Initialwert — kein Datenverlust, aber kein Vorausfüllen beim ersten Mal nach Update.
