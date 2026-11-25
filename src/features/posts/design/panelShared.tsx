import type { Dispatch, ReactNode } from 'react';
import { Field, FIELD_CONTROL } from '../../../components/ui/Field';
import type { DesignCommercialBlock, PostDesign } from '../../../infra/postsApi';
import type { DesignAction, DesignEditorState } from '../designReducer';

export interface DesignPanelProps {
  state: DesignEditorState;
  dispatch: Dispatch<DesignAction>;
  design: PostDesign;
}

export function PanelHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      {description ? <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p> : null}
    </div>
  );
}

export function PanelNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs leading-relaxed text-text-secondary">
      {children}
    </div>
  );
}

export function HexField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const normalized = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000';
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={`${label} — seletor de cor`}
          value={normalized}
          onChange={event => onChange(event.target.value.toUpperCase())}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-input-border bg-input-bg p-1"
        />
        <input
          type="text"
          aria-label={label}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="#000000"
          spellCheck={false}
          className={FIELD_CONTROL}
        />
      </div>
    </Field>
  );
}

/**
 * As capacidades comerciais já foram filtradas pelo servidor. A lista enviada
 * no catálogo é a única fonte de permissão; o front não infere regras por
 * segmento nem abre controles quando o campo está ausente (o catálogo é
 * rejeitado pela camada de API antes de chegar aqui).
 */
export function supportsCommercialBlock(
  design: PostDesign,
  block: DesignCommercialBlock,
): boolean {
  return design.commercialBlocks.includes(block);
}

export function allowsServiceNames(design: PostDesign): boolean {
  return design.commercialBlocks.includes('services');
}

export function allowsServicePrice(design: PostDesign): boolean {
  return design.commercialBlocks.includes('price');
}
