import React, { useState } from 'react';
import {
  LuCircleAlert as CircleAlert,
  LuCircleCheck as CircleCheck,
  LuPencil as Pencil,
} from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import type {
  ImportValidationSummary,
  OcrCelulaRevisar,
  OcrCelulaRevisao,
} from '../../infra/dataImportApi';

/**
 * Etapa 4/5 — prévia da validação.
 *
 * Mostra quantas linhas entram, quantas são ignoradas e por que cada linha
 * foi rejeitada. Nada foi gravado ainda: o dono decide aqui.
 *
 * Quando a origem é uma imagem (OCR), as células duvidosas vêm com a confiança
 * da leitura. O dono **corrige o valor** ou **aceita como está** — a correção
 * vai para o servidor (PATCH /imports/:batchId/review), que revalida o lote e
 * devolve a prévia nova. O botão Confirmar fica desabilitado enquanto houver
 * célula pendente.
 */
export const ImportReviewStep: React.FC<{
  validation: ImportValidationSummary;
  busy: boolean;
  /** Rótulo da aba de cada linha (quando o arquivo tem várias abas). */
  sheetLabels?: Record<string, string>;
  onBack: () => void;
  onRevalidate: () => Promise<void>;
  onReviewCell: (revisao: OcrCelulaRevisao) => Promise<void>;
  onConfirm: () => Promise<void>;
}> = ({ validation, busy, sheetLabels, onBack, onRevalidate, onReviewCell, onConfirm }) => {
  const rejected = validation.results.filter((row) => row.status === 'FAILED');
  const skipped = validation.results.filter((row) => row.status === 'SKIPPED');
  const comCelulas = validation.results.filter((row) => (row.celulasRevisar?.length ?? 0) > 0);
  const pendentes = comCelulas.flatMap((row) => row.celulasRevisar ?? []).filter((c) => c.pendente);
  const [edits, setEdits] = useState<Record<string, string>>({});

  /** "Linha 3" ou "Aba “Clientes” · linha 3" quando há várias abas. */
  const rowLabel = (row: { rowNumber: number; sheetName?: string | null }) => {
    const sheet = row.sheetName ?? null;
    if (!sheet || !sheetLabels) return `Linha ${row.rowNumber}`;
    return `Aba “${sheetLabels[sheet] ?? sheet}” · linha ${row.rowNumber}`;
  };

  const chave = (celula: OcrCelulaRevisar) => `${celula.linha}:${celula.coluna}`;

  const valorEditado = (celula: OcrCelulaRevisar) => edits[chave(celula)] ?? celula.valor;

  const salvar = (celula: OcrCelulaRevisar) => {
    void onReviewCell({ linha: celula.linha, coluna: celula.coluna, valor: valorEditado(celula) });
  };

  const aceitar = (celula: OcrCelulaRevisar) => {
    void onReviewCell({ linha: celula.linha, coluna: celula.coluna, aceitar: true });
  };

  const confirmDisabled = busy || validation.validRows === 0 || pendentes.length > 0;

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

      {comCelulas.length ? (
        <div
          className="rounded-xl border border-warning/40 bg-warning/5 p-3"
          data-testid="import-review-cells"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <CircleAlert size={16} className="text-warning" aria-hidden="true" />
            Células para revisar (OCR)
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Estas células foram lidas pela foto e podem estar erradas mesmo parecendo
            válidas. Corrija o valor ou aceite como está antes de confirmar.
          </p>

          <div className="mt-2 space-y-2">
            {comCelulas.map((row) => (
              <div
                key={`${row.sheetName ?? ''}-${row.rowNumber}`}
                className="rounded-lg border border-border bg-surface p-2"
                data-testid={`import-review-row-${row.sheetName ?? ''}-${row.rowNumber}`}
              >
                <p className="text-xs font-bold text-text-primary">{rowLabel(row)}</p>

                <ul className="mt-1 space-y-2">
                  {(row.celulasRevisar ?? []).map((celula) => (
                    <li
                      key={chave(celula)}
                      className="rounded-lg border border-border bg-surface-2 p-2"
                      data-testid={`import-review-cell-${chave(celula)}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                            celula.pendente
                              ? 'bg-warning/15 text-warning'
                              : 'bg-success/15 text-success',
                          ].join(' ')}
                          data-testid={`import-review-badge-${chave(celula)}`}
                        >
                          {celula.pendente ? (
                            <>
                              <CircleAlert size={12} aria-hidden="true" />
                              revisar
                            </>
                          ) : celula.editado ? (
                            <>
                              <Pencil size={12} aria-hidden="true" />
                              corrigido
                            </>
                          ) : (
                            <>
                              <CircleCheck size={12} aria-hidden="true" />
                              aceito
                            </>
                          )}
                        </span>
                        <span className="text-xs font-semibold text-text-primary">
                          {celula.campo}
                        </span>
                        {celula.confianca !== null ? (
                          <span className="text-[11px] text-text-muted">
                            confiança {celula.confianca}%
                          </span>
                        ) : null}
                      </div>

                      {celula.motivo ? (
                        <p className="mt-1 text-[11px] text-text-muted">{celula.motivo}</p>
                      ) : null}

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={valorEditado(celula)}
                          onChange={(event) =>
                            setEdits((current) => ({
                              ...current,
                              [chave(celula)]: event.target.value,
                            }))
                          }
                          disabled={busy || !celula.pendente}
                          aria-label={`Valor de ${celula.campo}`}
                          className="min-w-[10rem] flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-primary"
                          data-testid={`import-review-input-${chave(celula)}`}
                        />
                        <Button
                          variant="secondary"
                          disabled={busy || !celula.pendente}
                          onClick={() => salvar(celula)}
                          data-testid={`import-review-save-${chave(celula)}`}
                        >
                          Salvar correção
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={busy || !celula.pendente}
                          onClick={() => aceitar(celula)}
                          data-testid={`import-review-accept-${chave(celula)}`}
                        >
                          Aceitar como está
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {pendentes.length > 0 ? (
            <p className="mt-2 text-xs font-medium text-warning" data-testid="import-review-pending">
              {pendentes.length} célula(s) ainda esperando você: corrija ou aceite cada uma
              antes de confirmar.
            </p>
          ) : (
            <p className="mt-2 text-xs text-success" data-testid="import-review-all-done">
              Todas as células para revisar foram conferidas.
            </p>
          )}
        </div>
      ) : null}

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
