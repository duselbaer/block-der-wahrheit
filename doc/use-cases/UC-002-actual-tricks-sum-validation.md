# UC-002: Validierung der tatsächlichen Stich-Summe

**Status:** abgeschlossen  
**Datum:** 2026-06-09  
**Autor:** Dokumentenschreiber-Rolle

---

## Beschreibung

Beim Kartenspiel *Wizard* werden in jeder Runde genau so viele Stiche gespielt,
wie Karten ausgeteilt wurden (`cardCount`). Wenn alle Spieler ihre tatsächlichen
Stiche eintragen, muss die Summe aller eingetragenen Stiche exakt `cardCount`
ergeben — nicht mehr, nicht weniger.

**Bug:** Bisher konnte jeder Spieler bis zu `cardCount` Stiche eingeben,
unabhängig davon, wie viele Stiche die anderen Spieler bereits beansprucht
hatten. Dadurch waren ungültige Spielzustände möglich (z. B. 6 Stiche bei
3 Karten mit 2 Spielern).

Dieser Use-Case beschreibt die Behebung dieses Fehlers durch dynamische
Caps in der UI und eine erweiterte Summenprüfung in den Selektoren.

---

## Akteure

- **Spieler** — gibt seine tatsächlich gemachten Stiche nach dem Ausspielen einer Runde ein
- **Block der Wahrheit (App)** — zeigt das erlaubte Maximum dynamisch an und sperrt "Runde abschließen" bei falscher Summe

---

## Ablauf

1. Die Runde wechselt in den Status `playing` (alle Gebote abgegeben).
2. Jeder Spieler tippt mit `+`/`−` seine tatsächlichen Stiche ein.
3. Die App berechnet nach jeder Eingabe:  
   `remaining = cardCount − Summe(actualTricks aller anderen Spieler)`
4. Der `+`-Button ist für diesen Spieler nur aktiv, wenn `remaining > 0`.
5. Wenn alle Spieler eingetragen haben **und** die Summe exakt `cardCount` ergibt,
   wird der Button „Runde abschließen" aktiv.
6. Ist die Summe falsch (auch wenn alle eingetragen haben), bleibt der Button gesperrt.

---

## Designentscheidungen

- [ADR-003](../decisions/ADR-003-actual-tricks-sum-constraint-in-selectors.md): Summen-Constraint wird in Selektoren und UI-Caps durchgesetzt, nicht im Store-Reducer — konsistent mit dem bestehenden Architekturmuster des Projekts.

---

## Teststatus

### Unit-Tests

| Unit | Good-Case | Weitere Tests |
|------|-----------|---------------|
| `selectRemainingActualTricks` — kein anderer hat Stiche | ✅ | Partielle Vergabe, volle Vergabe, defensiver `Math.max(0,...)`-Fall |
| `selectAllActualsEntered` — Summe korrekt | ✅ | Summe falsch → false, nicht alle eingetragen → false |

### Use-Case-Tests

| Szenario | Status | Anmerkung |
|----------|--------|-----------|
| Vollständiger Spielablauf (Stiche korrekt) | ✅ | In `gameStore.test.ts` abgedeckt |
| `completeRound` blockiert bei falscher Summe | ✅ | Durch Unit-Test von `selectAllActualsEntered` abgedeckt |
| UI-Cap: `+`-Button inaktiv wenn Limit erreicht | — | Kein React-Test-Framework im Projekt; manuelle Verifikation |

### Fehlende Tests und Begründung

| Test | Begründung |
|------|------------|
| React-Komponenten-Test für `+`-Button-Deaktivierung | Kein Testing-Framework für React-Rendering (z. B. Testing Library) im Projekt vorhanden; kein unverhältnismäßiger Aufwand für reine Browser-App |

---

## Bekannte Schwachstellen und Risiken

- Die Validierung liegt nur in der UI (kein Store-seitiger Guard). Ein direkter
  `enterActualTricks`-Aufruf am Store vorbei (z. B. aus Tests oder Devtools)
  würde keine Summenprüfung auslösen. Für eine reine localStorage-App ohne
  Backend ist das akzeptabel (kein Angriffssurface).
- Wenn ein Spieler bereits eingetragene Stiche eines anderen Spielers *reduziert*,
  gibt der `selectRemainingActualTricks`-Selektor automatisch mehr Spielraum frei — korrektes Verhalten.
