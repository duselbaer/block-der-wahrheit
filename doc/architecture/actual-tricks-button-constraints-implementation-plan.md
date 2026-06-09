# Implementierungsplan: Button-Constraints für tatsächliche Stiche

**Feature:** `actual-tricks-button-constraints`  
**Datum:** 2026-06-09  
**Autor:** Senior-SE-Rolle  
**Input:** [Architektur](actual-tricks-button-constraints.md), [ADR-006](../decisions/ADR-006-actual-tricks-button-disabled-state.md)

---

## 1. Paketübersicht

Nur ein Paket ist betroffen — die Änderung ist vollständig in der UI-Schicht.

| Paket | Datei | Aufwand |
|-------|-------|---------|
| UI (Game-Seite) | `src/app/game/page.tsx` | 1 Entwickler, ~15 min |

Keine parallele Entwicklung nötig — Single-File-Change.

---

## 2. Paket: UI (Game-Seite)

| Feld | Inhalt |
|------|--------|
| Verantwortungsbereich | Darstellung und Interaktion der Stich-Eingabe in der `playing`-Phase |
| Interface | React-Komponente, nutzt `selectRemainingActualTricks` aus `selectors.ts` |
| Dateipfade | `src/app/game/page.tsx` |
| Abhängigkeiten | `selectRemainingActualTricks` (bereits vorhanden, keine Änderung) |
| Testanforderungen | Sichtprüfung im Browser; kein neuer Unit-Test nötig (Logik liegt im Selektor) |

### Konkrete Änderungen in `src/app/game/page.tsx`

Innerhalb des `game.players.map(...)` im `playing`-Block:

**Schritt 1**: Lokale Variablen extrahieren (Lesbarkeit):

```tsx
const currentActual = ps.actualTricks ?? 0;
const remaining = selectRemainingActualTricks(game, player.id);
```

**Schritt 2**: Minus-Button — `disabled` hinzufügen:

```tsx
<button
  onClick={() => enterActualTricks(player.id, Math.max(0, currentActual - 1))}
  disabled={currentActual <= 0}
  className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
>
  −
</button>
```

**Schritt 3**: Plus-Button — `disabled` hinzufügen und onClick-Berechnung korrigieren:

```tsx
<button
  onClick={() => enterActualTricks(player.id, Math.min(remaining, currentActual + 1))}
  disabled={currentActual >= remaining}
  className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
>
  +
</button>
```

---

## 3. Umsetzungsreihenfolge

```
1. game/page.tsx ändern   →   (einziger Schritt)
```

Keine Voraussetzungen, keine nachgelagerten Schritte.

---

## Teststrategie

### Unit-Tests

Keine neuen Unit-Tests erforderlich:
- `selectRemainingActualTricks` ist bereits durch `selectors.test.ts` abgedeckt (ADR-003).
- Die disabled-Logik `currentActual >= remaining` ist eine triviale Vergleichsoperation ohne eigenständige Testbarkeit.

### Manuelle Verifikation (Sichtprüfung)

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| Spieler hat 0 Stiche | Minus disabled, Plus enabled |
| Spieler hat `cardCount` Stiche, andere auf null | Plus disabled |
| Alle Stiche vergeben (Summe = cardCount) | Plus für alle disabled |
| Spieler hat 0 Stiche, andere haben alle Stiche genommen | Plus disabled, Minus disabled |
