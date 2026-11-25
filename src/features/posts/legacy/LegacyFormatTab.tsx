import React from 'react';
import { PostPreviewBox } from '../PostPreviewBox';
import { FORMAT_OPTIONS } from '../postEditorShared';
import type { TemplateGroup } from '../usePostTemplates';
import type { PostFormat, PostPaletteDef, PostTemplateDef } from '../../../infra/postsApi';
import { LuPalette as Palette, LuLoaderCircle as Loader2 } from 'react-icons/lu';

export interface LegacyFormatTabProps {
  format: PostFormat;
  onFormatChange: (format: PostFormat) => void;
  palettes: PostPaletteDef[];
  paletteKey: string;
  onPaletteChange: (key: string) => void;
  templates: PostTemplateDef[];
  templatesLoading: boolean;
  templateKey: string;
  templateGroups: TemplateGroup[];
  onSelectTemplate: (key: string) => void;
  previewUrl: string | null;
  previewLoading: boolean;
  previewStale: boolean;
}

/** Aba "Formato" do editor legado: formato da arte, paleta e modelo. */
export function LegacyFormatTab(props: LegacyFormatTabProps) {
  const {
    format, onFormatChange, palettes, paletteKey, onPaletteChange, templates, templatesLoading,
    templateKey, templateGroups, onSelectTemplate, previewUrl, previewLoading, previewStale,
  } = props;

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        {/* Formato */}
        <div>
          <p className="mb-2 text-xs font-bold text-text-secondary">Formato da arte</p>
          <div className="grid grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFormatChange(f.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
                  format === f.id
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-text-muted hover:border-text-muted'
                }`}
              >
                {f.icon}
                <span className="text-xs font-bold">{f.label}</span>
                <span className="text-2xs text-text-muted">{f.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Paleta */}
        <div>
          <p className="mb-2 text-xs font-bold text-text-secondary">
            <Palette size={13} className="mr-1 inline" aria-hidden /> Paleta de cores
          </p>
          <div className="flex flex-wrap gap-2">
            {palettes.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => onPaletteChange(p.key)}
                title={p.label}
                className={`h-9 rounded-lg px-3 text-xs font-semibold capitalize transition ${
                  paletteKey === p.key
                    ? 'bg-accent text-accent-fg'
                    : 'bg-surface text-text-secondary hover:bg-bg'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modelo */}
        <div>
          <p className="mb-2 text-xs font-bold text-text-secondary">Modelo</p>
          {templatesLoading ? (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Loader2 size={13} className="animate-spin" aria-hidden /> Carregando modelos…
            </div>
          ) : (
            <div className="space-y-1.5">
              {templateGroups.map(group => {
                const items = templates.filter(t => (t.group ?? 'outros') === group.key);
                if (items.length === 0) return null;
                return (
                  <div key={group.key}>
                    <p className="mb-1 text-2xs font-bold uppercase text-text-muted">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map(t => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => onSelectTemplate(t.key)}
                          className={`rounded-lg px-2.5 py-1.5 text-2xs font-semibold transition ${
                            templateKey === t.key
                              ? 'bg-accent text-accent-fg'
                              : 'bg-surface text-text-secondary hover:bg-bg'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
