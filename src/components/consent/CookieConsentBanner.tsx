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
