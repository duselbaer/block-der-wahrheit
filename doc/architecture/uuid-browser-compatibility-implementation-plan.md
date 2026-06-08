# Implementierungsplan: UUID Browser-Kompatibilität

**Feature:** `uuid-browser-compatibility`  
**Datum:** 2026-06-09  
**Autor:** Senior-SE-Rolle

---

## 1. Paketübersicht

Drei unabhängige Pakete, alle ohne gegenseitige Abhängigkeit.

| # | Paket | Dateien | Abhängigkeit |
|---|-------|---------|-------------|
| A | Domain-Fix | `src/domain/gameFactory.ts` | keines |
| B | AGENTS.md-Update | `AGENTS.md` | keines |
| C | Test-Verifikation | `src/tests/gameFactory.test.ts` | A |

---

## 2. Paket A — Domain-Fix

### Verantwortungsbereich
`gameFactory.ts` darf keine Node.js-spezifischen Importe enthalten, da
die Datei in den Browser-Bundle einfließt.

### Änderung

```ts
// ENTFERNEN:
import { randomUUID } from "node:crypto";

// ERSETZEN durch (kein Import nötig):
globalThis.crypto.randomUUID()
```

Stellen: `createPlayer` (Zeile 6) und `createGame` (Zeile 32).

### Dateipfade
- `src/domain/gameFactory.ts`

### Testanforderungen
- Bestehende `gameFactory.test.ts`-Tests müssen weiterhin bestehen
- Kein neuer Test nötig — das Verhalten ändert sich nicht

---

## 3. Paket B — AGENTS.md-Update

### Verantwortungsbereich
AGENTS.md ergänzen um:
- NVM-Nutzung und `.nvmrc: 24`
- Verbot von `node:*`-Importen in isomorphem Code (`src/domain/`, `src/store/`)
- Hinweis auf globalThis.crypto als korrekte Lösung

### Dateipfade
- `AGENTS.md`

### Testanforderungen
Keine (Dokumentation).

---

## 4. Paket C — Test-Verifikation

Die bestehenden Tests in `src/tests/gameFactory.test.ts` decken
`createPlayer` und `createGame` ab. Nach der Änderung müssen sie
weiterhin grün sein — kein Umbau nötig.

---

## 5. Umsetzungsreihenfolge

```
1. [A] gameFactory.ts: import entfernen, globalThis.crypto nutzen
2. [C] npm run test → alle Tests müssen grün sein
3. [B] AGENTS.md aktualisieren
4. npm run typecheck → sauber
```
