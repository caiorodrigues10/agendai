import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuCheck as Check,
  LuChevronRight as ChevronRight,
  LuRocket as Rocket,
  LuArrowRight as ArrowRight,
  LuSkipForward as SkipForward,
} from 'react-icons/lu';
import { barbershopApi } from '../../infra/barbershopApi';
import { getErrorMessage } from '../../utils/errorMessage';

/**
 * OnboardingChecklist — Wizard-style onboarding.
 *
 * Shows ONE step at a time. Completed steps are collapsed below.
 * Steps pre-filled during registration are auto-marked by the backend.
 *
 * Modes:
 * - wizard: active step highlighted, completed collapsed, pending hidden
 * - completed: all done, celebration screen
 */

interface Step {
  key: string;
  label: string;
  completed: boolean;
  required: boolean;
}

interface OnboardingChecklistProps {
  barbershopId: string;
  shopName: string;
  onNavigate: (tab: string) => void;
  onDone?: () => void;
  onCompleted?: () => void;
}

const DESTINATIONS: Record<string, string> = {
  PROFILE: 'settings',
  SEGMENT: 'settings',
  SCHEDULE: 'settings',
  SERVICES: 'services',
  OPERATION_MODE: 'settings',
  PUBLIC_LINK: 'link',
};

const TITLES: Record<string, string> = {
  PROFILE: 'Confirme os dados do seu salão',
  SEGMENT: 'Qual é o tipo do seu espaço?',
  SCHEDULE: 'Diga quando você atende',
  SERVICES: 'Cadastre o que seus clientes podem escolher',
  OPERATION_MODE: 'Escolha como seus clientes serão atendidos',
  PUBLIC_LINK: 'Coloque seu salão no ar',
};

const DESCRIPTIONS: Record<string, string> = {
  PROFILE: 'Nome, endereço e WhatsApp do seu espaço.',
  SEGMENT: 'Barbearia, salão, estúdio — isso ajuda a personalizar sua experiência.',
  SCHEDULE: 'Defina os dias e horários em que você atende.',
  SERVICES: 'Crie os serviços que seus clientes podem agendar.',
  OPERATION_MODE: 'Fila, agenda ou ambos — como seus clientes serão atendidos.',
  PUBLIC_LINK: 'Seu link personalizado para compartilhar com clientes.',
};

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  barbershopId,
  shopName,
  onNavigate,
  onDone,
  onCompleted,
}) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const required = useMemo(() => steps.filter(s => s.required), [steps]);
  const completedCount = useMemo(() => required.filter(s => s.completed).length, [required]);
  const allDone = useMemo(() => required.length > 0 && required.every(s => s.completed), [required]);
  const activeStep = useMemo(() => required.find(s => !s.completed) ?? null, [required]);
  const completedSteps = useMemo(() => required.filter(s => s.completed), [required]);
  const progress = useMemo(
    () => required.length > 0 ? Math.round((completedCount / required.length) * 100) : 0,
    [completedCount, required.length],
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await barbershopApi.getOnboarding(barbershopId);
      setSteps(data.steps);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar sua configuração inicial.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void barbershopApi.markOnboardingWelcomeSeen(barbershopId).catch(() => undefined);
    void load();
  }, [barbershopId]);

  useEffect(() => {
    if (allDone) onCompleted?.();
  }, [allDone, onCompleted]);

  const confirmStep = async (step: Step) => {
    setBusy(true);
    setError(null);
    try {
      await barbershopApi.updateOnboardingStep(barbershopId, step.key);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Conclua a configuração indicada antes de confirmar.'));
    } finally {
      setBusy(false);
    }
  };

  const skipAll = async () => {
    setBusy(true);
    try {
      await barbershopApi.dismissOnboarding(barbershopId);
      onDone?.();
    } catch {
      setBusy(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-text-secondary">
        Carregando…
      </div>
    );
  }

  /* ── All completed ── */
  if (allDone) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-success/40 bg-success/10 p-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-white">
            <Check size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-black text-text-primary">
            {shopName || 'Seu salão'} está no ar!
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Tudo pronto para receber seus primeiros clientes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('link')}
              className="min-h-11 rounded-xl bg-accent px-5 text-sm font-bold text-accent-fg hover:bg-accent/90 transition-colors"
            >
              Compartilhar link
            </button>
            <button
              type="button"
              onClick={onDone}
              className="min-h-11 rounded-xl border border-border px-5 text-sm font-bold text-text-secondary hover:border-border-strong transition-colors"
            >
              Ir para o painel
            </button>
          </div>
        </motion.section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-bold text-text-primary">Próximos passos (opcionais)</h3>
          <p className="mt-1 text-xs text-text-secondary">
            Melhore sua experiência quando quiser.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { label: '🔔 Alerta de fila cheia', tab: 'settings' },
              { label: '📱 Instalar no celular', tab: 'settings' },
              { label: '👥 Cadastrar equipe', tab: 'team' },
              { label: '⚙️ Preferências', tab: 'settings' },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.tab)}
                className="min-h-11 rounded-xl border border-border px-3 text-left text-sm font-semibold text-text-primary hover:border-accent/40 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  /* ── Wizard mode ── */
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* ─── HEADER ─── */}
      <section className="rounded-2xl border border-accent/40 bg-surface p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Rocket size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-accent">
              Primeiro acesso
            </p>
            <h1 className="mt-1 text-xl font-black text-text-primary">
              Vamos colocar {shopName || 'seu salão'} no ar
            </h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[11px] font-bold text-text-secondary">
            <span>Etapa {completedCount + 1} de {required.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="mt-3 flex gap-1.5">
          {required.map((s, i) => (
            <div
              key={s.key}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s.completed
                  ? 'bg-accent'
                  : s.key === activeStep?.key
                    ? 'bg-accent/40'
                    : 'bg-border'
              }`}
            />
          ))}
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* ─── ACTIVE STEP (highlighted) ─── */}
      {activeStep && (
        <AnimatePresence mode="wait">
          <motion.section
            key={activeStep.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border-2 border-accent/50 bg-surface p-5 sm:p-6 shadow-lg shadow-accent/5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-accent-fg">
                {completedCount + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-text-primary">
                  {TITLES[activeStep.key] || activeStep.label}
                </h2>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {DESCRIPTIONS[activeStep.key] || activeStep.label}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => onNavigate(DESTINATIONS[activeStep.key] || 'settings')}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-accent-fg hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                Configurar
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => confirmStep(activeStep)}
                className="min-h-11 rounded-xl border border-border px-4 text-sm font-bold text-text-secondary hover:border-accent hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                Já configurei
              </button>
            </div>
          </motion.section>
        </AnimatePresence>
      )}

      {/* ─── COMPLETED STEPS (collapsed) ─── */}
      {completedSteps.length > 0 && (
        <section className="space-y-1" aria-label="Etapas concluídas">
          {completedSteps.map(step => (
            <button
              key={step.key}
              type="button"
              onClick={() => onNavigate(DESTINATIONS[step.key] || 'settings')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface group"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Check size={13} />
              </span>
              <span className="flex-1 text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {TITLES[step.key] || step.label}
              </span>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </section>
      )}

      {/* ─── SKIP ─── */}
      <div className="text-center pt-1">
        <button
          type="button"
          disabled={busy}
          onClick={skipAll}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer disabled:opacity-50"
        >
          <SkipForward size={13} />
          Pular por agora
        </button>
      </div>
    </div>
  );
};
