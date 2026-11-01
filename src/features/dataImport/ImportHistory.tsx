import React from 'react';
import { LuHistory as History } from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import type { ImportBatchSummary } from '../../infra/dataImportApi';

const STATUS_LABEL: Record<string, string> = {
  UPLOADED: 'Enviado',
  MAPPING: 'Aguardando mapa',
  VALIDATING: 'Validando',
  AWAITING_CONFIRMATION: 'Aguardando confirmação',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  COMPLETED_WITH_ERRORS: 'Concluído com erros',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
  UNDONE: 'Desfeito',
  EXPIRED: 'Expirado',
};

const STATUS_TONE: Record<string, string> = {
  COMPLETED: 'text-text-primary',
  COMPLETED_WITH_ERRORS: 'text-danger',
  FAILED: 'text-danger',
  UNDONE: 'text-text-muted',
  CANCELLED: 'text-text-muted',
  EXPIRED: 'text-text-muted',
  PROCESSING: 'text-accent',
};

/**
 * Histórico de importações.
 *
 * O dono vê o que já importou e pode desfazer (30 dias) ou cancelar um lote
 * que abandonou.
 */
export const ImportHistory: React.FC<{
  history: ImportBatchSummary[];
  busy: boolean;
  onUndo: (batchId: string) => Promise<void>;
  onCancel: (batchId: string) => Promise<void>;
}> = ({ history, busy, onUndo, onCancel }) => {
  if (!history.length) return null;

  return (
    <div className="mt-6 border-t border-border pt-4" data-testid="import-history">
      <h4 className="flex items-center gap-2 text-sm font-bold text-text-primary">
        <History size={15} aria-hidden="true" />
        Importações anteriores
      </h4>
      <ul className="mt-2 space-y-2">
        {history.slice(0, 5).map((batch) => (
          <li
            key={batch.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{batch.fileName}</p>
              <p className="text-xs text-text-muted">
                <span className={STATUS_TONE[batch.status] ?? 'text-text-secondary'}>
                  {STATUS_LABEL[batch.status] ?? batch.status}
                </span>
                {' · '}
                {batch.importedRows} importado(s)
                {batch.failedRows > 0 ? ` · ${batch.failedRows} rejeitado(s)` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              {batch.canUndo ? (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={busy}
                  onClick={() => void onUndo(batch.id)}
                >
                  Desfazer
                </Button>
              ) : null}
              {['UPLOADED', 'MAPPING', 'AWAITING_CONFIRMATION'].includes(batch.status) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={busy}
                  onClick={() => void onCancel(batch.id)}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
