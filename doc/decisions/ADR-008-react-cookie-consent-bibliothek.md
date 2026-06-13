# ADR-008: Bibliothekswahl für das Cookie-Consent-Banner — `react-cookie-consent`

**Datum:** 2026-06-13  
**Status:** akzeptiert  
**Kontext:** Cookie-Consent-Banner (DSGVO/TTDSG)

---

## Kontext

„Block der Wahrheit" benötigt ein DSGVO/TTDSG-konformes Hinweisbanner, das Nutzer über die localStorage-Nutzung informiert. Die App hat kein Backend, kein Tracking und keine Drittanbieter-Skripte. Ein aktiver Consent-Workflow (Opt-in/Opt-out je Kategorie) ist rechtlich nicht zwingend erforderlich, verbessert aber die Nutzerwahrnehmung.

### Kandidaten

| Bibliothek                   | Größe (min+gz) | React-nativ | Kategorien | Aufwand |
|------------------------------|----------------|-------------|------------|---------|
| `react-cookie-consent`       | ~4 KB          | ✅          | ❌ (einfach) | gering  |
| `vanilla-cookieconsent` v3   | ~12 KB         | ❌ (Wrapper) | ✅ (vollständig) | mittel  |
| Eigene Implementierung       | 0 KB           | ✅          | manuell    | hoch    |

---

## Entscheidung

**Wir verwenden `react-cookie-consent`.**

---

## Begründung

1. **Passt zum Projektumfang:** Die App speichert keine Tracking-Daten und braucht keine Kategorienverwaltung (Essential/Marketing/Analytics). Ein einfaches Accept-Banner genügt.
2. **React-nativ:** Keine Wrapper oder imperatives JS-API nötig; integriert sich direkt als JSX-Komponente.
3. **Tailwind-kompatibel:** Alle Styles werden per `className`-Props injiziert, sodass Tailwind-Klassen direkt nutzbar sind.
4. **Cookie-Speicherung der Einwilligung:** Die Library speichert den Consent-Status als `CookieConsent=true`-Cookie via `js-cookie`. Dieser Cookie ist technisch notwendig (kein Tracking) und benötigt selbst keine separate Einwilligung. localStorage-Persistenz ist in der Library nicht vorgesehen.
5. **Geringe Bundle-Größe:** ~4 KB komprimiert, ohne Impact auf Core Web Vitals.
6. **Aktiv gepflegt:** Regelmäßige Updates, MIT-Lizenz, ~1,5 Mio. npm-Downloads/Monat.

---

## Konsequenzen

- **Positiv:** Schnelle Implementierung, wartungsarmer Code, keine Eigenentwicklung.
- **Negativ:** Bei zukünftiger Einführung von Analytics müsste auf `vanilla-cookieconsent` v3 oder eine ähnlich kategorisierungsfähige Bibliothek migriert werden.
- **Risiko:** Keine Category-basierte Steuerung; falls Vercel Analytics aktiviert wird, muss das Banner erweitert oder die Bibliothek gewechselt werden.
- **Klarstellung:** Der von der Library gesetzte `CookieConsent`-Cookie ist ein technisch-notwendiger Consent-Management-Cookie, kein Tracking-Cookie. Er gilt unter TTDSG §25 Abs. 2 Nr. 2 als genehmigungsfrei.

---

## Verwandte Entscheidungen

- [ADR-001](ADR-001-nextjs-t3-ohne-backend.md): Kein Backend → localStorage als einzige Persistenzschicht
- [ADR-002](ADR-002-zustand-localstorage.md): Zustand persist mit localStorage
