# UC-006: Leeres Ergebnis zählt automatisch als 0 Stiche

**Status:** abgeschlossen  
**Datum:** 2026-06-09  
**Autor:** Dokumentenschreiber-Rolle

---

## Beschreibung

Wenn ein Spieler in einer Runde 0 Stiche macht, musste er bisher trotzdem aktiv auf `+` und dann `−` klicken, um diesen Wert „offiziell" einzutragen. Ohne diese Interaktion blieb der interne Wert `null`, obwohl die Anzeige bereits `0` zeigte. Die Schaltfläche „Runde abschliessen" blieb in diesem Fall dauerhaft deaktiviert.

Dieser Use-Case beschreibt die Behebung dieses Bugs: `null` in `actualTricks` wird beim Rundenabschluss automatisch als `0` behandelt — analog zur Regelung für die Vorhersagephase ([UC-004](UC-004-null-bid-default-zero.md)).

---

## Akteure

- **Spieler:** gibt tatsächliche Stiche ein (oder lässt das Feld bei 0 unverändert)
- **System:** erkennt implizit-0-Werte und normalisiert diese beim Rundenabschluss

---

## Ablauf

1. Das Spiel befindet sich in der Spielphase (`playing`).
2. Alle Spieler tragen ihre tatsächlichen Stiche ein. Spieler mit 0 Stichen klicken **nichts** — der angezeigte Wert ist bereits `0`.
3. Das System berechnet intern: `∑(actualTricks ?? 0)`. Entspricht die Summe `cardCount`, wird der „Runde abschliessen"-Button aktiviert.
4. Der Spieler klickt „Runde abschliessen".
5. Das System setzt alle `null`-Werte in `actualTricks` auf `0` und berechnet den Score für diese Spieler.
6. Die Runde wechselt in den Status `complete`.

---

## Designentscheidungen

- [ADR-007](../decisions/ADR-007-null-actual-default-zero.md): `null` in `actualTricks` wird als implizit 0 behandelt — nur die Summeninvariante zählt.
- [ADR-005](../decisions/ADR-005-null-bid-default-zero.md): Analoges Muster für die Vorhersagephase (Präzedenzfall).

---

## Teststatus

### Unit-Tests

| Unit | Good-Case | Weitere Tests |
|------|-----------|---------------|
| `selectAllActualsEntered` (null → 0) | ✅ | sum ≠ cardCount → false; niemand eingetragen → false; teilweise → false |
| `completeRound` normalisiert null | ✅ | actualTricks=0, Score korrekt berechnet |

### Use-Case-Tests

| Szenario | Status | Anmerkung |
|----------|--------|-----------|
| Vollständiger Spielzyklus (explizit 0) | ✅ | Bestehender Test, bleibt gültig |
| Rundenabschluss mit implizit-0-Spieler | ✅ | Neuer Store-Test |

### Fehlende Tests und Begründung

| Test | Begründung |
|------|------------|
| UI-Test: Button-Aktivierung | Kein UI-Testframework im Projekt. Manuell via Browser verifizierbar. |
| Score-Anzeige für implizit-0-Spieler | Normalisierung erfolgt erst beim Abschluss — Score-Anzeige in der Spielphase nicht relevant. |

---

## Bekannte Schwachstellen und Risiken

- **Kein UI-Framework:** Es gibt keine automatisierten UI-Tests. Der Bug war manuell reproduzierbar; die Behebung ist manuell zu verifizieren.
- **Anzeige in Spielphase:** Die Score-Vorschau (`ps.actualTricks !== null`) zeigt für implizit-0-Spieler kein Feedback an. Das ist akzeptabel — 0 Stiche ist ein Sonderfall, der klar erkennbar ist.
