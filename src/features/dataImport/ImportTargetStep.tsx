import React from 'react';
import { Button } from '../../components/ui/Button';
import type {
  ImportSheetInfo,
  ImportSheetTargetChoice,
  ImportTargetType,
} from '../../infra/dataImportApi';

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
  {
    id: 'STAFF_SCHEDULES',
    title: 'Horários da equipe',
    description: 'Define o expediente de cada profissional. Sem login novo: casa com quem já existe.',
  },
  {
    id: 'SHOP_SCHEDULE',
    title: 'Horário do salão',
    description: 'Define os dias e horários que o estabelecimento fica aberto.',
  },
  {
    id: 'TIME_OFF',
    title: 'Férias e folgas',
    description: 'Bloqueia períodos de profissional (folga, viagem, capacitação).',
  },
  {
    id: 'PRODUCTS',
    title: 'Produtos e estoque',
    description: 'Cadastra produtos com preço e estoque inicial. Dedupe por SKU/código de barras.',
  },
  {
    id: 'SERVICE_PACKAGES',
    title: 'Catálogo de pacotes',
    description: 'Cria pacotes de sessões (ex.: pacote de 5 cortes).',
  },
  {
    id: 'CLIENT_PACKAGES',
    title: 'Pacotes dos clientes',
    description: 'Vincula pacotes já comprados aos clientes, com sessões restantes.',
  },
  {
    id: 'FIADOS',
    title: 'Fiados',
    description: 'Importa fiados por telefone. Não cria cliente novo.',
  },
];

const TARGET_TITLE: Record<ImportTargetType, string> = TARGETS.reduce(
  (acc, target) => ({ ...acc, [target.id]: target.title }),
  {} as Record<ImportTargetType, string>
);

/** Rótulo amigável para o nome da aba. */
const sheetLabel = (sheetName: string | null): string => sheetName ?? 'CSV';

/**
 * Etapa 2 — o que importar.
 *
 * Planilha de uma aba só: um tipo. Planilha com várias abas: o dono escolhe
 * o tipo de cada aba; o assistente importa na ordem de dependência entre os
 * tipos (serviços antes de clientes, clientes antes de pacotes etc.).
 */
export const ImportTargetStep: React.FC<{
  busy: boolean;
  fileName?: string;
  sheets?: ImportSheetInfo[];
  onChoose: (choices: ImportSheetTargetChoice[]) => Promise<void>;
}> = ({ busy, fileName, sheets, onChoose }) => {
  const sheetList = sheets ?? [];
  const multiple = sheetList.length > 1;

  // Uma escolha por aba; o padrão é CLIENTS (ou "sem tipo" quando há várias abas).
  const [assignments, setAssignments] = React.useState<Record<string, ImportTargetType>>(() =>
    Object.fromEntries(
      sheetList.map((sheet) => [sheet.sheetName ?? '', multiple ? ('' as unknown as ImportTargetType) : 'CLIENTS'])
    )
  );
  const [singleTarget, setSingleTarget] = React.useState<ImportTargetType>('CLIENTS');

  const assign = (sheetKey: string, targetType: ImportTargetType) => {
    setAssignments((current) => ({ ...current, [sheetKey]: targetType }));
  };

  const allAssigned =
    !multiple ||
    sheetList.every((sheet) => {
      const value = assignments[sheet.sheetName ?? ''];
      return value && value !== ('' as unknown as ImportTargetType);
    });

  const handleContinue = () => {
    if (!multiple) {
      void onChoose([{ sheetName: sheetList[0]?.sheetName ?? null, targetType: singleTarget }]);
      return;
    }
    void onChoose(
      sheetList.map((sheet) => ({
        sheetName: sheet.sheetName,
        targetType: assignments[sheet.sheetName ?? ''],
      }))
    );
  };

  return (
    <div className="space-y-4" data-testid="import-step-target">
      <div>
        <h3 className="text-base font-bold text-text-primary">O que você quer importar?</h3>
        {fileName ? (
          <p className="mt-1 text-sm text-text-muted">Arquivo: {fileName}</p>
        ) : null}
        {multiple ? (
          <p className="mt-1 text-sm text-text-muted">
            Este arquivo tem {sheetList.length} abas. Escolha o tipo de cada uma — elas serão
            importadas na ordem certa entre si.
          </p>
        ) : null}
      </div>

      {!multiple ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Tipo de importação">
          {TARGETS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={singleTarget === option.id}
              onClick={() => setSingleTarget(option.id)}
              className={[
                'rounded-xl border p-3 text-left transition-colors',
                singleTarget === option.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface hover:border-border-strong',
              ].join(' ')}
              data-testid={`import-target-card-${option.id}`}
            >
              <span className="block text-sm font-bold text-text-primary">{option.title}</span>
              <span className="mt-1 block text-xs text-text-muted">{option.description}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-testid="import-sheet-assignments">
          {sheetList.map((sheet) => {
            const key = sheet.sheetName ?? '';
            const chosen = assignments[key];
            return (
              <div
                key={key}
                className="rounded-xl border border-border bg-surface p-3"
                data-testid={`import-sheet-assignment-${key}`}
              >
                <p className="text-sm font-bold text-text-primary">
                  Aba “{sheetLabel(sheet.sheetName)}”
                  <span className="ml-2 text-xs font-normal text-text-muted">
                    {sheet.totalRows} linha(s)
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Tipo da aba ${sheetLabel(sheet.sheetName)}`}>
                  {TARGETS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={chosen === option.id}
                      onClick={() => assign(key, option.id)}
                      className={[
                        'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                        chosen === option.id
                          ? 'border-accent bg-accent/10 text-text-primary'
                          : 'border-border bg-surface-2 text-text-muted hover:border-border-strong',
                      ].join(' ')}
                      data-testid={`import-sheet-target-${key}-${option.id}`}
                    >
                      {option.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button
        variant="primary"
        loading={busy}
        disabled={multiple && !allAssigned}
        onClick={handleContinue}
        data-testid="import-target-continue"
      >
        Continuar
      </Button>
      {multiple && !allAssigned ? (
        <p className="text-xs text-text-muted">Escolha o tipo de todas as abas para continuar.</p>
      ) : null}
    </div>
  );
};

export { TARGET_TITLE, sheetLabel };
