const KEY = 'agendai:referral-code'
/** Mantém o código entre visitas (indicação dono→dono costuma ser multi-dia). */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

interface Stored { code: string; savedAt: number }

function readRaw(): Stored | null {
	try {
		const raw = localStorage.getItem(KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as Stored
		if (!parsed?.code || typeof parsed.savedAt !== 'number') {
			// migra valor legado (string pura em sessionStorage/localStorage)
			if (typeof raw === 'string' && raw.length > 0 && !raw.startsWith('{')) {
				return { code: raw.trim().toUpperCase(), savedAt: Date.now() }
			}
			return null
		}
		return parsed
	} catch {
		try {
			const legacy = sessionStorage.getItem(KEY)
			if (legacy) return { code: legacy.trim().toUpperCase(), savedAt: Date.now() }
		} catch {
			/* ignore */
		}
		return null
	}
}

export const referralStorage = {
	save(code: string) {
		const normalized = code.trim().toUpperCase()
		if (!normalized) return
		const payload: Stored = { code: normalized, savedAt: Date.now() }
		try {
			localStorage.setItem(KEY, JSON.stringify(payload))
		} catch {
			try {
				sessionStorage.setItem(KEY, normalized)
			} catch {
				/* private mode */
			}
		}
	},
	get(): string | null {
		const stored = readRaw()
		if (!stored) return null
		if (Date.now() - stored.savedAt > MAX_AGE_MS) {
			referralStorage.clear()
			return null
		}
		return stored.code
	},
	clear() {
		try {
			localStorage.removeItem(KEY)
		} catch {
			/* ignore */
		}
		try {
			sessionStorage.removeItem(KEY)
		} catch {
			/* ignore */
		}
	},
}
