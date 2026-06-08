# ADR-003: Stich-Summen-Constraint via Selektoren und UI-Caps

**Status:** akzeptiert  
**Datum:** 2026-06-09  
**Autor:** Architekt-Rolle

---

## Kontext

In der `playing`-Phase einer Wizard-Runde können Spieler ihre tatsächlich
gemachten Stiche eingeben. Die Spielregel verlangt:

> Die Summe aller tatsächlichen Stiche **muss exakt `cardCount`** ergeben.

Bisher wird nur jeder einzelne Spieler auf `cardCount` gedeckelt, aber keine
Summenprüfung vorgenommen. Dadurch kann ein ungültiger Spielstand entstehen
(z. B. 6 Stiche bei 3 Karten).

---

## Entscheidung

Das Constraint wird in zwei Schichten durchgesetzt:

1. **Selektor-Schicht** (`src/store/selectors.ts`):  
   Neue Funktion `selectRemainingActualTricks(game, playerId)` berechnet
   dynamisch das Maximum, das ein Spieler noch eingeben darf.  
   `selectAllActualsEntered` wird erweitert: gibt nur `true` zurück, wenn
   alle Stiche eingetragen **und** die Summe exakt `cardCount` entspricht.

2. **UI-Schicht** (`src/app/game/page.tsx`):  
   Die `+`-Schaltfläche für `actualTricks` nutzt den neuen Selektor als
   Obergrenze — statt dem festen `Math.min(round.cardCount, ...)`.

Der Store-Reducer `enterActualTricks` bleibt unverändert (keine eigene
Validierungslogik im Store, da kein Backend vorhanden).

---

## Begründung

| Alternative | Warum verworfen |
|-------------|-----------------|
| Validierung im Store-Reducer | Würde Store-Reducer mit Domänenlogik belasten; Store hat nur einfache Setzer |
| Server-seitige Validierung | Kein Backend vorhanden (ADR-001) |
| Separate Validierungsschicht | Overkill für eine reine Browser-App ohne tRPC |

Selektoren sind bereits der etablierte Ort für abgeleitete Domänenlogik in
diesem Projekt (vgl. `selectAllBidsEntered`, `selectLeaderboard`).

---

## Konsequenzen

- `selectRemainingActualTricks` muss in Unit-Tests abgedeckt werden.
- Die `+`-Schaltfläche zeigt korrekt kein `disabled`-State, sondern reduziert
  einfach den erlaubten Maximalwert — konsistent mit dem bisherigen Gebote-UI.
- `selectAllActualsEntered` erhält eine Breaking-Change-ähnliche Erweiterung
  (bestehende Tests prüfen nur auf `!== null`, müssen angepasst werden).
