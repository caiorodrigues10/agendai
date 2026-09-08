const KEY = 'agendai:cookie-consent-v2';
const LEGACY_KEY = 'agendai:cookie-consent';
const CHANGE_EVENT = 'agendai:consent-changed';

export type CookieConsentStatus = 'all' | 'essential';

function emitChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const cookieConsentStorage = {
  changeEvent: CHANGE_EVENT,
  get(): CookieConsentStatus | null {
    try {
      const value = localStorage.getItem(KEY);
      if (value === 'all' || value === 'essential') return value;
      return null;
    } catch {
      return null;
    }
  },
  allowsAnalytics(): boolean {
    return cookieConsentStorage.get() === 'all';
  },
  acceptAll() {
    try {
      localStorage.setItem(KEY, 'all');
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* private mode */
    }
    emitChange();
  },
  acceptEssential() {
    try {
      localStorage.setItem(KEY, 'essential');
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* private mode */
    }
    emitChange();
  },
  /** @deprecated use acceptAll — kept so testes/e2e antigos continuam claros */
  accept() {
    cookieConsentStorage.acceptAll();
  },
};
