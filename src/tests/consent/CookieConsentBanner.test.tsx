// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';

function clearConsentCookie() {
  document.cookie = 'CookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

beforeEach(() => {
  clearConsentCookie();
});

afterEach(() => {
  cleanup();
  clearConsentCookie();
});

describe('CookieConsentBanner', () => {
  it('zeigt das Banner wenn noch kein Consent gespeichert ist', () => {
    render(<CookieConsentBanner />);
    expect(screen.getByText('Verstanden')).toBeInTheDocument();
  });

  it('speichert Einwilligung als technisch-notwendigen Cookie (nicht als Tracking)', () => {
    render(<CookieConsentBanner />);
    fireEvent.click(screen.getByText('Verstanden'));

    expect(document.cookie).toContain('CookieConsent=true');
  });

  it('zeigt das Banner nicht wenn Consent-Cookie bereits gesetzt ist', () => {
    document.cookie = 'CookieConsent=true; path=/';
    render(<CookieConsentBanner />);

    expect(screen.queryByText('Verstanden')).not.toBeInTheDocument();
  });
});
