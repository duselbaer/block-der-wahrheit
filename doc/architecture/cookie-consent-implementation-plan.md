# Implementierungsplan: Cookie-Consent-Banner

**Datum:** 2026-06-13  
**Feature:** Cookie Consent (DSGVO/TTDSG)  
**Basis:** [Architekturdokumentation](cookie-consent.md), [ADR-008](../decisions/ADR-008-react-cookie-consent-bibliothek.md)

---

## 1. Paketübersicht

Das Feature besteht aus **2 unabhängigen Paketen**, die sequenziell oder weitgehend parallel entwickelt werden können:

```
Paket A: Dependency        →  Paket B: Komponente
(npm install)                 (src/components/consent/)
                          ↓
                      Paket C: Integration
                      (src/app/layout.tsx)
```

---

## 2. Pakete im Detail

---

### Paket A — npm-Abhängigkeit

| Feld               | Inhalt                                                       |
|--------------------|--------------------------------------------------------------|
| Verantwortung      | Installation und Typen-Check der Library                     |
| Interface          | `import CookieConsent from 'react-cookie-consent'`           |
| Dateipfade         | `package.json`, `package-lock.json`                          |
| Abhängigkeiten     | –                                                            |
| Testanforderungen  | Kein eigener Test; TypeScript-Kompilierung ohne Fehler reicht |

**Befehl:**
```bash
npm install react-cookie-consent
```

**Typen:** Die Library bringt eigene `.d.ts`-Dateien mit (`@types` nicht nötig).

---

### Paket B — `CookieConsentBanner`-Komponente

| Feld               | Inhalt                                                                     |
|--------------------|----------------------------------------------------------------------------|
| Verantwortung      | DSGVO-konformer Hinweistext, Styling, Kapselung von `react-cookie-consent` |
| Interface          | `export function CookieConsentBanner(): JSX.Element`                       |
| Dateipfade         | `src/components/consent/CookieConsentBanner.tsx`                           |
| Abhängigkeiten     | Paket A (`react-cookie-consent`)                                            |
| Testanforderungen  | Unit-Test: Banner wird gerendert wenn kein Consent gespeichert             |

**Implementierungsdetails:**

```tsx
// src/components/consent/CookieConsentBanner.tsx
'use client';

import CookieConsent from 'react-cookie-consent';

export function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Verstanden"
      cookieName="CookieConsent"
      disableStyles={true}
      containerClasses="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-slate-800 p-4 text-white shadow-lg"
      contentClasses="text-sm"
      buttonClasses="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 shrink-0"
      expires={365}
    >
      Diese App speichert deinen Spielstand im lokalen Speicher deines Browsers (localStorage).
      Es werden keine personenbezogenen Daten erhoben oder an Dritte weitergegeben.
    </CookieConsent>
  );
}
```

**API-Props der Library (relevante Auswahl):**

| Prop              | Wert              | Bedeutung                                           |
|-------------------|-------------------|-----------------------------------------------------|
| `location`        | `"bottom"`        | Banner am unteren Rand                              |
| `buttonText`      | `"Verstanden"`    | Beschriftung des Bestätigungs-Buttons               |
| `cookieName`      | `"CookieConsent"` | Name des gesetzten Cookies                          |
| `disableStyles`   | `true`            | Eigene Styles per Tailwind                          |
| `expires`         | `365`             | Einwilligung bleibt 365 Tage gültig                 |

> **Hinweis:** Die Library speichert den Consent-Status immer als Cookie (`CookieConsent=true` via `js-cookie`). Ein `storage`-Prop existiert nicht in der Library-API. Der Consent-Cookie gilt unter TTDSG §25 Abs. 2 Nr. 2 als technisch notwendig und benötigt keine separate Einwilligung.

---

### Paket C — Integration in `RootLayout`

| Feld               | Inhalt                                                             |
|--------------------|--------------------------------------------------------------------|
| Verantwortung      | Banner global auf allen Seiten einbinden                           |
| Interface          | –                                                                  |
| Dateipfade         | `src/app/layout.tsx`                                               |
| Abhängigkeiten     | Paket B                                                            |
| Testanforderungen  | Smoke-Test: Layout rendert ohne Fehler                             |

**Änderung an `layout.tsx`:**

```tsx
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-slate-50 antialiased">
        <div className="mx-auto max-w-lg px-4 py-6">{children}</div>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
```

> **Hinweis:** `CookieConsentBanner` muss als Client-Komponente (`'use client'`) deklariert sein, da `react-cookie-consent` auf `document.cookie` zugreift.

---

## 3. Umsetzungsreihenfolge

```
Schritt 1 (Paket A):  npm install react-cookie-consent
                      └─ Blockiert: Paket B

Schritt 2 (Paket B):  CookieConsentBanner-Komponente implementieren
                      └─ Unit-Test schreiben
                      └─ Blockiert: Paket C

Schritt 3 (Paket C):  layout.tsx anpassen
                      └─ Manuelle Sichtprüfung im Browser
```

**Parallelmöglichkeiten:** Da es nur 3 Schritte gibt, ist keine echte Parallelisierung sinnvoll. Schritt 1 dauert Sekunden und blockiert alles weitere.

---

## 4. Teststrategie

### Unit-Tests

**Datei:** `src/tests/consent/CookieConsentBanner.test.tsx`

| Testfall | Beschreibung |
|----------|--------------|
| Renders when no consent stored | localStorage leer → Banner wird gerendert |
| Hidden when consent already given | localStorage enthält `"CookieConsent": "true"` → Banner nicht sichtbar |

**Setup:** jsdom-Umgebung mit localStorage-Mock (Vitest unterstützt jsdom via `environment: 'jsdom'`).

### Use-Case-Tests

Keine Use-Case-Tests vorgesehen — das Banner ist reine UI ohne Domänenlogik. Ein Browser-Test wäre überproportional aufwändig.

---

## 5. Dateipfade (Übersicht)

```
src/
  components/
    consent/
      CookieConsentBanner.tsx   ← neu
  app/
    layout.tsx                  ← geändert
  tests/
    consent/
      CookieConsentBanner.test.tsx  ← neu
package.json                    ← react-cookie-consent ergänzt
```
