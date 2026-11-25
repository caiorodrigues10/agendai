import React from 'react';
import { Button } from '../../../components/ui/Button';
import { PostPreviewBox } from '../PostPreviewBox';
import {
  CAPTION_MAX,
  CTA_RENDER_MAX,
  MODE_OPTIONS,
  PRICE_MAX_ITEMS,
  TONE_OPTIONS,
  type PriceRow,
} from '../postEditorShared';
import type { PostAiSuggestion } from '../../../infra/barbershopApi';
import type { PostFormat, PostMode } from '../../../types';
import { LuChevronRight as ChevronRight, LuSparkles as Sparkles, LuLoaderCircle as Loader2, LuTrash2 as Trash2 } from 'react-icons/lu';

export interface LegacyContentTabProps {
  title: string;
  ctaText: string;
  content: string;
  titleWarningMessage: string;
  ctaWarningMessage: string;
  onTitleChange: (value: string) => void;
  onCtaChange: (value: string) => void;
  onContentChange: (value: string) => void;
  postMode: PostMode;
  onPostModeChange: (mode: PostMode) => void;
  selectedTemplateName: string | undefined;
  onOpenTemplatePicker: () => void;
  isPriceSplit: boolean;
  priceItems: PriceRow[];
  priceItemWarnings: string[];
  businessName: string;
  businessWarningMessage: string;
  shopName: string | undefined;
  hasShopServices: boolean;
  onUpdatePriceRow: (index: number, patch: Partial<PriceRow>) => void;
  onAddPriceRow: () => void;
  onRemovePriceRow: (index: number) => void;
  onImportPriceServices: () => void;
  onBusinessNameChange: (value: string) => void;
  tone: 'promocional' | 'informativo' | 'divertido' | null;
  onToneChange: (tone: 'promocional' | 'informativo' | 'divertido' | null) => void;
  extra: string;
  onExtraChange: (value: string) => void;
  suggestions: PostAiSuggestion[];
  generatingSuggestions: boolean;
  onGenerate: () => void;
  onApplySuggestion: (suggestion: PostAiSuggestion) => void;
  format: PostFormat;
  previewUrl: string | null;
  previewLoading: boolean;
  previewStale: boolean;
}

/** Aba "Conteúdo" do editor legado: título, CTA, lista de preços, legenda, modo e IA. */
export function LegacyContentTab(props: LegacyContentTabProps) {
  const {
    title, ctaText, content, titleWarningMessage, ctaWarningMessage,
    onTitleChange, onCtaChange, onContentChange, postMode, onPostModeChange,
    selectedTemplateName, onOpenTemplatePicker, isPriceSplit, priceItems, priceItemWarnings,
    businessName, businessWarningMessage, shopName, hasShopServices,
    onUpdatePriceRow, onAddPriceRow, onRemovePriceRow, onImportPriceServices, onBusinessNameChange,
    tone, onToneChange, extra, onExtraChange, suggestions, generatingSuggestions,
    onGenerate, onApplySuggestion, format, previewUrl, previewLoading, previewStale,
  } = props;

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        {/* Título */}
        <div>
          <label htmlFor="post-title" className="mb-1 block text-xs font-bold text-text-secondary">Título</label>
          <input
            id="post-title"
            type="text"
            maxLength={80}
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="Ex.: Corte + barba por R$ 45"
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
            aria-describedby={titleWarningMessage ? 'post-title-render-warning' : undefined}
          />
          {titleWarningMessage && (
            <p id="post-title-render-warning" role="status" className="mt-1 text-[11px] leading-snug text-warning">
              {titleWarningMessage}
            </p>
          )}
        </div>

        {/* CTA */}
        <div>
          <label htmlFor="post-cta" className="mb-1 block text-xs font-bold text-text-secondary">Texto do botão (CTA)</label>
          <input
            id="post-cta"
            type="text"
            maxLength={CTA_RENDER_MAX}
            value={ctaText}
            onChange={e => onCtaChange(e.target.value)}
            placeholder="Ex.: Agendar horário"
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
            aria-describedby={ctaWarningMessage ? 'post-cta-render-warning' : undefined}
          />
          {ctaWarningMessage && (
            <p id="post-cta-render-warning" role="status" className="mt-1 text-[11px] leading-snug text-warning">
              {ctaWarningMessage}
            </p>
          )}
        </div>

        {/* Lista de preços (modelo price-split) */}
        {isPriceSplit && (
          <div data-testid="price-split-editor">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">Serviços e preços</span>
              <span className="text-[10px] text-text-muted">{priceItems.length}/{PRICE_MAX_ITEMS}</span>
            </div>
            <div className="space-y-2">
              {priceItems.map((row, index) => (
                <div key={index} className="rounded-xl border border-border p-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={row.name}
                      maxLength={100}
                      onChange={e => onUpdatePriceRow(index, { name: e.target.value })}
                      placeholder={`Serviço ${index + 1}`}
                      aria-label={`Nome do serviço ${index + 1}`}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-2.5 py-2 text-sm focus:border-accent focus:outline-none"
                      aria-describedby={priceItemWarnings[index] ? `price-item-warning-${index}` : undefined}
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.price}
                      maxLength={16}
                      onChange={e => onUpdatePriceRow(index, { price: e.target.value })}
                      placeholder="45,90"
                      aria-label={`Preço do serviço ${index + 1}`}
                      className="w-24 rounded-lg border border-border bg-bg px-2.5 py-2 text-sm focus:border-accent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onRemovePriceRow(index)}
                      disabled={priceItems.length <= 1}
                      className="rounded-lg px-2 text-text-muted hover:text-danger disabled:opacity-40"
                      aria-label={`Remover serviço ${index + 1}`}
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                  {priceItemWarnings[index] && (
                    <p id={`price-item-warning-${index}`} role="status" className="mt-1 text-[11px] leading-snug text-warning">
                      {priceItemWarnings[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {priceItems.length < PRICE_MAX_ITEMS && (
                <button
                  type="button"
                  onClick={onAddPriceRow}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-accent hover:text-accent"
                >
                  + Adicionar serviço
                </button>
              )}
              {hasShopServices && (
                <button
                  type="button"
                  onClick={onImportPriceServices}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-accent hover:text-accent"
                >
                  Importar dos meus serviços
                </button>
              )}
            </div>
            <div className="mt-3">
              <label htmlFor="post-business-name" className="mb-1 block text-xs font-bold text-text-secondary">Nome do negócio</label>
              <input
                id="post-business-name"
                type="text"
                maxLength={120}
                value={businessName}
                onChange={e => onBusinessNameChange(e.target.value)}
                placeholder={shopName || 'Ex.: Barber Test'}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                aria-describedby={businessWarningMessage ? 'post-business-render-warning' : undefined}
              />
              {businessWarningMessage && (
                <p id="post-business-render-warning" role="status" className="mt-1 text-[11px] leading-snug text-warning">
                  {businessWarningMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Legenda */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="post-content" className="text-xs font-bold text-text-secondary">Legenda</label>
            <span className="text-2xs text-text-muted">{content.length}/{CAPTION_MAX}</span>
          </div>
          <textarea
            id="post-content"
            rows={4}
            maxLength={CAPTION_MAX}
            value={content}
            onChange={e => onContentChange(e.target.value)}
            placeholder="Texto que acompanha o post (opcional)"
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {/* Modo + Tipo */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span id="post-mode-label" className="mb-1 block text-xs font-bold text-text-secondary">Destino do CTA</span>
            <div role="radiogroup" aria-labelledby="post-mode-label" className="flex overflow-hidden rounded-xl border border-border">
              {MODE_OPTIONS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={postMode === m.id}
                  tabIndex={postMode === m.id ? 0 : -1}
                  onKeyDown={event => {
                    const index = MODE_OPTIONS.findIndex(option => option.id === m.id);
                    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
                    if (!direction) return;
                    event.preventDefault();
                    const next = (index + direction + MODE_OPTIONS.length) % MODE_OPTIONS.length;
                    onPostModeChange(MODE_OPTIONS[next].id);
                    const radios = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
                    radios?.[next].focus();
                  }}
                  onClick={() => onPostModeChange(m.id)}
                  className={`min-h-10 flex-1 px-2 text-xs font-bold transition ${
                    postMode === m.id
                      ? 'bg-accent text-accent-fg'
                      : 'bg-bg text-text-secondary hover:bg-surface'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="post-template" className="mb-1 block text-xs font-bold text-text-secondary">Modelo</label>
            <button
              type="button"
              onClick={onOpenTemplatePicker}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-left text-sm hover:border-accent/50 focus:border-accent focus:outline-none"
            >
              {selectedTemplateName ?? 'Selecionar modelo…'}
            </button>
          </div>
        </div>

        {/* IA */}
        <details className="rounded-xl border border-border bg-bg/50 p-3">
          <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-text-secondary">
            <span className="flex items-center gap-1.5"><Sparkles size={13} aria-hidden /> Sugestões por IA</span>
            <ChevronRight size={12} aria-hidden />
          </summary>
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(t => (
                <button key={t.id} type="button"
                  onClick={() => onToneChange(tone === t.id ? null : t.id)}
                  className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${
                    tone === t.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-text-muted'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
            <textarea value={extra} onChange={e => onExtraChange(e.target.value)} maxLength={500} rows={2}
              placeholder="Contexto extra (ex.: promoção só até sexta)"
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs focus:border-accent focus:outline-none"
            />
            <Button variant="secondary" size="sm" onClick={onGenerate} disabled={generatingSuggestions}
              className="w-full gap-1.5"
            >
              {generatingSuggestions ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Sparkles size={13} aria-hidden />}
              {generatingSuggestions ? 'Gerando…' : 'Gerar sugestões'}
            </Button>
          </div>
        </details>

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-text-muted">Sugestões</p>
            {suggestions.map((s, i) => (
              <button key={i} type="button"
                onClick={() => onApplySuggestion(s)}
                className="w-full rounded-xl border border-border p-3 text-left transition hover:border-accent/40"
              >
                <p className="text-sm font-bold text-text-primary">{s.title}</p>
                {s.ctaText && <p className="mt-1 text-xs italic text-accent">{s.ctaText}</p>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview lateral */}
      <div className="hidden lg:block">
        <div className="sticky top-0">
          <PostPreviewBox
            format={format}
            previewUrl={previewUrl}
            loading={previewLoading}
            stale={previewStale}
          />
        </div>
      </div>
    </div>
  );
}
