# ADR-007: Leeres Ergebnis zählt automatisch als 0 Stiche

**Datum:** 2026-06-09  
**Status:** akzeptiert  
**Autor:** Architekt-Rolle

---

## Kontext

In der Spielphase wird `actualTricks` für jeden Spieler initial auf `null` gesetzt (bedeutet: „noch nicht eingegeben"). Die Schaltfläche „Runde abschliessen" war bisher nur aktiv, wenn alle Spieler explizit einen Wert gesetzt hatten — auch für den Wert `0`, den die UI ohnehin als Default anzeigt.

Spieler, die 0 Stiche machen, sehen korrekt `0` in der UI (da `ps.actualTricks ?? 0`), haben aber keine Möglichkeit, diesen Wert zu „bestätigen", ohne zunächst `+` und dann wieder `−` zu klicken. Das ist kontraintuitiv und verhindert den Rundenabschluss.

Analoges Problem wurde für die Ansage in ADR-005 gelöst.

---

## Entscheidung

`null` im Feld `actualTricks` wird beim Übergang `playing → complete` automatisch als `0` behandelt und normalisiert.

Konkret:
- `selectAllActualsEntered` prüft nur noch `∑(actualTricks ?? 0) === cardCount` — kein `!== null`-Check mehr
- `completeRound` setzt alle `null`-Werte auf `0`, bevor der Rundenstatus wechselt

---

## Begründung

- **Konsistenz mit der UI:** Die Anzeige zeigt bereits `0` für `null`. Nutzererwartung und Datenzustand stimmen nicht überein — das wird korrigiert.
- **Mathematische Vollständigkeit:** `∑(actualTricks ?? 0) === cardCount` ist die einzige relevante Invariante. Ob ein Wert explizit oder implizit 0 ist, ändert das Spielergebnis nicht.
- **Konsistenz mit ADR-005:** Gleiches Pattern für Vorhersage (bidding) und Ergebnis (playing).
- **Minimale Änderung:** Kein Domain-Typ wird geändert. `null` bleibt im Typsystem, wird an der Service-Grenze normalisiert.

---

## Konsequenzen

- Der „Runde abschliessen"-Button ist aktiv, sobald `∑(actualTricks ?? 0) === cardCount` gilt.
- `completeRound` trägt die Verantwortung für die Normalisierung.
- Bestehende Tests für `selectAllActualsEntered` müssen angepasst werden: Der Fall „nicht alle eingetragen → false" gilt nur noch, wenn die Summe nicht stimmt.
- Score-Berechnung für null-Werte (→ 0) muss in `completeRound` korrekt erfolgen.
