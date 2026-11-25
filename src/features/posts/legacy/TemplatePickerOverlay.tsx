import React from 'react';
import FocusLock from 'react-focus-lock';
import { TemplateThumbnail } from '../TemplateThumbnail';
import { templatePhotoMode, type TemplateFilter } from '../postEditorShared';
import type { PostFormat, PostTemplateDef } from '../../../infra/postsApi';
import { LuLoaderCircle as Loader2, LuCheck as Check } from 'react-icons/lu';

export interface TemplatePickerOverlayProps {
  barbershopId: string;
  filteredTemplates: PostTemplateDef[];
  templatesLoading: boolean;
  templateKey: string;
  templateFilter: TemplateFilter;
  format: PostFormat;
  paletteKey: string;
  onFilterChange: (filter: TemplateFilter) => void;
  onSelectTemplate: (key: string) => void;
  onClose: () => void;
}

/** Overlay "Escolher modelo" do editor legado. */
export function TemplatePickerOverlay(props: TemplatePickerOverlayProps) {
  const {
    barbershopId, filteredTemplates, templatesLoading, templateKey, templateFilter,
    format, paletteKey, onFilterChange, onSelectTemplate, onClose,
  } = props;

  return (
    <div className="absolute inset-0 z-[110] flex items-end justify-center bg-black/80 sm:items-center sm:p-4">
      <FocusLock returnFocus className="w-full max-w-lg">
        <div className="w-full max-w-lg rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h4 className="text-sm font-bold text-text-primary">Escolher modelo</h4>
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-bg" aria-label="Fechar">
              ✕
            </button>
          </div>
          <div className="flex gap-1.5 border-b border-border px-4 pt-3 pb-2 overflow-x-auto">
            {([
              { id: 'all', label: 'Todos' },
              { id: 'with-photo', label: 'Com foto' },
              { id: 'no-photo', label: 'Sem foto' },
            ] as const).map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFilterChange(f.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  templateFilter === f.id ? 'bg-accent text-accent-fg' : 'text-text-muted hover:bg-bg'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
            {templatesLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-text-muted">
                <Loader2 size={14} className="animate-spin" aria-hidden /> Carregando modelos…
              </div>
            ) : filteredTemplates.length === 0 ? (
              <p className="py-8 text-center text-xs text-text-muted">Nenhum modelo neste filtro.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredTemplates.map(t => {
                  const photoMode = templatePhotoMode(t);
                  return (
                    <div
                      key={t.key}
                      className={`overflow-hidden rounded-xl border text-left transition ${
                        templateKey === t.key
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/40'
                      }`}
                    >
                      <div className="relative">
                        <TemplateThumbnail
                          barbershopId={barbershopId}
                          templateKey={t.key}
                          format={format}
                          paletteKey={paletteKey}
                          alt={`Prévia do modelo ${t.name}`}
                        />
                        <button type="button" onClick={() => onSelectTemplate(t.key)} aria-label={`Selecionar modelo ${t.name}`} className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" />
                        {templateKey === t.key && (
                          <span className="pointer-events-none absolute right-1.5 top-1.5 z-10 rounded-full bg-accent p-1 text-accent-fg">
                            <Check size={11} aria-hidden />
                          </span>
                        )}
                      </div>
                      <button type="button" onClick={() => onSelectTemplate(t.key)} className="w-full space-y-0.5 p-2.5 text-left">
                        <p className="text-xs font-bold text-text-primary">{t.name}</p>
                        {t.description && <p className="text-2xs leading-snug text-text-muted">{t.description}</p>}
                        <span className="inline-block rounded bg-bg px-1.5 py-0.5 text-2xs font-bold uppercase text-text-muted">
                          {photoMode === 'none' ? 'Sem foto' : photoMode === 'required' ? `Requer ${t.requiredMedia} foto(s)` : 'Foto opcional'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </FocusLock>
    </div>
  );
}
