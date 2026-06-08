# Test-Review: Stich-Summen-Validierung

**Feature:** `actual-tricks-sum-validation`  
**Datum:** 2026-06-09  
**Autor:** Tester-Rolle

---

## 1. Unit-Test-Review

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `selectRemainingActualTricks` — kein anderer hat Stiche | ✅ | Liefert `cardCount` |
| `selectRemainingActualTricks` — alle anderen haben Stiche | ✅ | Liefert 0 |
| `selectRemainingActualTricks` — teilweise vergeben | ✅ | Restbetrag korrekt |
| `selectRemainingActualTricks` — negativer Rest (defensiv) | ✅ | `Math.max(0, ...)` |
| `selectAllActualsEntered` — Summe korrekt, alle eingetragen | ✅ | Gibt `true` |
| `selectAllActualsEntered` — Summe falsch, alle eingetragen | ✅ | Gibt `false` — **kritischer Bug-Regressionstest** |
| `selectAllActualsEntered` — nicht alle eingetragen | ✅ | Gibt `false` |
| `selectAllActualsEntered` — leere Runde | ✅ | Gibt `false` (kein Round) |

Alle Units haben Good-Case-Tests. Der wichtigste Regressionstest ist
`selectAllActualsEntered` mit falscher Summe: Er stellt sicher, dass der Bug
nicht erneut eingeführt werden kann.

---

## 2. Use-Case-Test-Review

| Use-Case-Test | Sinnvoll? | Begründung |
|---------------|-----------|------------|
| Vollständiger Spielablauf (2 Spieler, 1 Runde, korrekte Stiche) | ✅ | Bereits in `gameStore.test.ts` abgedeckt — kein Mehraufwand |
| Spieler versucht Stiche über Limit einzutragen | ❌ | UI-Verhalten; kein Store-Reducer-Test nötig, da Caps in der UI liegen |
| `completeRound` mit Summe ≠ cardCount | ✅ | Prüft, dass `selectAllActualsEntered = false` den Button disabled hält |

Der letzte Use-Case ist bereits durch den Unit-Test von `selectAllActualsEntered`
abgedeckt — ein separater Integration-Test würde denselben Code-Pfad testen,
bietet keinen zusätzlichen Mehrwert.

---

## 3. Empfehlungen

**Kritisch (sofort):**
1. `selectRemainingActualTricks` — Unit-Tests in `src/tests/selectors.test.ts` (neue Datei)
2. `selectAllActualsEntered` — bestehende Tests in `src/tests/gameStore.test.ts` prüfen, ob sie die erweiterte Logik (Summenprüfung) abdecken; ggf. erweitern

**Priorität (Risikopriorisierung):**
1. Summen-falsch-aber-alle-eingetragen-Test — direkte Regression des Bugs
2. Restbetrag-Tests für `selectRemainingActualTricks` — sichert Deckeln im UI ab

**Kein Testbedarf:**
- `enterActualTricks` im Store bleibt unverändert
- UI-Rendering-Tests (kein Testing-Framework für React-Komponenten im Projekt)
