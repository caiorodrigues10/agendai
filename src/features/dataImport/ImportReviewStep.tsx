import React from 'react';
import { LuCircleAlert as CircleAlert, LuCircleCheck as CircleCheck } from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import type { ImportValidationSummary } from '../../infra/dataImportApi';

/**
 * Etapa 4/5 — prévia da validação.
 *
 * Mostra quantas linhas entram, quantas são ignoradas e por que cada linha
 * foi rejeitada. Nada foi gravado ainda: o dono decide aqui.
 */
export const ImportReviewStep: React.FC<{
  validation: ImportValidationSummary;
  busy: boolean;
  onBack: () => void;
  onRevalidate: () => Promise<void>;
  onConfirm: () => Promise<void>;
}> = ({ validation, busy, onBack, onRevalidate, onConfirm }) => {
  const rejected = validation.results.filter((row) => row.status === 'FAILED');
  const skipped = validation.results.filter((row) => row.status === 'SKIPPED');

  return (
    <div className="space-y-4" data-testid="import-step-review">
      <div>
        <h3 className="text-base font-bold text-text-primary">Veja o que vai acontecer</h3>
        <p className="mt-1 text-sm text-text-muted">
          Esta é uma simulação: nada foi gravado ainda.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="text-xs text-text-muted">Serão importados</p>
          <p className="text-xl font-bold text-text-primary" data-testid="import-valid-count">
            {validation.validRows}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="text-xs text-text-muted">Ignorados (já existem)</p>
          <p className="text-xl font-bold text-text-primary">{validation.skippedRows}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="text-xs text-text-muted">Rejeitados</p>
          <p className="text-xl font-bold text-danger">{validation.failedRows}</p>
        </div>
      </div>

      {rejected.length ? (
        <div className="rounded-xl border border-danger/40 bg-danger/5 p-3">
          <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <CircleAlert size={16} className="text-danger" aria-hidden="true" />
            Linhas rejeitadas
          </p>
          <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto text-xs text-text-secondary">
            {rejected.slice(0, 50).map((row) => (
              <li key={row.rowNumber}>
                Linha {row.rowNumber}: {row.message}
              </li>
            ))}
          </ul>
          {rejected.length > 50 ? (
            <p className="mt-1 text-xs text-text-muted">
              Mostrando 50 de {rejected.length}. O CSV de erros traz todas.
            </p>
          ) : null}
        </div>
      ) : null}

      {skipped.length ? (
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <CircleCheck size={16} className="text-text-muted" aria-hidden="true" />
            Linhas ignoradas
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-text-secondary">
            {skipped.slice(0, 20).map((row) => (
              <li key={row.rowNumber}>
                Linha {row.rowNumber}: {row.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onBack} disabled={busy}>
          Voltar
        </Button>
        <Button variant="secondary" loading={busy} onClick={() => void onRevalidate()}>
          Validar de novo
        </Button>
        <Button
          variant="primary"
          loading={busy}
          disabled={validation.validRows === 0}
          onClick={() => void onConfirm()}
          data-testid="import-review-confirm"
        >
          Confirmar importação
        </Button>
      </div>
      {validation.validRows === 0 ? (
        <p className="text-xs text-text-muted">
          Nenhuma linha válida para importar. Ajuste o mapa e valide de novo.
        </p>
      ) : null}
    </div>
  );
};
