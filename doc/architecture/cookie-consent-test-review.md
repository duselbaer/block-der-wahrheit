# Test-Review: Cookie-Consent-Banner

**Datum:** 2026-06-13  
**Feature:** Cookie Consent (DSGVO/TTDSG)  
**Basis:** [Implementierungsplan](cookie-consent-implementation-plan.md)

---

## 1. Unit-Test-Review

| Unit                    | Good-Case vorhanden? | Anmerkung                                                              |
|-------------------------|----------------------|------------------------------------------------------------------------|
| `CookieConsentBanner`   | ⚠️ Infrastruktur fehlt | Geplant, aber jsdom-Umgebung und `@testing-library/react` müssen ergänzt werden (s.u.) |
| `RootLayout` (geändert) | ✅                   | Smoke-Test via bestehenden Seitenrender oder separatem Layout-Test ausreichend |

### Infrastruktur-Lücke: jsdom-Umgebung

Die aktuelle `vitest.config.ts` nutzt `environment: 'node'`. React-Komponenten benötigen eine DOM-Umgebung (`jsdom`).

**Lösung A (bevorzugt):** Datei-lokales Override per Pragma:

```ts
// src/tests/consent/CookieConsentBanner.test.tsx
// @vitest-environment jsdom
```

**Lösung B:** Globale Konfiguration auf `jsdom` umstellen — **nicht empfohlen**, da bestehende Node-Tests (Store, Score Engine) nicht auf DOM-Umgebung ausgelegt sind.

**Zusätzliche Dev-Abhängigkeit:**
```bash
npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

---

### Konkrete Testfälle für `CookieConsentBanner`

| Testfall | Verhalten | Prüfung |
|----------|-----------|---------|
| Banner sichtbar (kein Consent) | Kein `CookieConsent`-Cookie gesetzt | `getByText("Verstanden")` vorhanden |
| Banner versteckt (Consent gespeichert) | `document.cookie` enthält `CookieConsent=true` | `queryByText("Verstanden")` ist null |
| Button-Klick speichert Consent | Klick auf „Verstanden" | `document.cookie` enthält `CookieConsent=true` |

---

## 2. Use-Case-Test-Review

| Use-Case-Test                                   | Sinnvoll? | Begründung                                                                           |
|-------------------------------------------------|-----------|--------------------------------------------------------------------------------------|
| End-to-End: Banner erscheint beim ersten Besuch | ❌        | Überproportionaler Aufwand (Playwright/Cypress nötig); kein Testcontainer verfügbar  |
| Integration: Banner+Layout zusammen             | ❌        | Wäre doppelt zu Unit-Test; Layout-Render ist zu trivial für eigenständigen UC-Test   |

**Fazit:** Keine Use-Case-Tests erforderlich. Der gesamte Verhaltenspfad ist per Unit-Tests vollständig abdeckbar.

---

## 3. Empfehlungen

### Kritisch (muss implementiert werden)

1. **jsdom-Umgebung per Pragma** im Testfile aktivieren — ohne das sind keine React-Komponenten-Tests möglich.
2. **Good-Case-Test** „Banner sichtbar bei leerem localStorage" — ohne diesen Test gibt es keine Absicherung, dass das Banner überhaupt gerendert wird.

### Priorisierungsreihenfolge

1. Infrastruktur sicherstellen: `jsdom`-Pragma + `@testing-library/react` installieren
2. Test „Banner sichtbar (kein Consent)" implementieren
3. Test „Button-Klick speichert Consent" implementieren
4. Test „Banner versteckt (Consent vorhanden)" implementieren

### Nicht vergessen

- Der `storage="localStorage"` Prop muss explizit gesetzt sein (Default der Library ist Cookie). Dieser Unterschied sollte im Test verifiziert werden, damit keine echten Cookies geschrieben werden.
- `@testing-library/jest-dom` Matcher (`toBeVisible`, `not.toBeInTheDocument`) in `setup.ts` importieren:
  ```ts
  import '@testing-library/jest-dom';
  ```
