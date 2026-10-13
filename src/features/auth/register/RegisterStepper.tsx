import React from 'react';
import { LuCheck as Check } from 'react-icons/lu';

export type RegisterStep = 1 | 2 | 3;

export interface RegisterStepItem {
  step: RegisterStep;
  label: string;
}

/** Rótulos curtos do wizard de cadastro (3 passos). */
export const REGISTER_STEPS: RegisterStepItem[] = [
  { step: 1, label: 'Seus dados' },
  { step: 2, label: 'Segmento' },
  { step: 3, label: 'Seu negócio' },
];

interface RegisterStepperProps {
  current: RegisterStep;
  steps?: RegisterStepItem[];
  /** Só etapas já concluídas podem ser clicadas (voltar); nunca pula para frente. */
  onStepClick?: (step: RegisterStep) => void;
}

/**
 * Indicador de progresso do cadastro: bolinha com check na etapa concluída,
 * verde no passo atual, "Etapa X de 3" para leitores de tela. Sem pular para
 * frente — o clique só existe em passos concluídos.
 */
export const RegisterStepper: React.FC<RegisterStepperProps> = ({
  current,
  steps = REGISTER_STEPS,
  onStepClick,
}) => {
  const progress = (current - 1) / (steps.length - 1);

  return (
    <nav aria-label="Etapas do cadastro" className="relative mb-6 w-full px-2">
      <div aria-hidden className="absolute left-[12%] right-[12%] top-4 h-px bg-border" />
      <div
        aria-hidden
        className="absolute left-[12%] top-4 h-px bg-accent transition-all duration-500"
        style={{ width: `calc((100% - 24%) * ${progress})` }}
      />
      <ol className="relative flex items-start justify-between">
        {steps.map(item => {
          const complete = current > item.step;
          const active = current === item.step;
          const clickable = complete && !!onStepClick;
          const body = (
            <>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition-all ${
                  active || complete
                    ? 'border-accent bg-accent text-accent-fg shadow-[0_0_20px_color-mix(in_srgb,var(--ag-accent)_28%,transparent)]'
                    : 'border-border bg-bg text-text-muted'
                }`}
              >
                {complete ? <Check size={14} /> : item.step}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  active ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {item.label}
              </span>
            </>
          );

          return (
            <li
              key={item.step}
              aria-current={active ? 'step' : undefined}
              className="flex w-1/3 flex-col items-center gap-2"
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(item.step)}
                  className="flex flex-col items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 cursor-pointer"
                >
                  {body}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2 px-2 py-1">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-muted">
        Etapa {current} de {steps.length}
      </p>
    </nav>
  );
};
