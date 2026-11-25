import { Button } from '../../../../components/ui/Button';
import { Field } from '../../../../components/ui/Field';
import { SmartSelect } from '../../../../components/ui/SmartSelect';
import type { DesignFontPair } from '../../../../infra/postsApi';
import { PanelHeading, type DesignPanelProps } from '../panelShared';

const FONT_OPTIONS: { value: DesignFontPair; label: string }[] = [
  { value: 'montserrat-inter', label: 'Montserrat + Inter' },
  { value: 'playfair-poppins', label: 'Playfair + Poppins' },
  { value: 'bebas-oswald', label: 'Bebas + Oswald' },
  { value: 'dmserif-poppins', label: 'DM Serif + Poppins' },
  { value: 'anton-barlow', label: 'Anton + Barlow' },
  { value: 'playfair-barlow', label: 'Playfair + Barlow' },
];

const ALIGN_OPTIONS = [
  { value: 'left' as const, label: 'Esquerda' },
  { value: 'center' as const, label: 'Centro' },
  { value: 'right' as const, label: 'Direita' },
];

export default function FontsPanel({ state, dispatch, design }: DesignPanelProps) {
  const scale = state.designOverrides.textScale ?? 1;
  const align = state.designOverrides.align;

  return (
    <section aria-label="Fontes" className="space-y-4">
      <PanelHeading
        title="Fontes"
        description="Escolha o par tipográfico e ajuste a escala global. Arraste e redimensionamento individual não estão disponíveis."
      />

      <SmartSelect
        label="Par de fontes"
        value={state.designOverrides.fontPair ?? design.variant.fontPair}
        options={FONT_OPTIONS}
        onChange={value => dispatch({ type: 'set-font-pair', fontPair: value ?? undefined })}
      />

      <Field label="Escala do texto" hint={`${scale.toFixed(2)}× (entre 0,6 e 1,6).`}>
        <input
          type="range"
          min={0.6}
          max={1.6}
          step={0.05}
          value={scale}
          onChange={event => dispatch({
            type: 'set-text-scale',
            textScale: Number(event.target.value),
          })}
          className="w-full accent-[var(--color-accent)]"
        />
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-text-secondary">Alinhamento</span>
        <div role="radiogroup" aria-label="Alinhamento do texto" className="flex overflow-hidden rounded-xl border border-border">
          {ALIGN_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={align === option.value}
              onClick={() => dispatch({ type: 'set-align', align: option.value })}
              className={`min-h-11 flex-1 px-3 text-xs font-bold transition ${
                align === option.value
                  ? 'bg-accent text-accent-fg'
                  : 'bg-input-bg text-text-secondary hover:bg-surface-2'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {state.designOverrides.fontPair || state.designOverrides.textScale || state.designOverrides.align ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            dispatch({ type: 'set-font-pair', fontPair: undefined });
            dispatch({ type: 'set-text-scale', textScale: undefined });
            dispatch({ type: 'set-align', align: undefined });
          }}
        >
          Usar estilo da composição
        </Button>
      ) : null}
    </section>
  );
}
