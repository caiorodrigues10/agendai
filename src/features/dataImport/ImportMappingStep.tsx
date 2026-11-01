import React from 'react';
import { LuTriangleAlert as TriangleAlert } from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import type {
  ImportFieldKey,
  ImportOptions,
  ImportSheetPlanInput,
  ImportSheetPlanView,
} from '../../infra/dataImportApi';
import { sheetLabel } from './ImportTargetStep';

/**
 * Etapa 3 — mapa de colunas, uma aba por vez.
 *
 * O assistente já sugeriu o mapeamento (cabeçalho que casa com o campo).
 * O dono ajusta o que quiser, escolhe as opções da aba e vê a prévia ao lado.
 * Em planilha multi-aba, um seletor no topo alterna entre as abas.
 */
export const ImportMappingStep: React.FC<{
  views: ImportSheetPlanView[];
  plans: ImportSheetPlanInput[];
  busy: boolean;
  onChangePlan: (index: number, patch: Partial<ImportSheetPlanInput>) => void;
  onContinue: () => Promise<void>;
}> = ({ views, plans, busy, onChangePlan, onContinue }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const view = views[activeIndex];
  const plan = plans[activeIndex];

  if (!view || !plan) return null;

  const headers = view.preview.length ? Object.keys(view.preview[0]) : [];
  const mapping = plan.columns;
  const usedColumns = new Set(Object.keys(mapping));

  const assign = (field: ImportFieldKey, column: string) => {
    const next: Record<string, ImportFieldKey> = {};
    for (const [index, mappedField] of Object.entries(mapping)) {
      // O campo perde o mapeamento antigo...
      if (mappedField === field) continue;
      // ...e a coluna escolhida deixa de pertencer a outro campo.
      if (column !== '' && index === column) continue;
      next[index] = mappedField;
    }
    if (column !== '') next[column] = field;
    onChangePlan(activeIndex, { columns: next });
  };

  const columnFor = (field: ImportFieldKey) => {
    const found = Object.entries(mapping).find(([, value]) => value === field);
    return found ? found[0] : '';
  };

  const missingRequired = view.fields.some((field) => field.required && columnFor(field.key) === '');

  return (
    <div className="space-y-5" data-testid="import-step-mapping">
      <div>
        <h3 className="text-base font-bold text-text-primary">Confira as colunas</h3>
        <p className="mt-1 text-sm text-text-muted">
          O assistente já reconheceu as colunas. Ajuste o que estiver errado.
        </p>
      </div>

      {plans.length > 1 ? (
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Abas da planilha" data-testid="import-mapping-tabs">
          {plans.map((sheet, index) => (
            <button
              key={sheet.sheetName ?? index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={[
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                index === activeIndex
                  ? 'border-accent bg-accent/10 text-text-primary'
                  : 'border-border bg-surface-2 text-text-muted hover:border-border-strong',
              ].join(' ')}
              data-testid={`import-mapping-tab-${sheet.sheetName ?? index}`}
            >
              {sheetLabel(sheet.sheetName)}
            </button>
          ))}
        </div>
      ) : null}

      {view.warnings.length ? (
        <div
          className="rounded-xl border border-warning/40 bg-warning/5 p-3"
          role="status"
          data-testid="import-mapping-warnings"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <TriangleAlert size={16} className="text-warning" aria-hidden="true" />
            Avisos desta aba
          </p>
          <ul className="mt-1 space-y-1 text-xs text-text-secondary">
            {view.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {view.fields.map((field) => (
          <label key={field.key} className="block text-sm text-text-primary">
            <span className="flex items-center gap-1 font-semibold">
              {field.label}
              {field.required ? (
                <span className="text-xs font-normal text-text-muted">(obrigatório)</span>
              ) : null}
            </span>
            {field.hint ? (
              <span className="mt-0.5 block text-xs font-normal text-text-muted">{field.hint}</span>
            ) : null}
            <select
              value={columnFor(field.key)}
              onChange={(event) => assign(field.key, event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              data-testid={`import-field-${field.key}`}
            >
              <option value="">— não importar —</option>
              {headers.map((header, index) => {
                const taken = usedColumns.has(String(index)) && columnFor(field.key) !== String(index);
                return (
                  <option key={`${header}-${index}`} value={String(index)} disabled={taken}>
                    {header}
                    {taken ? ' (em uso)' : ''}
                  </option>
                );
              })}
            </select>
          </label>
        ))}
      </div>

      <SheetOptions
        view={view}
        options={plan.options}
        onChange={(options) => onChangePlan(activeIndex, { options })}
      />

      {view.preview.length ? (
        <div>
          <h4 className="text-sm font-bold text-text-primary">Prévia das linhas</h4>
          <div className="mt-2 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 text-text-muted">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-3 py-2 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.preview.slice(0, 5).map((row, index) => (
                  <tr key={index} className="border-t border-border">
                    {headers.map((header) => (
                      <td key={header} className="px-3 py-2 text-text-primary">
                        {row[header] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Button
        variant="primary"
        loading={busy}
        disabled={missingRequired}
        onClick={() => void onContinue()}
        data-testid="import-mapping-continue"
      >
        Validar planilha
      </Button>
      {missingRequired ? (
        <p className="text-xs text-danger">
          Mapeie as colunas obrigatórias desta aba para continuar.
        </p>
      ) : null}
    </div>
  );
};

/** Opções específicas do tipo da aba (cada tipo tem as suas). */
const SheetOptions: React.FC<{
  view: ImportSheetPlanView;
  options: ImportOptions;
  onChange: (options: ImportOptions) => void;
}> = ({ view, options, onChange }) => {
  const patch = (partial: Partial<ImportOptions>) => onChange({ ...options, ...partial });

  const hasCaseField = view.fields.some((field) => field.key === 'caseName');
  const isSchedule =
    view.targetType === 'STAFF_SCHEDULES' || view.targetType === 'SHOP_SCHEDULE';
  const isTimeOff = view.targetType === 'TIME_OFF';
  const isProducts = view.targetType === 'PRODUCTS';
  const isFiado = view.targetType === 'FIADOS';

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4">
      <h4 className="text-sm font-bold text-text-primary">Opções desta aba</h4>
      <div className="mt-2 space-y-2">
        <label className="flex items-start gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={options.updateExisting}
            onChange={(event) => patch({ updateExisting: event.target.checked })}
            className="mt-0.5"
            data-testid="import-option-update-existing"
          />
          <span>
            Atualizar quem já existe
            <span className="block text-xs text-text-muted">
              Reconhece o registro pelo identificador da aba (telefone, nome, SKU...). Desligado,
              quem já existe é ignorado.
            </span>
          </span>
        </label>

        {view.targetType === 'APPOINTMENTS' ? (
          <>
            <label className="flex items-start gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={options.countFinancialValues}
                onChange={(event) => patch({ countFinancialValues: event.target.checked })}
                className="mt-0.5"
                data-testid="import-option-financial"
              />
              <span>
                Contar valores no histórico financeiro
                <span className="block text-xs text-text-muted">
                  Desligado por padrão: o histórico financeiro é alimentado pela conclusão do
                  atendimento, não pela planilha.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={options.sendReviewInvitations}
                onChange={(event) => patch({ sendReviewInvitations: event.target.checked })}
                className="mt-0.5"
                data-testid="import-option-review-invitations"
              />
              <span>
                Enviar convite de avaliação
                <span className="block text-xs text-text-muted">
                  Desligado por padrão: importar a planilha não deve disparar mensagem ao cliente.
                </span>
              </span>
            </label>
          </>
        ) : null}

        {hasCaseField ? (
          <label className="flex items-start gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={options.includeCase}
              onChange={(event) => patch({ includeCase: event.target.checked })}
              className="mt-0.5"
              data-testid="import-option-case"
            />
            <span>
              Criar o caso/processo
              <span className="block text-xs text-text-muted">
                O caso fica restrito ao painel — nunca aparece para o cliente.
              </span>
            </span>
          </label>
        ) : null}

        {isSchedule ? (
          <label className="flex items-start gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={options.replaceExistingSchedules}
              onChange={(event) => patch({ replaceExistingSchedules: event.target.checked })}
              className="mt-0.5"
              data-testid="import-option-replace-schedules"
            />
            <span>
              Substituir horário já configurado
              <span className="block text-xs text-text-muted">
                Desligado por padrão: dias que já têm horário são mantidos como estão.
              </span>
            </span>
          </label>
        ) : null}

        {isTimeOff ? (
          <label className="flex items-start gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={options.importTimeOffAsPending}
              onChange={(event) => patch({ importTimeOffAsPending: event.target.checked })}
              className="mt-0.5"
              data-testid="import-option-timeoff-pending"
            />
            <span>
              Importar como pendente de aprovação
              <span className="block text-xs text-text-muted">
                Desligado por padrão: a folga entra já aprovada.
              </span>
            </span>
          </label>
        ) : null}

        {isProducts ? (
          <>
            <label className="flex items-start gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={options.updateExistingProducts}
                onChange={(event) => patch({ updateExistingProducts: event.target.checked })}
                className="mt-0.5"
                data-testid="import-option-update-products"
              />
              <span>
                Atualizar preço e estoque mínimo de produto existente
                <span className="block text-xs text-text-muted">
                  O estoque atual não é sobrescrito: o estoque inicial vira um movimento de entrada.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={options.createProductCategories}
                onChange={(event) => patch({ createProductCategories: event.target.checked })}
                className="mt-0.5"
                data-testid="import-option-create-categories"
              />
              <span>
                Criar categorias que ainda não existem
                <span className="block text-xs text-text-muted">
                  Categoria nova entra no catálogo de produtos.
                </span>
              </span>
            </label>
          </>
        ) : null}

        {isFiado ? (
          <label className="flex items-start gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={options.sendFiadoReminders}
              onChange={(event) => patch({ sendFiadoReminders: event.target.checked })}
              className="mt-0.5"
              data-testid="import-option-fiado-reminders"
            />
            <span>
              Enviar lembrete de cobrança
              <span className="block text-xs text-text-muted">
                Desligado por padrão: importar fiado não deve disparar mensagem ao cliente.
              </span>
            </span>
          </label>
        ) : null}
      </div>
    </div>
  );
};
