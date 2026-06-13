// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';

vi.mock('vanilla-cookieconsent', () => ({
  run: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CookieConsentBanner', () => {
  it('rendert ohne Fehler und gibt kein DOM-Element aus', () => {
    const { container } = render(<CookieConsentBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('initialisiert vanilla-cookieconsent mit disablePageInteraction', async () => {
    const CookieConsent = await import('vanilla-cookieconsent');
    render(<CookieConsentBanner />);

    expect(CookieConsent.run).toHaveBeenCalledOnce();
    const config = vi.mocked(CookieConsent.run).mock.calls[0][0];
    expect(config.disablePageInteraction).toBe(true);
  });

  it('konfiguriert Kategorien necessary (readOnly) und analytics (opt-in)', async () => {
    const CookieConsent = await import('vanilla-cookieconsent');
    render(<CookieConsentBanner />);

    const config = vi.mocked(CookieConsent.run).mock.calls[0][0];
    expect(config.categories?.necessary?.readOnly).toBe(true);
    expect(config.categories?.analytics?.enabled).toBe(false);
  });

  it('setzt Deutsch als Standard-Sprache', async () => {
    const CookieConsent = await import('vanilla-cookieconsent');
    render(<CookieConsentBanner />);

    const config = vi.mocked(CookieConsent.run).mock.calls[0][0];
    expect(config.language?.default).toBe('de');
  });
});
