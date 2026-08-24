const KEY = 'agendai:cookie-consent'

export type CookieConsentStatus = 'accepted'

export const cookieConsentStorage = {
	get(): CookieConsentStatus | null {
		try {
			const value = localStorage.getItem(KEY)
			return value === 'accepted' ? 'accepted' : null
		} catch {
			return null
		}
	},
	accept() {
		try {
			localStorage.setItem(KEY, 'accepted')
		} catch {
			/* private mode */
		}
	},
}
