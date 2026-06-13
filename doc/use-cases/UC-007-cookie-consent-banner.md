# UC-007: Cookie-Consent-Banner (DSGVO/TTDSG-konform)

**Status:** bereit zur Implementierung  
**Datum:** 2026-06-13  
**Autor:** Dokumentenschreiber-Rolle

---

## Beschreibung

„Block der Wahrheit" ist eine datenschutzfreundliche App, die Nutzerdaten ausschließlich im lokalen Browser-Speicher (`localStorage`) ablegt — ohne Tracking, ohne Analytics, ohne Drittanbieter-Skripte.

Dennoch verlangt das TTDSG (Telekommunikation-Telemedien-Datenschutz-Gesetz), dass Nutzer transparent über den Einsatz von Speichertechnologien informiert werden. Dieser Use-Case beschreibt das Hinweisbanner, das beim ersten Besuch erscheint und nach einmaliger Bestätigung dauerhaft ausgeblendet bleibt.

**Für wen ist das relevant?**  
Für alle Besucher der App — insbesondere für den ersten Besuch ohne gespeicherten Consent.

---

## Akteure

- **Besucher:** Nutzer, der die App im Browser öffnet (erstmaliger oder wiederkehrender Besuch).

---

## Ablauf

1. Besucher öffnet die App im Browser.
2. Das System prüft, ob im `localStorage` bereits ein Eintrag `CookieConsent: "true"` vorhanden ist.
3. **Erster Besuch (kein Consent):** Das Banner erscheint am unteren Bildschirmrand mit dem Text:
   > „Diese App speichert deinen Spielstand im lokalen Speicher deines Browsers (localStorage). Es werden keine personenbezogenen Daten erhoben oder an Dritte weitergegeben."
4. Besucher klickt auf **„Verstanden"**.
5. Das System schreibt `CookieConsent: "true"` in den localStorage.
6. Das Banner verschwindet.
7. **Wiederkehrender Besuch (Consent vorhanden):** Das Banner wird nicht angezeigt. Die Einwilligung gilt 365 Tage.

---

## Technische Umsetzung (Kurzübersicht)

| Aspekt                | Detail                                                                |
|-----------------------|-----------------------------------------------------------------------|
| Bibliothek            | `react-cookie-consent` (MIT, ~4 KB)                                   |
| Komponente            | `src/components/consent/CookieConsentBanner.tsx`                      |
| Einbindung            | `src/app/layout.tsx` (globaler RootLayout)                            |
| Speicherort           | Cookie `CookieConsent=true` via `js-cookie` (technisch notwendig, TTDSG §25 Abs. 2 Nr. 2) |
| Gültigkeit            | 365 Tage                                                              |
| Styling               | Tailwind CSS (kein Library-eigenes CSS)                               |

---

## Designentscheidungen

- [ADR-008](../decisions/ADR-008-react-cookie-consent-bibliothek.md): `react-cookie-consent` wurde als Bibliothek gewählt, weil sie React-nativ, Tailwind-kompatibel und für den Projektumfang (kein Tracking, kein Kategoriensystem) ausreichend ist. Bei späterer Einführung von Vercel Analytics müsste auf eine Bibliothek mit Kategorienverwaltung migriert werden.

---

## Teststatus

### Unit-Tests

| Unit                  | Good-Case | Weitere Tests                            |
|-----------------------|-----------|------------------------------------------|
| `CookieConsentBanner` | ❌ geplant | Button-Klick, Consent-bereits-vorhanden  |

> **Hinweis:** Die Tests benötigen jsdom-Umgebung und `@testing-library/react`. Diese Abhängigkeiten müssen vor der Testimplementierung installiert werden (siehe Test-Review).

### Use-Case-Tests

| Szenario                              | Status | Anmerkung                                              |
|---------------------------------------|--------|--------------------------------------------------------|
| E2E: Banner erscheint beim ersten Besuch | ❌     | Nicht geplant; Playwright/Cypress wäre überproportional |

### Fehlende Tests und Begründung

| Test                                        | Begründung                                                         |
|---------------------------------------------|--------------------------------------------------------------------|
| Unit: Banner sichtbar ohne Consent          | Infrastruktur (jsdom + RTL) muss erst ergänzt werden              |
| Unit: Banner versteckt mit Consent          | Folgt nach Infrastruktur-Setup                                     |
| Unit: Button-Klick schreibt localStorage    | Folgt nach Infrastruktur-Setup                                     |
| E2E: Banner-Workflow im Browser             | Unverhältnismäßiger Aufwand für reine UI-Info-Komponente           |

---

## Bekannte Schwachstellen und Risiken

- **Consent-Cookie ist technisch notwendig:** Die Library speichert den Consent-Status immer als Cookie (`CookieConsent=true`). Ein `storage`-Prop existiert nicht in der API — dies war ein falscher Planungsannahme, die in der Implementierung korrigiert wurde. Der Consent-Cookie selbst fällt unter TTDSG §25 Abs. 2 Nr. 2 (technisch notwendig) und benötigt keine separate Einwilligung.
- **Kein Kategoriensystem:** Sollte Vercel Analytics in Zukunft aktiviert werden, reicht das einfache Banner nicht aus. Es müsste eine Opt-in/Opt-out-Steuerung je Kategorie (Notwendig / Statistik) eingebaut werden. Bibliothek wäre dann zu ersetzen.
- **Kein „Ablehnen"-Button:** Das Banner bietet nur „Verstanden". Nach deutschem Recht ist das für rein technisch notwendige Speicherung ausreichend; bei Analytics-Cookies wäre ein „Ablehnen"-Weg zwingend.

---

## Weiterführende Dokumente

- [Architekturdokumentation: cookie-consent.md](../architecture/cookie-consent.md)
- [Implementierungsplan: cookie-consent-implementation-plan.md](../architecture/cookie-consent-implementation-plan.md)
- [Test-Review: cookie-consent-test-review.md](../architecture/cookie-consent-test-review.md)
- [ADR-008: Bibliothekswahl react-cookie-consent](../decisions/ADR-008-react-cookie-consent-bibliothek.md)
