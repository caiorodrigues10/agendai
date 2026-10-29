import React from 'react';
import { LuCircleCheck as CircleCheck, LuLoaderCircle as Loader2 } from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import { importErrorsCsvUrl, type ImportBatchDetail } from '../../infra/dataImportApi';

/**
 * Etapa 6/7 — conclusão.
 *
 * Acompanha o processamento na fila e mostra o resultado. Se alguma linha foi
 * rejeitada, oferece o CSV com o motivo de cada uma.
 */
export const ImportDoneStep: React.FC<{
  barbershopId: string;
  batchId: string;
  detail: ImportBatchDetail | null;
  busy: boolean;
  onRefresh: () => Promise<void>;
  onUndo: (batchId: string) => Promise<void>;
  onStartOver: () => void;
}> = ({ barbershopId, batchId, detail, busy, onRefresh, onUndo, onStartOver }) => {
  const status = detail?.status ?? 'PROCESSING';
  const running = status === 'PROCESSING';
  const finished = status === 'COMPLETED' || status === 'COMPLETED_WITH_ERRORS';
  const undone = status === 'UNDONE';
  const percent =
    detail && detail.totalRows > 0
      ? Math.min(100, Math.round((detail.processedRows / detail.totalRows) * 100))
      : 0;

  return (
    <div className="space-y-4" data-testid="import-step-done">
      <div>
        <h3 className="text-base font-bold text-text-primary">
          {running ? 'Importando…' : undone ? 'Importação desfeita' : 'Importação concluída'}
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          {running
            ? 'Os registros estão sendo gravados. Pode sair da tela — a importação continua.'
            : undone
              ? 'Os registros criados por esta importação foram removidos.'
              : 'Confira o resultado abaixo.'}
        </p>
      </div>

      {detail ? (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${finished ? 100 : percent}%` }}
              role="progressbar"
              aria-valuenow={finished ? 100 : percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-xs text-text-muted">Importados</p>
              <p
                className="text-xl font-bold text-text-primary"
                data-testid="import-imported-count"
              >
                {detail.importedRows}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-xs text-text-muted">Ignorados</p>
              <p
                className="text-xl font-bold text-text-primary"
                data-testid="import-skipped-count"
              >
                {detail.skippedRows}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-xs text-text-muted">Rejeitados</p>
              <p
                className="text-xl font-bold text-danger"
                data-testid="import-rejected-count"
              >
                {detail.failedRows}
              </p>
            </div>
          </div>

          {detail.failedRows > 0 ? (
            <a
              href={importErrorsCsvUrl(barbershopId, batchId)}
              className="inline-block text-xs font-semibold text-accent underline underline-offset-2"
              download
            >
              Baixar CSV com as linhas rejeitadas
            </a>
          ) : null}
        </>
      ) : (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Carregando andamento…
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {running ? (
          <Button variant="secondary" loading={busy} onClick={() => void onRefresh()}>
            Atualizar
          </Button>
        ) : null}
        {finished && detail?.canUndo ? (
          <Button
            variant="secondary"
            loading={busy}
            onClick={() => void onUndo(batchId)}
            data-testid="import-undo-button"
          >
            Desfazer importação
          </Button>
        ) : null}
        <Button variant="primary" onClick={onStartOver} data-testid="import-start-over">
          <CircleCheck size={16} aria-hidden="true" />
          Importar outra planilha
        </Button>
      </div>
    </div>
  );
};
