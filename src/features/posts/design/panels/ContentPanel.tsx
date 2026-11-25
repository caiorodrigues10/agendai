import { Field, FIELD_CONTROL } from '../../../../components/ui/Field';
import type { DesignContentTextField } from '../../designReducer';
import { PanelHeading, type DesignPanelProps } from '../panelShared';

const FIELD_LIMITS: Record<DesignContentTextField, number> = {
  businessName: 120,
  headline: 200,
  highlight: 60,
  tagline: 160,
  cta: 60,
  validUntil: 40,
};

const FIELD_LABELS: Record<DesignContentTextField, string> = {
  businessName: 'Nome do negócio',
  headline: 'Título principal',
  highlight: 'Destaque',
  tagline: 'Assinatura',
  cta: 'CTA',
  validUntil: 'Validade',
};

const CONTENT_FIELDS: DesignContentTextField[] = [
  'businessName',
  'headline',
  'highlight',
  'tagline',
  'cta',
];

export default function ContentPanel({ state, dispatch, design }: DesignPanelProps) {
  return (
    <section aria-label="Conteúdo" className="space-y-4">
      <PanelHeading
        title="Conteúdo"
        description="Preencha somente com as informações do seu negócio. As sugestões abaixo só entram quando você as aceitar."
      />

      {CONTENT_FIELDS.map(field => {
        const limit = design.editable[field]?.maxChars ?? FIELD_LIMITS[field];
        const value = state.designContent[field] ?? '';
        const slotSuggestion = design.slots[field]?.trim();
        const vocabularySuggestion = design.vocabulary[field]?.trim();
        const suggestion = slotSuggestion || vocabularySuggestion;
        return (
          <div key={field} className="space-y-2">
            <Field label={FIELD_LABELS[field]} hint={`Até ${limit} caracteres.`}>
              <input
                type="text"
                value={value}
                maxLength={limit}
                onChange={event => dispatch({
                  type: 'set-content-field',
                  field,
                  value: event.target.value,
                })}
                placeholder={suggestion || 'Digite o conteúdo do seu negócio'}
                className={FIELD_CONTROL}
              />
            </Field>
            {suggestion && value !== suggestion ? (
              <button
                type="button"
                onClick={() => dispatch({ type: 'set-content-field', field, value: suggestion })}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs font-semibold text-text-secondary hover:border-accent/50 hover:text-accent"
              >
                Sugestão: {suggestion}
              </button>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
