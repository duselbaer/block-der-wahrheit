# UC-005: Button-Constraints für tatsächliche Stiche

**Status:** abgeschlossen  
**Datum:** 2026-06-09  
**Autor:** Dokumentenschreiber-Rolle

---

## Beschreibung

Wenn Spieler in der `playing`-Phase ihre tatsächlichen Stiche eingeben, darf kein Spieler:

- den Plus-Button betätigen, wenn sein aktueller Wert das erlaubte Maximum erreicht hat
- den Minus-Button betätigen, wenn sein aktueller Wert bereits 0 ist

Das erlaubte Maximum für einen Spieler ist die Anzahl der Karten in der Runde (`cardCount`) minus die Summe der bereits eingetragenen Stiche aller anderen Spieler.

Dieser Use-Case behebt einen Bug, bei dem ein Spieler über `cardCount` hinaus klicken konnte, solange andere Spieler noch keinen Wert eingetragen hatten.

---

## Akteure

- **Spieler**: Gibt seine tatsächlichen Stiche über Plus/Minus-Buttons ein
- **Spielleitung** (implizit): Wartet darauf, dass alle Spieler gültige Werte eingegeben haben

---

## Ablauf

1. Das Spiel befindet sich in der `playing`-Phase einer Runde.
2. Jeder Spieler sieht seinen aktuellen `actualTricks`-Wert (Initial: 0) sowie Plus- und Minus-Buttons.
3. Der **Minus-Button** ist deaktiviert, solange der Wert 0 ist.
4. Der **Plus-Button** ist deaktiviert, sobald `currentActual >= remaining`, wobei `remaining = max(0, cardCount − Σ anderer eingetragener Stiche)`.
5. Klickt ein Spieler auf Plus (falls enabled), wird der Wert um 1 erhöht — maximal bis `remaining`.
6. Klickt ein Spieler auf Minus (falls enabled), wird der Wert um 1 verringert — minimal bis 0.
7. Sobald alle Spieler Werte eingetragen haben **und** die Summe exakt `cardCount` ergibt, wird der "Runde abschliessen"-Button aktiviert.

---

## Designentscheidungen

- [ADR-006](../decisions/ADR-006-actual-tricks-button-disabled-state.md): `disabled`-State und korrigierte `onClick`-Berechnung rein in der UI-Schicht, kein neuer Selektor
- [ADR-003](../decisions/ADR-003-actual-tricks-sum-constraint-in-selectors.md): `selectRemainingActualTricks` als Basis-Selektor für das Maximum (bereits vorhanden)

---

## Teststatus

### Unit-Tests

| Unit | Good-Case | Weitere Tests |
|------|-----------|---------------|
| `selectRemainingActualTricks` | ✅ (aus UC-002) | Randfälle in `selectors.test.ts` |
| `disabled`-Inline-Logik | ❌ (nicht unit-testbar) | Durch Sichtprüfung abgenommen |

### Use-Case-Tests (Sichtprüfung)

| Szenario | Status | Anmerkung |
|----------|--------|-----------|
| Plus disabled wenn `currentActual = cardCount`, andere null | ✅ | Bug-Kern: vorher fehlerhaft |
| Plus disabled wenn Gesamtbudget ausgeschöpft | ✅ | Alle verbleibenden Stiche vergeben |
| Minus disabled bei Wert 0 | ✅ | Verhindert Negativwerte |
| Plus enabled nach Reset durch anderen Spieler | ✅ | Re-render aktualisiert disabled-State |

### Fehlende Tests und Begründung

| Test | Begründung |
|------|------------|
| Automatisierter Komponenten-Test | Kein React-Testframework (vitest/react-testing-library) im Projekt vorhanden; Aufwand unverhältnismäßig für 2-Zeilen-Änderung |
| E2E-Test (Playwright) | Kein E2E-Framework konfiguriert |

---

## Bekannte Schwachstellen und Risiken

- **Bidding-Phase unverändert**: Die Plus-Buttons beim Eingeben der Ansagen (`predictedTricks`) haben weiterhin keinen `disabled`-State (nur `onClick`-Capping). Dies ist kein Bug — Ansagen dürfen `cardCount` als Summe überschreiten (Spielregel).
- **Race-Condition im UI**: Theoretisch könnten bei sehr schnellen Klicks zwei React-Renders die `remaining`-Berechnung auf demselben alten State basieren. In der Praxis nicht relevant (Browser ist single-threaded, React batcht State-Updates).
