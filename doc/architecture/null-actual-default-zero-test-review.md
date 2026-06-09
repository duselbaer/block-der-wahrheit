# Test-Review: Null-Actual Default Zero

**Feature:** `null-actual-default-zero`  
**Datum:** 2026-06-09  
**Autor:** Tester-Rolle  
**Input:** `doc/architecture/null-actual-default-zero-implementation-plan.md`

---

## 1. Unit-Test-Review

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `selectAllActualsEntered` — null als 0 (neu) | ✅ | `makeGame(3, [3, null])` → true. Deckt den Kernbug ab. |
| `selectAllActualsEntered` — alle explizit eingetragen | ✅ | Bestehender Test `[1, 2]` cardCount=3 bleibt gültig. |
| `selectAllActualsEntered` — Summe falsch → false | ✅ | Bestehender Regression-Test `[2, 2]` cardCount=3 bleibt gültig. |
| `selectAllActualsEntered` — niemand eingetragen → false | ✅ | `[null, null]` sum=0 ≠ 3 → false. Bleibt korrekt nach Änderung. |
| `selectAllActualsEntered` — teilweise eingetragen, Summe stimmt nicht → false | ✅ | `[1, null]` sum=1 ≠ 3 → false. Bleibt korrekt. |
| `completeRound` — null normalisiert zu 0, Score berechnet (neu) | ✅ | Neuer Test prüft `actualTricks=0` und `score=20` für Bob/Carol. |

---

## 2. Use-Case-Test-Review

| Use-Case-Test | Sinnvoll? | Begründung |
|---------------|-----------|------------|
| Vollständiger Spielzyklus mit null-Actual (bestehend) | ✅ | Der bestehende Test „nach der letzten Runde finished" nutzt `enterActualTricks(p, 0)` explizit — bleibt gültig. |
| Neuer Store-Test: `completeRound` normalisiert null | ✅ | Testet echtes Verhalten unter realistischen Bedingungen — ein Spieler klickt nie +/−. Verhältnismäßig (kein Testcontainer nötig). |
| UI-Test (Visuell) | ⚠️ | Kein automatischer UI-Test vorhanden. Button-State und Score-Anzeige sind nicht maschinell verifiziert. Akzeptabel — UI-Logik ist trivial und durch Store-Tests abgedeckt. |

---

## 3. Empfehlungen

### Kritisch (sofort umsetzen)

1. **Neuer Selektor-Test** (`selectAllActualsEntered` mit null=0 → true): Deckt den reproduzierten Bug direkt ab. Muss als erster Test implementiert werden, um TDD-Reihenfolge sicherzustellen.

2. **Neuer Store-Test** (`completeRound` normalisiert null): Schützt vor Regression, dass Score für implizit-0-Spieler nicht berechnet wird.

### Risikobewertung bestehender Tests

| Test | Status nach Änderung | Risiko |
|------|---------------------|--------|
| `nicht alle eingetragen → false` | ✅ noch gültig (sum ≠ cardCount) | keins |
| `niemand eingetragen → false` | ✅ noch gültig (sum = 0 ≠ cardCount) | keins |
| `completeRound berechnet Scores` | ✅ noch gültig | keins |
| `nach letzter Runde finished` | ✅ noch gültig (explizite 0-Eingabe) | keins |

### Nicht dokumentierte fehlende Tests

| Test | Begründung für Nicht-Implementierung |
|------|--------------------------------------|
| UI-Test: Button-Aktivierung wenn null-Actual | Kein UI-Testframework im Projekt. Manuell via Browser prüfbar. |
| Score-Anzeige für null-Actual-Spieler | `ps.actualTricks !== null` in UI — nach Normalisierung erst nach Rundenabschluss sichtbar. Kein eigenständiger Test nötig. |
