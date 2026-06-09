# Test-Review: Leere Vorhersage zählt als 0

**Feature:** `null-bid-default-zero`  
**Datum:** 2026-06-09  
**Autor:** Tester-Rolle

---

## 1. Unit-Test-Review

| Unit | Good-Case vorhanden? | Anmerkung |
|------|----------------------|-----------|
| `selectAllBidsEntered` (neu: null = gültig) | ✅ geplant | Test: gibt `true`, wenn alle Scores `null` sind und Runde existiert |
| `selectAllBidsEntered` (explizit 0) | ✅ vorhanden | Bestehender Test bleibt gültig |
| `advanceToPlaying` — null → 0 normalisieren | ✅ geplant | Neuer Test: nach `advanceToPlaying` sind alle `predictedTricks` ≥ 0, kein `null` mehr |
| `advanceToPlaying` — Status-Wechsel | ✅ vorhanden | Bestehender Test abdeckt Status → `playing` |

### Anzupassende Tests

Der bestehende Test `"advanceToPlaying tut nichts wenn Voraussagen fehlen"` prüft Verhalten, das nach der Änderung nicht mehr existiert. Er muss **entfernt** werden — nicht nur angepasst, denn das getestete Verhalten ist die alte Invariante, die bewusst aufgegeben wird.

Der Test `"selectAllBidsEntered ist false wenn Bids fehlen"` wird zur **inversen Aussage** umgeschrieben: gibt `true` zurück, auch wenn keine expliziten Gebote eingetragen wurden.

---

## 2. Use-Case-Test-Review

| Use-Case-Test | Sinnvoll? | Begründung |
|---------------|-----------|------------|
| Vollständiger Spielzyklus ohne explizite Gebote | ✅ | Realistisches Szenario: Spieler drücken nur „Runde spielen", ohne + oder − zu klicken. Prüft Endpunkt-zu-Endpunkt-Korrektheit. |
| Gemischter Fall: ein Spieler bietet explizit, andere nicht | ✅ | Wichtiger Randfall: null und Zahl koexistieren in derselben Runde. |

Beide Use-Case-Tests sind als Store-Integrationstests in `gameStore.test.ts` sinnvoll und brauchen keine externen Abhängigkeiten (kein Testcontainer nötig).

---

## 3. Empfehlungen

### Kritische Tests (müssen implementiert werden)

1. **`"advanceToPlaying normalisiert null-Gebote zu 0"`** — sicherstellt, dass der Normalisierungsschritt tatsächlich greift und kein `null` mehr im State verbleibt.
2. **`"selectAllBidsEntered gibt true zurück ohne Interaktion"`** — Regressionssicherung für den Kern der Anforderung.

### Reihenfolge nach Risiko

1. Normalisierungstest (Paket B) — höchstes Risiko, weil Datenmutation
2. Selektor-Test (Paket A) — mittel
3. Bestehende Tests bereinigen — niedrig, aber notwendig für saubere Baseline
