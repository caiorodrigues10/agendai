import React, { useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DynamicIcon } from '../ui/DynamicIcon';
import {
  AUDIENCE_OPTIONS,
  FIRST_CLASS_SEGMENTS,
  SEGMENTS_BY_GROUP,
  audienceAppliesTo,
  getSegmentConfig,
  segmentSearchText,
  type BusinessSegment,
  type TargetAudience,
} from '../../shared/segments';
import {
  SegmentAudienceControl,
  SegmentOtherField,
  useRadioArrowKey,
} from './SegmentPickerParts';

/** Busca por nome, descrição e aliases comuns ("unha", "pet", "carro"). */
function matchesSearch(segment: BusinessSegment, needle: string): boolean {
  if (!needle) return true;
  return segmentSearchText(segment).includes(needle);
}

/**
 * Escolha de segmento no cadastro e no wizard do master.
 *
 * Os 22 segmentos são oferecidos, agrupados por categoria e com busca no topo
 * (digitar "unha" destaca Manicure). "Outro" fica sempre visível no final, com
 * um campo de texto opcional para o usuário descrever o negócio.
 *
 * Público é um segmented control que só aparece quando faz sentido no segmento:
 * em PETSHOP e nos demais sem público ele não é exibido (e o backend recusa).
 */
export const SegmentPicker: React.FC<{
  value?: BusinessSegment | null;
  audience?: TargetAudience | null;
  /** Texto livre de OTHER (máx. 80). Nulo/vazio em qualquer outro segmento. */
  otherText?: string | null;
  onChange: (segment: BusinessSegment) => void;
  onAudienceChange: (audience: TargetAudience | null) => void;
  onOtherTextChange?: (text: string) => void;
  error?: string;
  /** Rótulo acima do grid. */
  legend?: string;
  /** Quando o segmento ainda não foi escolhido, ainda assim mostra o controle? */
  showAudienceBeforeChoice?: boolean;
}> = ({
  value,
  audience,
  otherText,
  onChange,
  onAudienceChange,
  onOtherTextChange,
  error,
  legend = 'Qual é o tipo do seu negócio?',
  showAudienceBeforeChoice = false,
}) => {
  const groupId = useId();
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audienceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [query, setQuery] = useState('');

  const config = getSegmentConfig(value);
  const showAudience = value
    ? audienceAppliesTo(value)
    : showAudienceBeforeChoice;
  const showOtherField = value === 'OTHER';

  const needle = query.trim().toLowerCase();
  // "Outro" é a saída de emergência: fica sempre visível, mesmo sem busca
  // bater, para ninguém ficar preso num grid filtrado.
  const visibleSegments = useMemo(() => {
    const found = FIRST_CLASS_SEGMENTS.filter(s => s !== 'OTHER' && matchesSearch(s, needle));
    return [...found, 'OTHER'];
  }, [needle]);
  // Grupos com os visíveis preservando a ordem; grupos vazios somem.
  const visibleGroups = useMemo(
    () =>
      SEGMENTS_BY_GROUP.map(group => ({
        ...group,
        segments: group.segments.filter(s => s === 'OTHER' || matchesSearch(s, needle)),
      })).filter(group => group.segments.length > 0),
    [needle]
  );
  const hasResults = visibleSegments.some(s => s !== 'OTHER');

  // Trocar de segmento leva o público para o sugerido do novo. Feito no clique,
  // e não num useEffect, porque o callback do pai é inline: com efeito ficaria
  // setValue -> re-render -> efeito de novo, em loop.
  const pick = (segment: BusinessSegment) => {
    onChange(segment);
    onAudienceChange(getSegmentConfig(segment).targetAudience.suggested);
  };

  const onSegmentsKeyDown = useRadioArrowKey(visibleSegments, value, pick, segmentRefs);
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
      aria-describedby={error ? `${groupId}-error` : `${groupId}-summary`}
    >
      <legend className="text-sm font-bold text-text-primary mb-3">{legend}</legend>

      <label className="block mb-3">
        <span className="sr-only">Buscar segmento</span>
        <input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Buscar segmento (ex.: unha, pet, carro)"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
      </label>

      <div
        role="radiogroup"
        aria-label={legend}
        tabIndex={-1}
        onKeyDown={onSegmentsKeyDown}
      >
        {visibleGroups.map(group => (
          <div key={group.group} className="mb-4 last:mb-0">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted mb-2">
              {group.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {group.segments.map(segment => {
                const index = visibleSegments.indexOf(segment);
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
                    tabIndex={selected || (!value && visibleSegments[0] === segment) ? 0 : -1}
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
          </div>
        ))}

        {!hasResults && (
          <p className="text-sm text-text-muted py-4 text-center">
            Nenhum segmento encontrado para “{query}”. Tente outra palavra ou escolha “Outro”.
          </p>
        )}
      </div>

      {error && (
        <p id={`${groupId}-error`} role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}

      {showOtherField && onOtherTextChange && (
        <SegmentOtherField value={otherText} onChange={onOtherTextChange} />
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
            <SegmentAudienceControl
              groupId={groupId}
              audience={audience ?? null}
              question={config.audienceQuestion}
              onAudienceChange={onAudienceChange}
              refs={audienceRefs}
              onKeyDown={onAudienceKeyDown}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {value && (
        <p id={`${groupId}-summary`} className="mt-3 text-xs text-text-muted">
          {config.pickSummary}
        </p>
      )}
    </fieldset>
  );
};
