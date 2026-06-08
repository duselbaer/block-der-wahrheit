# ADR-001: Next.js T3-Stack ohne Backend-Komponenten

**Status:** Entschieden  
**Datum:** 2026-06-08

---

## Kontext

Der „Block der Wahrheit" ist eine reine Protokollierungs-App ohne Multi-User-Anforderungen. Für den Prototypen soll keine Datenbank und kein Authentifizierungssystem benötigt werden. Die App soll auf Vercel deployt werden können.

Der Nutzer hat explizit den T3-Stack als technologische Basis vorgegeben.

---

## Entscheidung

Wir verwenden den **T3-Stack** (Next.js, TypeScript, Tailwind CSS, Zod), lassen jedoch **tRPC** und **Prisma** weg. Persistenz erfolgt ausschließlich über den **Browser-localStorage**. Zustandsverwaltung übernimmt **Zustand** mit einem `persist`-Middleware-Adapter.

---

## Begründung

| Kriterium          | Entscheidung                                         |
|--------------------|------------------------------------------------------|
| Einfachheit        | Kein Server-Round-Trip nötig; alle Daten liegen lokal |
| Deployment         | Vercel deployt statische Next.js-Apps ohne Backend   |
| Prototyp-Geschwindigkeit | Kein Schema-Migration, kein Auth-Setup       |
| Erweiterbarkeit    | tRPC und Prisma können später hinzugefügt werden, wenn eine Datenbank benötigt wird |

---

## Konsequenzen

**Positiv:**
- Sehr schnelle Entwicklungszeit (kein Backend-Setup)
- Deployment auf Vercel ohne Datenbankkosten
- App funktioniert auch offline

**Negativ:**
- Spielstände sind gerätegebunden (kein Cross-Device-Sync)
- Spielstand kann durch Browser-Cache-Leerung verloren gehen
- Kein Mehrbenutzer-Betrieb (zwei Geräte sehen unterschiedliche Stände)

**Risiken:**
- localStorage-Limit (typ. 5–10 MB) ist für diesen Use-Case unkritisch
