# Architektur: UUID-Generierung — Browser-Kompatibilität

**Feature:** `uuid-browser-compatibility`  
**Datum:** 2026-06-09  
**Autor:** Architekt-Rolle

---

## Problem

`gameFactory.ts` erzeugt UUIDs für `Player.id` und `Game.id`. Nach dem Fix
für den Vitest-Test-Runner (PR #5) wurde `import { randomUUID } from "node:crypto"`
eingeführt. Das ist ein **Node.js-spezifisches Modul** — Next.js bündelt
`gameFactory.ts` aber auch für den **Browser** (Client-Side Rendering), wo
`node:crypto` nicht existiert:

```
Uncaught TypeError: (0 , h.randomUUID) is not a function
```

Die App bricht beim Klick auf „Spiel starten" sofort ab.

---

## Bounded Context

Betroffen: **Game-Bounded-Context**, `createPlayer` und `createGame` in
`src/domain/gameFactory.ts`. Keine externen Integrationspunkte.

---

## Lösung: Web Crypto API (isomorphic)

`globalThis.crypto.randomUUID()` ist der WHATWG-Standard und funktioniert in:

| Umgebung | Verfügbar seit |
|----------|----------------|
| Alle modernen Browser | Chrome 92, Firefox 90, Safari 15 |
| Node.js (globalThis.crypto) | Node.js 19 |
| Node.js 24 (dieses Projekt) | ✅ |
| Vitest (node-environment, Node 24) | ✅ |

Kein Import nötig — `globalThis.crypto` ist überall ein globales Objekt.

---

## Kontextdiagramm: UUID-Generierung

![UUID-Kompatibilitätsdiagramm](https://plantum.ronsp.de/png/UDg5aK5hma0GXU_xAmPFaPA8HuMArXBh9HHKSYWzJ9A9JTtiXDrHaTB_tatKjhIKteOtm_TctaoTe9LzhPNRLQP1YpNaN3TioCXAJfh0KYvejfgKQZ3VuPQWTsVvwCX2CDUL7-ptu4q1F6snfXXpONkAn3q3EbZ4NKDpXdhzKhaejwT6EB9e2gutc-LzqEy6q_bClN-pIBYWwDN1v1Q68mXMP0_US01hSk8-3V_d9XVm8eOmdBGsC0RSbtPVahcgoGzP6HQ2Z4Mu1YwxvG1Ioc3UsS3iSTaA3xDrkWXNFfy2RU6LIp2XGQaEYam1BUaNB_a3QFpHu_CbWoDbvyhhrp26evilwDHN_dCVzygHfG==)

```plantuml
@startuml
skinparam componentStyle rectangle

package "Browser (Client)" {
  [gameFactory.ts] as GF
  [globalThis.crypto.randomUUID()] as WCA
}

package "Node.js >= 19 (Server / Tests)" {
  [globalThis.crypto.randomUUID()] as NWCA
}

GF --> WCA : aufrufen
GF --> NWCA : aufrufen

note bottom of WCA
  Web Crypto API
  WHATWG-Standard
  Browser-nativ
end note

note bottom of NWCA
  Web Crypto API
  node:crypto/webcrypto
  Node.js 19+
end note
@enduml
```

---

## NVM und Node-Version

Das Projekt verwendet **NVM** mit `.nvmrc: 24`. Vercel liest `engines.node`
aus `package.json` (`>=24.0.0`) und verwendet Node 24 für Builds.

Es gibt noch **keine GitHub Actions CI-Pipeline**. Wenn eine ergänzt wird,
muss sie `.nvmrc` respektieren (via `actions/setup-node` mit
`node-version-file: .nvmrc`).

---

## Entscheidung

Siehe [ADR-004](../decisions/ADR-004-globalthis-crypto-uuid.md)
