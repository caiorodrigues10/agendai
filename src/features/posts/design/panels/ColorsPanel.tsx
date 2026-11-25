import { contrastRatio, isHexColor } from '../../../../shared/pageThemeContrast';
import { HexField, PanelHeading } from '../panelShared';
import type { DesignPanelProps } from '../panelShared';

const COLOR_FIELDS = [
  { key: 'bg', label: 'Cor de fundo' },
  { key: 'panel', label: 'Cor do painel' },
  { key: 'accent', label: 'Cor de destaque' },
  { key: 'text', label: 'Cor do texto' },
] as const;

export default function ColorsPanel({ state, dispatch }: DesignPanelProps) {
  const colors = state.designOverrides.colors ?? {};
  const checks: { label: string; ratio: number; minimum: number }[] = [];
  if (colors.text && colors.bg && isHexColor(colors.text) && isHexColor(colors.bg)) {
    checks.push({
      label: 'Texto sobre o fundo',
      ratio: contrastRatio(colors.text, colors.bg),
      minimum: 4.5,
    });
  }
  if (colors.text && colors.panel && isHexColor(colors.text) && isHexColor(colors.panel)) {
    checks.push({
      label: 'Texto sobre o painel',
      ratio: contrastRatio(colors.text, colors.panel),
      minimum: 4.5,
    });
  }
  if (colors.accent && colors.bg && isHexColor(colors.accent) && isHexColor(colors.bg)) {
    checks.push({
      label: 'Destaque sobre o fundo',
      ratio: contrastRatio(colors.accent, colors.bg),
      minimum: 3,
    });
  }

  return (
    <section aria-label="Cores" className="space-y-4">
      <PanelHeading
        title="Cores"
        description="Use cores hexadecimais. O editor avisa sobre contraste; o servidor também pode ajustar a arte final."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {COLOR_FIELDS.map(field => (
          <HexField
            key={field.key}
            label={field.label}
            value={colors[field.key] ?? ''}
            onChange={value => dispatch({ type: 'set-colors', colors: { [field.key]: value } })}
            hint="Ex.: #171208"
          />
        ))}
      </div>
      {checks.length ? (
        <div role="status" className="space-y-2">
          {checks.map(check => (
            <p
              key={check.label}
              className={`rounded-lg px-3 py-2 text-xs ${
                check.ratio >= check.minimum
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              }`}
            >
              {check.label}: contraste {check.ratio.toFixed(2)}:1
              {check.ratio >= check.minimum
                ? ' (aprovado)'
                : ` (abaixo do mínimo ${check.minimum}:1)`}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
