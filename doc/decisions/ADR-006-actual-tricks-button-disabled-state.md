# ADR-006: disabled-State für Plus/Minus-Buttons bei tatsächlichen Stichen

**Status:** akzeptiert  
**Datum:** 2026-06-09  
**Autor:** Architekt-Rolle

---

## Kontext

In der `playing`-Phase einer Wizard-Runde geben Spieler ihre tatsächlichen Stiche ein.
Durch einen Fehler in der bestehenden `onClick`-Berechnung konnte ein Spieler seinen Wert über `cardCount` hinaus erhöhen, wenn andere Spieler noch keine Stiche eingetragen hatten.

Zusätzlich fehlten `disabled`-Attribute:
- **Plus-Button**: war nie deaktiviert, auch bei Erreichen des Maximums
- **Minus-Button**: war nie deaktiviert, auch bei Wert 0

Der bestehende Selektor `selectRemainingActualTricks(game, playerId)` (eingeführt in ADR-003) berechnet bereits das korrekte Maximum: `max(0, cardCount − Σ anderer Stiche)`.

---

## Entscheidung

Rein UI-seitige Änderung in `src/app/game/page.tsx`:

1. **Plus-Button erhält `disabled`**:  
   `disabled={currentActual >= remaining}`  
   wobei `remaining = selectRemainingActualTricks(game, player.id)`

2. **Minus-Button erhält `disabled`**:  
   `disabled={currentActual <= 0}`

3. **onClick-Berechnung für Plus korrigiert**:  
   `Math.min(remaining, currentActual + 1)`  
   statt `Math.min(currentActual + remaining, currentActual + 1)`

4. **Beide Buttons erhalten `disabled:opacity-40 disabled:cursor-not-allowed`** in der Tailwind-Klasse.

---

## Begründung

| Alternative | Warum verworfen |
|-------------|-----------------|
| Neuer Selektor `selectCanIncrementActualTricks` | Overkill — die Bedingung ist trivial und direkt ableitbar |
| Validierung im Store-Reducer | Widerspricht dem in ADR-003 etablierten Muster |
| Nur onClick-Fix ohne disabled | Schlechte UX: Button ist klickbar aber tut nichts |

Das `disabled`-Attribut gibt dem Nutzer sofortiges visuelles Feedback und verhindert sinnlose Klicks — konsistent mit dem "Runde spielen"- und "Runde abschliessen"-Button, die ebenfalls `disabled:opacity-40` nutzen.

---

## Konsequenzen

- Kein neuer Selektor, keine Store-Änderung — minimale Änderungsfläche.
- Die bestehenden Tests für `selectRemainingActualTricks` bleiben gültig.
- Der Fix ist rein UI-seitig und benötigt keine neuen Unit-Tests in der Domain-Schicht.
- UX-Test: Sichtprüfung im Browser ausreichend.
