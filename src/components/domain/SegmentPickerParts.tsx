import React from 'react';
import { AUDIENCE_OPTIONS, type TargetAudience } from '../../shared/segments';

type OptionRefs = React.MutableRefObject<(HTMLButtonElement | null)[]>;
/**
 * Setas dentro de um radiogroup movem seleção e foco (padrão APG).
 * `options` é a ordem visual; o foco vai para o botão recém-selecionado.
 *
 * A navegação é por segmentos VISÍVEIS: enquanto há busca, as setas só
 * percorrem o que está na tela (senão o foco sumiria num card oculto).
 */
export function useRadioArrowKey<V extends string>(
  options: readonly V[],
  current: V | null | undefined,
  select: (value: V) => void,
  refs: OptionRefs
) {
  return (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex(option => option === current);
    if (index < 0) return;
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (index + 1) % options.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (index - 1 + options.length) % options.length;
    } else {
      return;
    }
    event.preventDefault();
    select(options[next]);
    refs.current[next]?.focus();
  };
}

/** Público: segmented control que só aparece quando o segmento pergunta. */
export const SegmentAudienceControl: React.FC<{
  groupId: string;
  audience: TargetAudience | null;
  question: string;
  onAudienceChange: (audience: TargetAudience | null) => void;
  refs: OptionRefs;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}> = ({ groupId, audience, question, onAudienceChange, refs, onKeyDown }) => (
  <div className="mt-4">
    <p id={`${groupId}-audience`} className="text-sm font-bold text-text-primary mb-2">
      {question}
    </p>
    <div
      role="radiogroup"
      aria-labelledby={`${groupId}-audience`}
      tabIndex={-1}
      className="inline-flex rounded-xl border border-border bg-surface p-1"
      onKeyDown={onKeyDown}
    >
      {AUDIENCE_OPTIONS.map((option, index) => {
        const selected = audience === option.value;
        return (
          <button
            key={option.value}
            ref={node => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onAudienceChange(option.value)}
            className={[
              'rounded-lg px-4 py-1.5 text-sm font-bold transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-focus',
              selected ? 'bg-accent text-accent-fg' : 'text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

/**
 * Texto livre de OTHER ("o que você faz?"). O backend normaliza e corta em 80;
 * aqui cortamos o óbvio para não enviar lixo.
 */
export const SegmentOtherField: React.FC<{
  value: string | null | undefined;
  onChange: (text: string) => void;
}> = ({ value, onChange }) => (
  <label className="block mt-4">
    <span className="text-sm font-bold text-text-primary">
      Descreva seu negócio <span className="font-normal text-text-muted">(opcional)</span>
    </span>
    <input
      type="text"
      value={value ?? ''}
      onChange={event => onChange(event.target.value.slice(0, 80))}
      placeholder="Ex.: estúdio de pilates, pet shop com banho e tosa…"
      maxLength={80}
      className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus-visible:ring-2 focus-visible:ring-focus"
    />
  </label>
);
