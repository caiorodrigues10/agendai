import React, { useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DynamicIcon } from '../ui/DynamicIcon';
import {
  AUDIENCE_OPTIONS,
  FIRST_CLASS_SEGMENTS,
  audienceAppliesTo,
  getSegmentConfig,
  type BusinessSegment,
  type TargetAudience,
} from '../../shared/segments';

type OptionRefs = React.MutableRefObject<(HTMLButtonElement | null)[]>;
/**
 * Setas dentro de um radiogroup movem seleção e foco (padrão APG).
 * `options` é a ordem visual; o foco vai para o botão recém-selecionado.
 */
function useRadioArrowKey<V extends string>(
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

/**
 * Escolha de segmento no cadastro e no wizard do master.
 *
 * Só os 4 first-class são oferecidos — BEAUTY_STUDIO, LASH_BROW_STUDIO,
 * AESTHETICS e SPA continuam válidos para quem já os tem, mas não são
 * apresentados a quem está começando.
 *
 * Público é um segmented control que só aparece quando faz sentido no segmento:
 * em PETSHOP ele não é exibido (e o backend recusa se chegar).
 */
export const SegmentPicker: React.FC<{
  value?: BusinessSegment | null;
  audience?: TargetAudience | null;
  onChange: (segment: BusinessSegment) => void;
  onAudienceChange: (audience: TargetAudience | null) => void;
  error?: string;
  /** Rótulo acima do grid. */
  legend?: string;
  /** Quando o segmento ainda não foi escolhido, ainda assim mostra o controle? */
  showAudienceBeforeChoice?: boolean;
}> = ({
  value,
  audience,
  onChange,
  onAudienceChange,
  error,
  legend = 'Qual é o tipo do seu negócio?',
  showAudienceBeforeChoice = false,
}) => {
  const groupId = useId();
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audienceRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const config = getSegmentConfig(value);
  const showAudience = value
    ? audienceAppliesTo(value)
    : showAudienceBeforeChoice;

  // Trocar de segmento leva o público para o sugerido do novo. Feito no clique,
  // e não num useEffect, porque o callback do pai é inline: com efeito ficaria
  // setValue -> re-render -> efeito de novo, em loop.
  const pick = (segment: BusinessSegment) => {
    onChange(segment);
    onAudienceChange(getSegmentConfig(segment).targetAudience.suggested);
  };

  const onSegmentsKeyDown = useRadioArrowKey(FIRST_CLASS_SEGMENTS, value, pick, segmentRefs);
  const onAudienceKeyDown = useRadioArrowKey(
    AUDIENCE_OPTIONS.map(option => option.value),
    audience ?? null,
    onAudienceChange,
    audienceRefs
  );

  return (
    <fieldset
      className="min-w-0"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${groupId}-error` : undefined}
    >
      <legend className="text-sm font-bold text-text-primary mb-3">{legend}</legend>

      <div
        role="radiogroup"
        aria-label={legend}
        tabIndex={-1}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        onKeyDown={onSegmentsKeyDown}
      >
        {FIRST_CLASS_SEGMENTS.map((segment, index) => {
          const c = getSegmentConfig(segment);
          const selected = value === segment;
          return (
            <button
              key={segment}
              ref={node => {
                segmentRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (!value && index === 0) ? 0 : -1}
              onClick={() => pick(segment)}
              className={[
                'flex flex-col gap-1 rounded-xl border p-3 text-left transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                selected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface hover:border-hover-border',
              ].join(' ')}
            >
              <DynamicIcon
                name={c.icon}
                size={20}
                className={selected ? 'text-accent-fg' : 'text-text-muted'}
              />
              <span className="text-sm font-bold text-text-primary">{c.labels.segmentLabel}</span>
              <span className="text-xs text-text-muted leading-snug">{c.cardDescription}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p id={`${groupId}-error`} role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}

      <AnimatePresence initial={false}>
        {showAudience && (
          <motion.div
            key={value ?? 'audience'}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <p id={`${groupId}-audience`} className="text-sm font-bold text-text-primary mb-2">
                {config.audienceQuestion}
              </p>
              <div
                role="radiogroup"
                aria-labelledby={`${groupId}-audience`}
                tabIndex={-1}
                className="inline-flex rounded-xl border border-border bg-surface p-1"
                onKeyDown={onAudienceKeyDown}
              >
                {AUDIENCE_OPTIONS.map((option, index) => {
                  const selected = audience === option.value;
                  return (
                    <button
                      key={option.value}
                      ref={node => {
                        audienceRefs.current[index] = node;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => onAudienceChange(option.value)}
                      className={[
                        'rounded-lg px-4 py-1.5 text-sm font-bold transition-colors outline-none',
                        'focus-visible:ring-2 focus-visible:ring-focus',
                        selected
                          ? 'bg-accent text-accent-fg'
                          : 'text-text-muted hover:text-text-primary',
                      ].join(' ')}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {value && <p className="mt-3 text-xs text-text-muted">{config.pickSummary}</p>}
    </fieldset>
  );
};
