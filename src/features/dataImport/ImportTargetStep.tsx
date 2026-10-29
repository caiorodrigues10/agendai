import React from 'react';
import { Button } from '../../components/ui/Button';
import type { ImportTargetType } from '../../infra/dataImportApi';

const TARGETS: {
  id: ImportTargetType;
  title: string;
  description: string;
}[] = [
  {
    id: 'CLIENTS',
    title: 'Clientes',
    description: 'Cadastra clientes novos e atualiza os que já existem (pelo telefone).',
  },
  {
    id: 'SERVICES',
    title: 'Serviços',
    description: 'Adiciona serviços ao catálogo. Serviço com nome repetido é ignorado.',
  },
  {
    id: 'APPOINTMENTS',
    title: 'Agendamentos',
    description: 'Importa a agenda. O serviço precisa já existir no catálogo.',
  },
];

/**
 * Etapa 2 — o que importar.
 *
 * A escolha define quais colunas o assistente espera. Trocar o alvo aqui
 * refaz a detecção automática das colunas.
 */
export const ImportTargetStep: React.FC<{
  busy: boolean;
  fileName?: string;
  sheetNames?: string[];
  onChoose: (target: ImportTargetType, sheetName?: string | null) => Promise<void>;
}> = ({ busy, fileName, sheetNames, onChoose }) => {
  const [target, setTarget] = React.useState<ImportTargetType>('CLIENTS');
  const [sheet, setSheet] = React.useState<string>(sheetNames?.[0] ?? '');

  return (
    <div className="space-y-4" data-testid="import-step-target">
      <div>
        <h3 className="text-base font-bold text-text-primary">O que você quer importar?</h3>
        {fileName ? (
          <p className="mt-1 text-sm text-text-muted">Arquivo: {fileName}</p>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Tipo de importação">
        {TARGETS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={target === option.id}
            onClick={() => setTarget(option.id)}
            className={[
              'rounded-xl border p-3 text-left transition-colors',
              target === option.id
                ? 'border-accent bg-accent/5'
                : 'border-border bg-surface hover:border-border-strong',
            ].join(' ')}
          >
            <span className="block text-sm font-bold text-text-primary">{option.title}</span>
            <span className="mt-1 block text-xs text-text-muted">{option.description}</span>
          </button>
        ))}
      </div>

      {sheetNames && sheetNames.length > 1 ? (
        <label className="block text-sm text-text-primary">
          Aba da planilha
          <select
            value={sheet}
            onChange={(event) => setSheet(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            data-testid="import-sheet-select"
          >
            {sheetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <Button
        variant="primary"
        loading={busy}
        onClick={() => void onChoose(target, sheet || null)}
        data-testid="import-target-continue"
      >
        Continuar
      </Button>
    </div>
  );
};
