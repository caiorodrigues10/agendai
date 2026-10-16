import React, { useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuCheck as Check,
  LuSearch as Search,
  LuSearchX as SearchX,
  LuX as X,
} from 'react-icons/lu';
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
 * Card de segmento: chip do ícone, título com no máximo 2 linhas e
 * descrição cortada em 2. Mesmo tamanho para qualquer card do grid
 * (h-full + min-h), com estados de hover/foco/selecionado.
 */
const SegmentCard: React.FC<{
  segment: BusinessSegment;
  selected: boolean;
  tabIndex: 0 | -1;
  innerRef: (node: HTMLButtonElement | null) => void;
  onPick: () => void;
}> = ({ segment, selected, tabIndex, innerRef, onPick }) => {
  const c = getSegmentConfig(segment);
  return (
    <button
      ref={innerRef}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={onPick}
      className={[
        'relative flex h-full min-h-[128px] w-full flex-col gap-2 rounded-2xl border p-4 text-left',
        'transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out outline-none',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px] hover:shadow-accent/30',
        'motion-reduce:hover:translate-y-0 motion-reduce:transition-none',
        'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        selected
          ? 'border-accent bg-accent/10'
          : 'border-border bg-surface hover:border-accent/40',
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
          selected ? 'bg-accent text-accent-fg' : 'bg-accent/10 text-accent',
        ].join(' ')}
      >
        <DynamicIcon name={c.icon} size={18} />
      </span>
      <span className="line-clamp-2 text-sm font-semibold leading-tight text-balance break-words text-text-primary">
        {c.labels.segmentLabel}
      </span>
      <span className="line-clamp-2 text-xs leading-snug text-text-secondary">
        {c.cardDescription}
      </span>
      {selected && (
        <span
          aria-hidden
          className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-fg"
        >
          <Check size={11} strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

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

      {/* Busca sticky: a lista de grupos é longa; o campo acompanha a rolagem. */}
      <div className="sticky top-0 z-20 mb-4 bg-bg/80 pb-2 backdrop-blur">
        <div className="relative">
          <label htmlFor={`${groupId}-search`} className="sr-only">
            Buscar segmento
          </label>
          <Search
            size={15}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            id={`${groupId}-search`}
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Buscar segmento (ex.: unha, pet, carro)"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-10 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpar busca"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X size={14} aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label={legend}
        tabIndex={-1}
        onKeyDown={onSegmentsKeyDown}
        className="@container"
      >
        {visibleGroups.map(group => (
          <div key={group.group} className="mt-6">
            <div className="mb-3 flex items-baseline justify-between border-t border-white/5 pt-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                {group.label}
              </p>
              <span aria-hidden className="text-[11px] font-semibold tabular-nums text-text-muted">
                {group.segments.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 @sm:grid-cols-3 @lg:grid-cols-4">
              {group.segments.map(segment => {
                const index = visibleSegments.indexOf(segment);
                return (
                  <SegmentCard
                    key={segment}
                    segment={segment}
                    selected={value === segment}
                    tabIndex={
                      value === segment || (!value && visibleSegments[0] === segment) ? 0 : -1
                    }
                    innerRef={node => {
                      segmentRefs.current[index] = node;
                    }}
                    onPick={() => pick(segment)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {!hasResults && (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface/50 px-4 py-10 text-center">
            <SearchX size={22} className="text-text-muted" aria-hidden />
            <p className="text-sm font-medium text-text-secondary">
              Nenhum segmento encontrado para “{query}”.
            </p>
            <p className="text-xs text-text-muted">Tente outro termo ou escolha “Outro”.</p>
          </div>
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

      {/* Saúde: o aviso acompanha a escolha, para não virar prontuário por engano. */}
      {value && config.complianceNote && (
        <p className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning" role="note">
          {config.complianceNote}
        </p>
      )}
    </fieldset>
  );
};
