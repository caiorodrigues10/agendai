import React from 'react';
import { Button } from '../../../components/ui/Button';
import { PostPreviewBox } from '../PostPreviewBox';
import { FORMAT_OPTIONS, downloadImage } from '../postEditorShared';
import type { PostFormat, PostTemplateDef } from '../../../infra/postsApi';
import { LuDownload as Download } from 'react-icons/lu';

export interface LegacyIdentityTabProps {
  title: string;
  ctaText: string;
  selectedTemplate: PostTemplateDef | undefined;
  format: PostFormat;
  paletteKey: string;
  previewUrl: string | null;
  previewLoading: boolean;
  previewStale: boolean;
}

/** Aba "Identidade" do editor legado: resumo do post e download do PNG. */
export function LegacyIdentityTab(props: LegacyIdentityTabProps) {
  const {
    title, ctaText, selectedTemplate, format, paletteKey, previewUrl, previewLoading, previewStale,
  } = props;

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-bg/50 p-4 space-y-3">
          <p className="text-xs font-bold text-text-secondary">Resumo do post</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Título</dt>
              <dd className="font-semibold text-text-primary text-right">{title || '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Botão</dt>
              <dd className="font-semibold text-text-primary text-right">{ctaText || '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Modelo</dt>
              <dd className="font-semibold text-text-primary text-right">{selectedTemplate?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Formato</dt>
              <dd className="font-semibold text-text-primary text-right">
                {FORMAT_OPTIONS.find(f => f.id === format)?.label ?? format}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Paleta</dt>
              <dd className="font-semibold text-text-primary capitalize text-right">{paletteKey}</dd>
            </div>
          </dl>
        </div>

        {/* Download */}
        <Button
          variant="secondary"
          onClick={() => previewUrl && downloadImage(previewUrl, `post-${format}-${Date.now()}.png`)}
          disabled={!previewUrl || previewLoading || previewStale}
          className="w-full gap-2"
        >
          <Download size={15} aria-hidden /> Baixar PNG
        </Button>
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
