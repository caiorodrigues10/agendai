import React from 'react';
import { Button } from '../../components/ui/Button';
import type { ImportFieldDescription, ImportFieldKey, ImportOptions } from '../../infra/dataImportApi';

/**
 * Etapa 3 — mapa de colunas.
 *
 * O assistente já sugeriu o mapeamento (cabeçalho que casa com o campo).
 * O dono ajusta o que quiser e vê a prévia ao lado.
 */
export const ImportMappingStep: React.FC<{
  fields: ImportFieldDescription[];
  headers: string[];
  mapping: Record<string, ImportFieldKey>;
  options: ImportOptions;
  preview: Record<string, string>[];
  busy: boolean;
  onChangeMapping: (mapping: Record<string, ImportFieldKey>) => void;
  onChangeOptions: (options: Partial<ImportOptions>) => void;
  onContinue: () => Promise<void>;
}> = ({
  fields,
  headers,
  mapping,
  options,
  preview,
  busy,
  onChangeMapping,
  onChangeOptions,
  onContinue,
}) => {
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
    onChangeMapping(next);
  };

  const columnFor = (field: ImportFieldKey) => {
    const found = Object.entries(mapping).find(([, value]) => value === field);
    return found ? found[0] : '';
  };

  const missingRequired = fields.some(
    (field) => field.required && columnFor(field.key) === ''
  );

  return (
    <div className="space-y-5" data-testid="import-step-mapping">
      <div>
        <h3 className="text-base font-bold text-text-primary">Confira as colunas</h3>
        <p className="mt-1 text-sm text-text-muted">
          O assistente já reconheceu as colunas. Ajuste o que estiver errado.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
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

      <div className="rounded-xl border border-border bg-surface-2 p-4">
        <h4 className="text-sm font-bold text-text-primary">Opções</h4>
        <div className="mt-2 space-y-2">
          <label className="flex items-start gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={options.updateExisting}
              onChange={(event) => onChangeOptions({ updateExisting: event.target.checked })}
              className="mt-0.5"
              data-testid="import-option-update-existing"
            />
            <span>
              Atualizar quem já existe
              <span className="block text-xs text-text-muted">
                Reconhece o cliente pelo telefone. Desligado, quem já existe é ignorado.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={options.countFinancialValues}
              onChange={(event) => onChangeOptions({ countFinancialValues: event.target.checked })}
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

          {fields.some((field) => field.key === 'caseName') ? (
            <label className="flex items-start gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={options.includeCase}
                onChange={(event) => onChangeOptions({ includeCase: event.target.checked })}
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
        </div>
      </div>

      {preview.length ? (
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
                {preview.slice(0, 5).map((row, index) => (
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
          Mapeie as colunas obrigatórias para continuar.
        </p>
      ) : null}
    </div>
  );
};
