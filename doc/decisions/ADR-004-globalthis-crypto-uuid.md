# ADR-004: UUID-Generierung via globalThis.crypto.randomUUID()

**Status:** akzeptiert  
**Datum:** 2026-06-09  
**Autor:** Architekt-Rolle

---

## Kontext

`gameFactory.ts` wird von Next.js sowohl für den **Server** (SSR) als auch
für den **Browser** (Client-Components) gebündelt. PR #5 hat
`import { randomUUID } from "node:crypto"` eingeführt, um `crypto is not
defined` in der Vitest-Node-Umgebung zu beheben — hat dabei aber den
Browser-Build gebrochen:

> `Uncaught TypeError: (0 , h.randomUUID) is not a function`

Das Projekt benötigt eine **isomorphe** UUID-Quelle, die ohne Import in
beiden Umgebungen funktioniert.

---

## Entscheidung

`globalThis.crypto.randomUUID()` — ohne Import, direkt aufgerufen.

```ts
// vorher (bricht im Browser)
import { randomUUID } from "node:crypto";
const id = randomUUID();

// nachher (funktioniert überall)
const id = globalThis.crypto.randomUUID();
```

---

## Begründung

| Alternative | Warum verworfen |
|-------------|-----------------|
| `import { randomUUID } from "node:crypto"` | Node.js-only; bricht Browser-Bundle |
| `crypto.randomUUID()` (plain global) | `crypto` ist nicht als globale Variable im Vitest-Node-Environment verfügbar (Node < 19 behavior) |
| `uuid`-Paket (npm) | Externe Abhängigkeit für etwas, das nativ verfügbar ist — unnötig |
| `Math.random()`-basierte Lösung | Keine kryptografisch sichere UUID — vermeiden |

`globalThis.crypto` ist seit Node.js 19 ein globales Objekt (Teil der
Web Crypto API). Da dieses Projekt `engines: "node": ">=24.0.0"` fordert
und Vercel Node 24 nutzt, ist die Verfügbarkeit garantiert.

---

## Konsequenzen

- `gameFactory.ts`: `import { randomUUID } from "node:crypto"` entfernen,
  `globalThis.crypto.randomUUID()` verwenden
- Keine Änderung an Tests nötig — Node 24 hat `globalThis.crypto`
- AGENTS.md: Hinweis ergänzen, dass `node:crypto`-Imports in
  isomorphem Code (Domain, Store) verboten sind

---

## Lernpunkt für zukünftige Entwicklung

Code in `src/domain/` und `src/store/` wird von Next.js **in den Browser
gebündelt**. Node.js-spezifische Importe (`node:*`) dürfen dort **nicht**
verwendet werden.
