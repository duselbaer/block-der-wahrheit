import type { Metadata } from "next";
import "./globals.css";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";

export const metadata: Metadata = {
  title: "Block der Wahrheit",
  description: "Punktetafel für das Kartenspiel Wizard",
};

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
