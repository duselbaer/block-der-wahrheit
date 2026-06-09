# UC-004: Leere Vorhersage zählt automatisch als 0

**Status:** abgeschlossen  
**Datum:** 2026-06-09  
**Autor:** Dokumentenschreiber-Rolle

---

## Beschreibung

In der Bieten-Phase (Vorhersage der Stiche) müssen Spieler angeben, wie viele Stiche sie in der aktuellen Runde machen werden. Bisher war die Schaltfläche „Runde spielen" erst aktiv, nachdem jeder Spieler mindestens einmal auf „+" oder „−" geklickt hatte — selbst dann, wenn alle 0 Stiche ansagen wollten.

Dieser Use-Case beschreibt die Änderung, durch die ein leerer Zustand (`null`) automatisch als Gebot von `0` zählt. Spieler, die nichts eingeben, müssen nicht mehr explizit auf „−" klicken.

---

## Akteure

- **Spieler:** interagiert (oder auch nicht) mit den +/−-Schaltflächen
- **Game Store (`gameStore.ts`):** normalisiert leere Gebote beim Übergang zur Spielphase
- **Selektor (`selectors.ts`):** entscheidet, ob die Schaltfläche „Runde spielen" aktiv ist

---

## Ablauf

1. Eine neue Runde beginnt. Alle Spieler haben `predictedTricks = null` (noch nicht interagiert).
2. Die UI zeigt für jeden Spieler den Wert `0` an (via `{ps.predictedTricks ?? 0}`).
3. Die Schaltfläche „Runde spielen" ist **sofort aktiv**, weil `selectAllBidsEntered` bei vorhandener Runde immer `true` zurückgibt.
4. Ein Spieler kann optional auf „+" klicken, um einen Wert > 0 einzutragen.
5. Klickt ein Spieler auf „Runde spielen", ruft die UI `advanceToPlaying()` auf.
6. Der Store normalisiert alle verbleibenden `null`-Gebote auf `0`.
7. Der Rundenstatus wechselt zu `playing`. Ab jetzt ist `predictedTricks` für jeden Spieler eine Zahl ≥ 0.

---

## Designentscheidungen

- [ADR-005](../decisions/ADR-005-null-bid-default-zero.md): `null` in `predictedTricks` wird beim Übergang `bidding → playing` automatisch auf `0` normalisiert. Der Domain-Typ bleibt unverändert (`number | null`).

---

## Teststatus

### Unit-Tests

| Unit | Good-Case | Weitere Tests |
|------|-----------|---------------|
| `selectAllBidsEntered` — null = gültig | ✅ | — |
| `selectAllBidsEntered` — explizit 0 | ✅ | — |
| `advanceToPlaying` — null → 0 normalisieren | ✅ | Gemischter Fall: ein Spieler hat Wert, andere haben null |
| `advanceToPlaying` — Status-Wechsel | ✅ | Bestand |

### Use-Case-Tests

| Szenario | Status | Anmerkung |
|----------|--------|-----------|
| Vollständiger Zyklus ohne explizite Gebote | ✅ | Alle Spieler drücken nur „Runde spielen" |
| Gemischter Fall: Teile null, Teile explizit | ✅ | Normalisierung greift nur für null-Einträge |

### Fehlende Tests und Begründung

| Test | Begründung |
|------|------------|
| UI-Test (React-Komponente) | Kein separater Komponenteninstanztest; Verhalten wird indirekt durch Store-Tests abgedeckt. Risiko gering, da keine UI-Logik geändert wurde. |

---

## Bekannte Schwachstellen und Risiken

- Der „Runde spielen"-Button ist nun **immer** sofort klickbar. Spieler, die versehentlich zu früh klicken, können keine Eingaben mehr machen. Das ist jedoch eine bewusste UX-Entscheidung und spiegelt die Spielregel wider (0 Stiche ist immer eine gültige Ansage).
- Bestehende gespeicherte Spielstände (LocalStorage) mit `null`-Geboten in aktiven Runden werden beim nächsten `advanceToPlaying`-Aufruf korrekt normalisiert — kein Migrationsbedarf.
