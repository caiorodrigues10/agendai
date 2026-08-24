import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, ShieldCheck } from 'lucide-react'
import { cookieConsentStorage } from '../../utils/cookieConsentStorage'

export const CookieConsent: React.FC = () => {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		setVisible(cookieConsentStorage.get() === null)
	}, [])

	const accept = () => {
		cookieConsentStorage.accept()
		setVisible(false)
	}

	return (
		<AnimatePresence>
			{visible && (
				<motion.aside
					role="dialog"
					aria-live="polite"
					aria-label="Consentimento de cookies"
					initial={{ y: 24, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 24, opacity: 0 }}
					transition={{ duration: 0.28, ease: 'easeOut' }}
					className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6 pointer-events-none"
				>
					<div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-surface/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-5 sm:p-5 dark:border-white/10 dark:bg-[#141414]/95">
						<div className="flex min-w-0 flex-1 items-start gap-3">
							<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
								<Cookie size={18} aria-hidden />
							</div>
							<div className="min-w-0 space-y-1.5">
								<p className="text-sm font-semibold text-text-primary">
									Cookies e armazenamento local
								</p>
								<p className="text-[13px] leading-relaxed text-text-secondary">
									Utilizamos cookies e armazenamento local essenciais para sessão,
									preferências e fila digital.{' '}
									<span className="inline-flex items-center gap-1 font-medium text-accent">
										<ShieldCheck size={13} aria-hidden />
										Seus dados estão protegidos
									</span>
									{' — '}
									cada salão é um mundo isolado.{' '}
									<Link
										to="/privacidade"
										className="font-medium text-accent underline-offset-2 hover:underline"
									>
										Política de Privacidade
									</Link>
									.
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={accept}
							className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
						>
							Aceitar
						</button>
					</div>
				</motion.aside>
			)}
		</AnimatePresence>
	)
}
