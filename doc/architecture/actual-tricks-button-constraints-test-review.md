# Test-Review: Button-Constraints für tatsächliche Stiche

**Feature:** `actual-tricks-button-constraints`  
**Datum:** 2026-06-09  
**Autor:** Tester-Rolle  
**Input:** [Implementierungsplan](actual-tricks-button-constraints-implementation-plan.md)

---

## 1. Unit-Test-Review

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `selectRemainingActualTricks` | ✅ | Bereits in `selectors.test.ts` abgedeckt — keine Änderung |
| `disabled={currentActual >= remaining}` | ❌ | Inline-Ausdruck in JSX — nicht unit-testbar ohne Komponenten-Test |
| `disabled={currentActual <= 0}` | ❌ | Inline-Ausdruck in JSX — nicht unit-testbar ohne Komponenten-Test |
| `Math.min(remaining, currentActual + 1)` | ❌ | Wird durch Selektor-Tests und manuelle Verifikation implizit abgedeckt |

**Begründung für fehlende Unit-Tests:**  
Die geänderte Logik besteht ausschließlich aus trivialen Vergleichen (`>=`, `<=`) auf Werten, die der bereits getestete Selektor liefert. Ein Komponenten-Test würde das React-Rendering mocken müssen — unverhältnismäßiger Aufwand für eine 2-Zeilen-Änderung.

---

## 2. Use-Case-Test-Review

| Use-Case-Test | Sinnvoll? | Begründung |
|---------------|-----------|------------|
| Sichtprüfung: Plus bei 0 Stichen und vollem Budget enabled | ✅ | Grundfall — muss funktionieren |
| Sichtprüfung: Plus disabled wenn `currentActual >= remaining` | ✅ | Direktes Abnahmekriterium des Bugs |
| Sichtprüfung: Minus disabled wenn `currentActual = 0` | ✅ | Direktes Abnahmekriterium |
| Sichtprüfung: Plus disabled wenn alle Stiche vergeben | ✅ | Kritischer Grenzfall (Bug-Ursprung) |
| Automatisierter E2E-Test (Playwright o.ä.) | ❌ | Kein E2E-Framework vorhanden; Aufwand unverhältnismäßig für ein UI-Flag |

---

## 3. Empfehlungen

### Kritische Tests (vor Merge verifizieren)

1. **Plus überschreitet nicht `cardCount`**: Spieler A hat cardCount=3, gibt 3 Stiche ein → Plus muss disabled sein, auch wenn B und C noch auf null sind.
2. **Minus bei 0 disabled**: Spieler hat 0 Stiche → Minus muss disabled sein.
3. **Plus wieder aktivierbar**: Spieler A hat 3 Stiche, Spieler B erhöht auf 1 → der verbleibende Rest reduziert sich, A's Plus bleibt korrekt disabled.

### Risikoeinschätzung

| Risiko | Wahrscheinlichkeit | Auswirkung |
|--------|-------------------|------------|
| Selektoraufruf im Render zu langsam | gering | gering |
| `remaining` wird mit altem State berechnet | gering | mittel — React re-renders bei State-Änderung automatisch |
| Bidding-Phase versehentlich betroffen | keine — Änderung nur im `playing`-Block | — |
