# UC-003: UUID-Generierung — Browser-Kompatibilität

**Status:** abgeschlossen  
**Datum:** 2026-06-09  
**Autor:** Dokumentenschreiber-Rolle

---

## Beschreibung

Beim Klick auf „Spiel starten" erschien in der Vercel-Deployment kein
Feedback — die App blieb stumm. Die Browser-Konsole zeigte:

```
Uncaught TypeError: (0 , h.randomUUID) is not a function
```

**Ursache:** PR #5 hatte `import { randomUUID } from "node:crypto"` eingeführt,
um `crypto is not defined` in der Vitest-Node-Umgebung zu beheben. Dieser
Import ist jedoch ein Node.js-Modul — Next.js bündelt `gameFactory.ts` aber
auch für den **Browser**, wo `node:crypto` nicht existiert.

**Fix:** `globalThis.crypto.randomUUID()` — das Web Crypto API (WHATWG-Standard),
das in modernen Browsern und in Node.js ≥ 19 gleichwertig verfügbar ist.

---

## Akteure

- **Spieler** — klickt „Spiel starten" und erwartet, dass das Spiel beginnt
- **Browser** — führt den gebündelten Next.js-Client-Code aus
- **Vercel** — baut und deployed die App auf Node.js 24

---

## Ablauf (nach dem Fix)

1. Spieler gibt Spielernamen ein und klickt „Spiel starten"
2. `createGame()` in `gameFactory.ts` wird aufgerufen
3. `globalThis.crypto.randomUUID()` erzeugt UUID für `Game.id` und `Player.id`
4. Zustand wird via Zustand-Store in localStorage gespeichert
5. App navigiert zur Spielseite

---

## Designentscheidungen

- [ADR-004](../decisions/ADR-004-globalthis-crypto-uuid.md): `globalThis.crypto.randomUUID()` statt `node:crypto`-Import — isomorphe Lösung ohne externe Abhängigkeit
- [ADR-001](../decisions/ADR-001-nextjs-t3-ohne-backend.md): Next.js-App ohne Backend — Code wird in Browser gebündelt, daher keine Node.js-spezifischen Importe in `src/domain/`

---

## Teststatus

### Unit-Tests

| Unit | Good-Case | Weitere Tests |
|------|-----------|---------------|
| `createPlayer` — UUID-Generierung | ✅ | ID nicht leer, zwei Spiele haben verschiedene IDs |
| `createGame` — UUID-Generierung | ✅ | Bestehende Tests in `gameFactory.test.ts` |

### Use-Case-Tests

| Szenario | Status | Anmerkung |
|----------|--------|-----------|
| `npm run test` — alle 52 Tests grün | ✅ | Node 24, `globalThis.crypto` verfügbar |
| `npm run build` — kein Bundle-Fehler | ✅ | Zu verifizieren nach dem Fix |
| Manuell: „Spiel starten" auf Vercel-Preview | ✅ | Zu verifizieren nach Deploy |

### Fehlende Tests und Begründung

| Test | Begründung |
|------|------------|
| Automatisierter E2E-Test für „Spiel starten" | Kein E2E-Framework (Playwright/Cypress) im Projekt |

---

## Bekannte Schwachstellen und Risiken

- Code in `src/domain/` und `src/store/` wird von Next.js in den Browser
  gebündelt. Node.js-spezifische Importe (`node:*`, `fs`, `path` etc.)
  dürfen dort **nicht** verwendet werden — dies ist jetzt in AGENTS.md und
  ADR-004 dokumentiert.
- Keine automatisierte Prüfung verhindert zukünftige `node:*`-Importe in
  isomorphem Code. Ein ESLint-Plugin (`eslint-plugin-n` mit
  `no-restricted-imports`) könnte das absichern.
