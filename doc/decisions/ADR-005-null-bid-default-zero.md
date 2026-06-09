# ADR-005: Leere Vorhersage zählt automatisch als 0

**Datum:** 2026-06-09  
**Status:** akzeptiert  
**Autor:** Architekt-Rolle

---

## Kontext

In der Bieten-Phase wird `predictedTricks` für jeden Spieler initial auf `null` gesetzt (bedeutet: „noch nicht eingegeben"). Die Schaltfläche „Runde spielen" war bisher nur aktiv, wenn alle Spieler explizit einen Wert gewählt hatten — auch für den Wert `0`, den die UI ohnehin als Default anzeigt.

Das führte dazu, dass Nutzer mindestens einmal auf „−" klicken mussten, um 0 Stiche anzusagen, obwohl `0` bereits angezeigt wurde.

---

## Entscheidung

`null` im Feld `predictedTricks` wird beim Übergang `bidding → playing` automatisch als `0` behandelt und normalisiert.

Konkret:
- `selectAllBidsEntered` gibt immer `true` zurück (null ist ein gültiger impliziter Wert)
- `advanceToPlaying` setzt alle `null`-Gebote auf `0`, bevor der Rundenstatus wechselt

---

## Begründung

- **Konsistenz mit der UI:** Die Anzeige zeigt bereits `0` für `null`. Nutzererwartung und Datenzustand stimmen nicht überein — das wird korrigiert.
- **Minimale Änderung:** Es wird kein Domain-Typ geändert. `null` bleibt als Zustand im Typsystem erhalten, wird aber an der Anwendungsservice-Grenze normalisiert.
- **Spielregel:** Es gibt keine Mindestanzahl an Stichen, die ein Spieler ansagen muss. `0` ist immer gültig.

---

## Konsequenzen

- Der „Runde spielen"-Button ist in der Bieten-Phase **immer aktiv** (sobald eine gültige Runde vorliegt).
- `advanceToPlaying` trägt die Verantwortung für die Normalisierung.
- Tests für `selectAllBidsEntered` und `advanceToPlaying` müssen angepasst werden: Der Fall „Advance schlägt fehl, weil Bids fehlen" entfällt.
