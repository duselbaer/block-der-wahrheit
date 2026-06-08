# ADR-002: Zustand als State-Manager mit localStorage-Persistenz

**Status:** Entschieden  
**Datum:** 2026-06-08

---

## Kontext

Die App muss den Spielzustand persistieren, sodass ein Browser-Refresh das laufende Spiel nicht unterbricht. Ohne Datenbankanbindung muss die Persistenz client-seitig erfolgen.

---

## Entscheidung

Wir verwenden **Zustand** (npm: `zustand`) mit der eingebauten `persist`-Middleware, die den Store automatisch in den `localStorage` serialisiert.

---

## Alternativen

| Alternative          | Abgelehnt weil                                             |
|----------------------|------------------------------------------------------------|
| React Context + useEffect + localStorage | Viel Boilerplate, keine automatische Synchronisation |
| Redux Toolkit        | Zu schwer für einen einfachen Prototypen                   |
| Jotai / Recoil       | Weniger ausgereifte Persistenz-Middleware                  |
| TanStack Query       | Primär für Server-State, nicht für lokale Domänenlogik    |

---

## Begründung

Zustand bietet:
- Minimales Boilerplate
- `persist`-Middleware: ein Einzeiler für localStorage-Sync
- TypeScript-first API
- Kompatibel mit Next.js App Router (Client Components)

---

## Konsequenzen

**Positiv:**
- Spielstand überlebt Browser-Refresh und Tab-Schließen
- Kein manuelles JSON-Parsing nötig
- Store-Schema kann mit `version`-Feld migriert werden

**Negativ:**
- Zustand-Version muss bei Schema-Änderungen erhöht werden (Migration erforderlich)
- Keine Synchronisation zwischen Tabs desselben Browsers
