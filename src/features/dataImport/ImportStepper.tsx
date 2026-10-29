import React from 'react';
import { LuCheck as Check, LuCircle as Circle } from 'react-icons/lu';

/**
 * Trilha de etapas do assistente de importação.
 *
 * Mostra onde o dono está (arquivo → alvo → mapa → validação → prévia →
 * confirmação → conclusão) e o que já foi feito.
 */
export interface ImportStepDefinition {
  id: string;
  label: string;
}

export const IMPORT_STEPS: ImportStepDefinition[] = [
  { id: 'upload', label: 'Arquivo' },
  { id: 'target', label: 'O que importar' },
  { id: 'mapping', label: 'Colunas' },
  { id: 'validate', label: 'Validação' },
  { id: 'review', label: 'Prévia' },
  { id: 'confirm', label: 'Confirmação' },
  { id: 'done', label: 'Conclusão' },
];

interface ImportStepperProps {
  currentStep: string;
  completedSteps: string[];
}

export const ImportStepper: React.FC<ImportStepperProps> = ({ currentStep, completedSteps }) => {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Etapas da importação">
      {IMPORT_STEPS.map((step, index) => {
        const done = completedSteps.includes(step.id);
        const active = step.id === currentStep;
        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={[
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                active
                  ? 'bg-accent text-accent-fg'
                  : done
                    ? 'bg-surface-2 text-text-primary'
                    : 'bg-surface-2 text-text-muted',
              ].join(' ')}
              aria-current={active ? 'step' : undefined}
              data-testid={`import-stepper-${step.id}`}
            >
              {done && !active ? (
                <Check size={12} aria-hidden="true" />
              ) : (
                <Circle size={8} fill="currentColor" aria-hidden="true" />
              )}
              {step.label}
            </span>
            {index < IMPORT_STEPS.length - 1 ? (
              <span className="h-px w-4 bg-border" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};
