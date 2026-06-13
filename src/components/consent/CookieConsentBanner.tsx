'use client';

import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';

export function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      disablePageInteraction: true,
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: { enabled: false },
      },
      language: {
        default: 'de',
        translations: {
          de: {
            consentModal: {
              title: 'Datenschutzeinstellungen',
              description:
                'Diese App speichert deinen Spielstand lokal im Browser (notwendig). ' +
                'Optional nutzen wir Analyse- und Werbedienste, um die App zu verbessern. ' +
                'Du kannst jederzeit nur notwendige Cookies akzeptieren.',
              acceptAllBtn: 'Alle akzeptieren',
              acceptNecessaryBtn: 'Nur notwendige',
              showPreferencesBtn: 'Einstellungen',
            },
            preferencesModal: {
              title: 'Cookie-Einstellungen',
              acceptAllBtn: 'Alle akzeptieren',
              acceptNecessaryBtn: 'Nur notwendige',
              savePreferencesBtn: 'Speichern',
              sections: [
                {
                  title: 'Notwendige Cookies',
                  description:
                    'Speichert deinen Spielstand im Browser (localStorage). ' +
                    'Ohne diese Funktion kann kein Spielstand gespeichert werden.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analyse & Werbung',
                  description:
                    'Ermöglicht Nutzungsanalyse (Vercel Analytics) und Werbeanzeigen (Google AdSense). ' +
                    'Hilft uns, die App zu verbessern und zu finanzieren.',
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
        },
      },
    });
  }, []);

  return null;
}
