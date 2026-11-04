import React, { useState } from 'react';
import { LuCircleAlert as CircleAlert, LuCircleCheck as CircleCheck } from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import type { ImportValidationSummary } from '../../infra/dataImportApi';

/**
 * Etapa 4/5 — prévia da validação.
 *
 * Mostra quantas linhas entram, quantas são ignoradas e por que cada linha
 * foi rejeitada. Nada foi gravado ainda: o dono decide aqui.
 *
 * Quando a origem é uma imagem (OCR), algumas células podem vir marcadas com
 * `revisar: true`: passam nos normalizadores mas podem ser falso confiante.
 * O botão Confirmar fica desabilitado até que todas sejam revisadas.
 */
export const ImportReviewStep: React.FC<{
  validation: ImportValidationSummary;
  busy: boolean;
  /** Rótulo da aba de cada linha (quando o arquivo tem várias abas). */
  sheetLabels?: Record<string, string>;
  onBack: () => void;
  onRevalidate: () => Promise<void>;
  onConfirm: () => Promise<void>;
}> = ({ validation, busy, sheetLabels, onBack, onRevalidate, onConfirm }) => {
  const rejected = validation.results.filter((row) => row.status === 'FAILED');
  const skipped = validation.results.filter((row) => row.status === 'SKIPPED');
  const paraRevisar = validation.results.filter((row) => row.revisar);
  const [revisados, setRevisados] = useState<Set<string>>(new Set());

  /** "Linha 3" ou "Aba “Clientes” · linha 3" quando há várias abas. */
  const rowLabel = (row: { rowNumber: number; sheetName?: string | null }) => {
    const sheet = row.sheetName ?? null;
    if (!sheet || !sheetLabels) return `Linha ${row.rowNumber}`;
    return `Aba “${sheetLabels[sheet] ?? sheet}” · linha ${row.rowNumber}`;
  };

  const chaveRevisar = (row: { rowNumber: number; sheetName?: string | null }) =>
    `${row.sheetName ?? ''}-${row.rowNumber}`;

  const revisarToggle = (row: { rowNumber: number; sheetName?: string | null }) => {
    const chave = chaveRevisar(row);
    setRevisados((prev) => {
      const next = new Set(prev);
      if (next.has(chave)) next.delete(chave);
      else next.add(chave);
      return next;
    });
  };

  const todasRevisadas = paraRevisar.length > 0 && paraRevisar.every((r) => revisados.has(chaveRevisar(r)));
  const confirmDisabled = busy || validation.validRows === 0 || (paraRevisar.length > 0 && !todasRevisadas);

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
              <li key={`${row.sheetName ?? ''}-${row.rowNumber}`}>
                {rowLabel(row)}: {row.message}
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

      {paraRevisar.length ? (
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-3">
          <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <CircleAlert size={16} className="text-warning" aria-hidden="true" />
            Células para revisar (OCR)
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Estas células foram lidas pela foto e podem estar erradas mesmo
            parecendo válidas. Revise cada uma antes de confirmar.
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-text-secondary">
            {paraRevisar.slice(0, 30).map((row) => (
              <li
                key={`${row.sheetName ?? ''}-${row.rowNumber}`}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  className="flex items-center gap-1 p-1 rounded border border-transparent hover:bg-surface-2 transition-colors"
                  onClick={() => void revisarToggle(row)}
                  aria-pressed={revisados.has(chaveRevisar(row))}
                  data-testid={`import-review-toggle-${row.sheetName ?? ''}-${row.rowNumber}`}
                >
                  {revisados.has(chaveRevisar(row)) ? (
                    <CircleCheck size={14} className="text-success" aria-hidden="true" />
                  ) : (
                    <CircleAlert size={14} className="text-warning" aria-hidden="true" />
                  )}
                </button>
                <span className="flex-1">
                  {rowLabel(row)}{row.field ? ` · campo: ${row.field}` : ''}
                </span>
                <span className="text-xs text-text-muted">
                  {row.revisar ? 'revisar' : ''}
                </span>
              </li>
            ))}
          </ul>
          {paraRevisar.length > 30 ? (
            <p className="mt-1 text-xs text-text-muted">
              Mostrando 30 de {paraRevisar.length}.
            </p>
          ) : null}
          {!todasRevisadas ? (
            <p className="mt-1 text-xs text-warning font-medium" data-testid="import-review-pending">
              Revise todas as células marcadas antes de confirmar.
            </p>
          ) : (
            <p className="mt-1 text-xs text-success" data-testid="import-review-all-done">
              Todas as células para revisar foram conferidas.
            </p>
          )}
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
              <li key={`${row.sheetName ?? ''}-${row.rowNumber}`}>
                {rowLabel(row)}: {row.message}
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
          disabled={confirmDisabled}
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
