# Architektur: Validierung der Stich-Summe (actual tricks)

**Feature:** `actual-tricks-sum-validation`  
**Datum:** 2026-06-09  
**Autor:** Architekt-Rolle

---

## Problem

Beim Eingeben der tatsächlichen Stiche in der Spielphase wird jeder Spieler
nur individuell auf `cardCount` gedeckelt. Die Domänen-Invariante des Wizard-
Spiels besagt jedoch: **Die Summe aller tatsächlichen Stiche einer Runde muss
exakt gleich `cardCount` sein.**

Aktuell kann ein Spieler 3 Stiche eingeben, obwohl andere Spieler bereits alle
3 verfügbaren Stiche beansprucht haben — der Store akzeptiert ungültige Zustände.

---

## Bounded Context

Betroffen ist ausschließlich der **Game-Bounded-Context** in der aktuellen Runde,
Phase `playing`. Es gibt keine Integrationspunkte zu externen Systemen.

### Aggregate Root

`Game` → `Round` → `PlayerRoundScore[]`

Die Invariante gehört zum Aggregat `Round`:

> Für jede `Round` im Status `complete` gilt:  
> `sum(playerScores[*].actualTricks) === round.cardCount`

---

## Domänenmodell (Änderungen)

### Neue Selektoren in `src/store/selectors.ts`

| Selektor | Signatur | Beschreibung |
|----------|----------|--------------|
| `selectRemainingActualTricks` | `(game, playerId) → number` | Wie viele Stiche darf dieser Spieler noch eingeben? (`cardCount − Σ anderer`) |
| `selectActualTricksSumValid` | `(game) → boolean` | Ist die Summe exakt gleich `cardCount`? |

### Änderung an `selectAllActualsEntered`

Erweitern um: alle eingetragen **und** Summe === `cardCount`.

---

## Sequenzdiagramm: Stich-Eingabe mit Summenvalidierung

![Sequenzdiagramm Stich-Eingabe](https://plantum.ronsp.de/png/UDfbKajhma0Glk-lc7eGfMhfLR0e9GTfIy47FK-I8LsSh65t5ko_xwp6QF0w-xtPPH3q4cisMCZHmxQnnEHDerTRs0QTmA32cbuQh6WcuJG03B1Vzn51IOaV5746RBFFHusj8gX3xButcJ6j8KpVL7GE7soBWy0pv6H18qNadTTJCFjrmgZk72vk6whHEkkgrHrib7mcq33-aL-NOwE4ZbUWBz-FKUDC8SHwTAyFw4hor2tGCjjODPuopnXpQNEaunVAxwosRdHxdG0U91ApDdWTNpEdfdCW9-HxMQyf9-0ealyXBsgRq9rnaaEsmUfR2YSez3Z5YlaY7B9aGkLvXdvvP2PuMe2BccuuJ0F0Od7RfDStZo97bpdCcKgp95Vg5_a7puYtq0==)

```plantuml
@startuml
actor Spieler
participant "game/page.tsx" as UI
participant "selectors.ts" as SEL
participant "gameStore.ts" as STORE

Spieler -> UI: Klickt + bei actualTricks
UI -> SEL: selectRemainingActualTricks(game, playerId)
SEL -> SEL: cardCount - sum(actualTricks anderer Spieler)
SEL --> UI: maxErlaubt
UI -> UI: Math.min(maxErlaubt, aktuell + 1)
UI -> STORE: enterActualTricks(playerId, neuerWert)
STORE --> UI: aktualisierter State
UI -> SEL: selectAllActualsEntered(game)
SEL -> SEL: alle != null && sum == cardCount
SEL --> UI: buttonEnabled
@enduml
```

---

## Entscheidung

Siehe [ADR-003](../decisions/ADR-003-actual-tricks-sum-constraint-in-selectors.md)

---

## Nicht im Scope

- Gebote (`predictedTricks`) dürfen die `cardCount`-Summe überschreiten — das ist Spielregel.
- Keine Änderung am Store-Reducer `enterActualTricks` nötig (Caps in der UI reichen).
- Kein Server-seitiges Constraint nötig (localStorage-App ohne Backend).
