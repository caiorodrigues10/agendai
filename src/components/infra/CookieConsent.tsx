import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LuCookie as Cookie, LuShieldCheck as ShieldCheck } from 'react-icons/lu';
import { cookieConsentStorage } from '../../utils/cookieConsentStorage';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(cookieConsentStorage.get() === null);
  }, []);

  const acceptAll = () => {
    cookieConsentStorage.acceptAll();
    setVisible(false);
  };

  const acceptEssential = () => {
    cookieConsentStorage.acceptEssential();
    setVisible(false);
  };

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
          className="fixed inset-x-0 bottom-0 z-40 p-4 sm:p-6 pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-surface/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-surface/95">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Cookie size={18} aria-hidden />
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-semibold text-text-primary">Cookies e medição</p>
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  Usamos armazenamento local essencial para sessão, tema e fila.{' '}
                  <span className="inline-flex items-center gap-1 font-medium text-accent">
                    <ShieldCheck size={13} aria-hidden />
                    Analytics e anúncios só entram se você aceitar
                  </span>
                  .{' '}
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

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={acceptEssential}
                className="shrink-0 cursor-pointer rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-text-secondary transition hover:bg-bg"
              >
                Só o necessário
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="shrink-0 cursor-pointer rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
