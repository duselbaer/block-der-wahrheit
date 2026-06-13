# Test-Review: abandon-game

**Feature:** Spiel während des Spiels beenden  
**Datum:** 2026-06-09  
**Referenz:** [abandon-game-implementation-plan.md](abandon-game-implementation-plan.md)

---

## 1. Unit-Test-Review

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `gameStore.abandonGame()` setzt `game: null` | ✅ | Pflicht-Test; einfach implementierbar |
| `gameStore.abandonGame()` speichert `lastPlayerNames` | ✅ | Kernverhalten des Features; separater Assertions-Block im selben Test |
| `gameStore.abandonGame()` bei `game: null` | ✅ | Edge-Case: `lastPlayerNames` bleibt unverändert (kein Überschreiben mit leerem Array) |
| `setupPage` initialisiert `names` aus `lastPlayerNames` | ⚠️ | UI-Komponente; kein Unit-Test sinnvoll, da `useState`-Initialwert — manueller Test ausreichend |
| `gameStore.resetGame()` ändert `lastPlayerNames` nicht | ✅ | Regressionstest: bestehende Funktion muss `lastPlayerNames` unberührt lassen |

**Begründung für fehlenden Unit-Test bei Setup-Page:**  
Der Initialwert von `useState` in einer React-Komponente kann nicht ohne Render-Umgebung getestet werden. Da das Projekt keine Testing-Library für Komponenten einsetzt (nur Vitest für Store/Domain), ist ein manueller Test ausreichend und verhältnismäßig.

---

## 2. Use-Case-Test-Review

| Use-Case-Test | Sinnvoll? | Begründung |
|---------------|-----------|------------|
| Vollständiger Abbruch-Fluss: Spiel starten → abandonGame() → lastPlayerNames korrekt gesetzt → Setup-Page vorausgefüllt | ✅ | Integrationstest über Store und Setup-State; kein Testcontainer nötig; deckt das vollständige Szenario ab |
| abandonGame() mit laufendem Spiel (bidding) | ✅ | Normalfall — Abbruch in Ansagephase |
| abandonGame() mit laufendem Spiel (playing) | ✅ | Normalfall — Abbruch in Spielphase |
| abandonGame() ohne laufendes Spiel (game: null) | ✅ | Fehlerfall — darf nicht abstürzen, `lastPlayerNames` bleibt erhalten |

---

## 3. Empfehlungen

### Kritische Tests (müssen implementiert werden)

1. **`abandonGame()` + `lastPlayerNames` nach Aufruf** — Kernverhalten des Features; ohne diesen Test ist keine Korrektheit sichergestellt.
2. **Regressionstest `resetGame()` berührt `lastPlayerNames` nicht** — Verhindert, dass ein späterer Refactor die Trennung zwischen `abandon` und `reset` versehentlich bricht.

### Reihenfolge der Testimplementierung

1. Store-Tests zuerst (P1 — kein UI-Setup nötig, schnellste Feedback-Schleife)
2. Manuelle UI-Prüfung der Setup-Page (P3)
3. Manueller E2E-Smoke-Test: Spiel starten → abbrechen → Setup-Seite öffnen → Namen sehen

### Nicht benötigte Tests

- Button-Rendering-Tests für `game/page.tsx` — kein Testing-Library-Setup vorhanden; Aufwand unangemessen
- `window.confirm`-Mocking — Browser-native Dialoge in Unit-Tests zu mocken bringt keinen Mehrwert gegenüber manuellem Test
