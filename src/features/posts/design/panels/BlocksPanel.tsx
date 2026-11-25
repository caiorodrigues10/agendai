import type { DesignCommercialBlock } from '../../../../infra/postsApi';
import { PanelHeading, PanelNotice, supportsCommercialBlock, type DesignPanelProps } from '../panelShared';

const BLOCK_LABELS: Record<string, string> = {
  businessName: 'Nome do negócio',
  headline: 'Título principal',
  highlight: 'Destaque',
  tagline: 'Assinatura',
  cta: 'CTA',
  contacts: 'Contatos',
  logo: 'Logo',
  services: 'Serviços',
  promo: 'Promoção',
  validUntil: 'Validade',
};

const COMMERCIAL_BLOCK_BY_ID: Partial<Record<string, DesignCommercialBlock>> = {
  services: 'services',
  promo: 'promo',
  validUntil: 'validity',
};

export default function BlocksPanel({ state, dispatch, design }: DesignPanelProps) {
  const hideable = Object.entries(design.editable).filter(([id, editable]) => {
    if (!editable.canHide || id === 'qr') return false;
    const commercialBlock = COMMERCIAL_BLOCK_BY_ID[id];
    return !commercialBlock || supportsCommercialBlock(design, commercialBlock);
  });

  return (
    <section aria-label="Blocos" className="space-y-4">
      <PanelHeading
        title="Blocos"
        description="Escolha quais partes da composição ficam visíveis. A lista de blocos vem do design selecionado."
      />

      {hideable.length ? (
        <div className="space-y-2">
          {hideable.map(([id]) => {
            const visible = state.designOverrides.visible?.[id] !== false;
            return (
              <label
                key={id}
                className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <span>{BLOCK_LABELS[id] ?? id}</span>
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={event => dispatch({
                    type: 'set-visible',
                    id,
                    visible: event.target.checked,
                  })}
                  aria-label={`Mostrar ${BLOCK_LABELS[id] ?? id}`}
                  className="h-5 w-5 accent-[var(--color-accent)]"
                />
              </label>
            );
          })}
        </div>
      ) : (
        <PanelNotice>Esta composição não oferece blocos opcionais.</PanelNotice>
      )}
    </section>
  );
}
