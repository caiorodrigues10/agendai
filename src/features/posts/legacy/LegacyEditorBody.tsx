import React from 'react';
import { PostPreviewBox } from '../PostPreviewBox';
import type { PostFormat } from '../../../types';
import { LegacyContentTab, type LegacyContentTabProps } from './LegacyContentTab';
import { LegacyImageTab, type LegacyImageTabProps } from './LegacyImageTab';
import { LegacyFormatTab, type LegacyFormatTabProps } from './LegacyFormatTab';
import { LegacyIdentityTab, type LegacyIdentityTabProps } from './LegacyIdentityTab';
import { TAB_LABELS, type EditorTab } from '../postEditorShared';

export interface LegacyTabBarProps {
  tab: EditorTab;
  onChange: (tab: EditorTab) => void;
}

/** Barra de abas do editor legado (4 passos). */
export function LegacyTabBar({ tab, onChange }: LegacyTabBarProps) {
  return (
    <div className="flex border-b border-border">
      {TAB_LABELS.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 py-2.5 text-center text-xs font-bold transition ${
            tab === t.id
              ? 'border-b-2 border-accent text-accent'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export interface LegacyEditorBodyProps {
  tab: EditorTab;
  format: PostFormat;
  previewUrl: string | null;
  previewLoading: boolean;
  previewStale: boolean;
  content: LegacyContentTabProps;
  image: LegacyImageTabProps;
  formatTab: LegacyFormatTabProps;
  identity: LegacyIdentityTabProps;
}

/** Corpo do editor legado: prévia mobile + aba ativa. */
export function LegacyEditorBody(props: LegacyEditorBodyProps) {
  const {
    tab, format, previewUrl, previewLoading, previewStale,
    content, image, formatTab, identity,
  } = props;

  return (
    <>
      <details className="border-b border-border p-4 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-accent">Ver prévia do post</summary>
        <div className="mt-4">
          <PostPreviewBox format={format} previewUrl={previewUrl} loading={previewLoading} stale={previewStale} />
        </div>
      </details>

      {tab === 'content' && <LegacyContentTab {...content} />}
      {tab === 'image' && <LegacyImageTab {...image} />}
      {tab === 'format' && <LegacyFormatTab {...formatTab} />}
      {tab === 'identity' && <LegacyIdentityTab {...identity} />}
    </>
  );
}
