import React, { useCallback, useEffect, useState } from 'react';
import { LuArrowRightLeft as ArrowRightLeft } from 'react-icons/lu';
import { casesApi, type CaseTransfer } from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import { formatDate } from './caseLabels';

export const TRANSFER_STATUS_LABELS: Record<CaseTransfer['status'], string> = {
  PENDING: 'Aguardando aceite',
  ACCEPTED: 'Transferido',
  REJECTED: 'Recusado',
  CANCELED: 'Cancelado',
};

export interface CaseTransfersPanelProps {
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

/**
 * Transferência de processos entre unidades do escritório (multiunidade).
 *
 * A origem pede; a unidade de destino aceita. Ao aceitar, o caso e tudo que
 * é vinculado (tarefas, prazos, andamentos, documentos, contratos, horas,
 * honorários, intimações e NFS-e) passam para a unidade de destino.
 */
export const CaseTransfersPanel: React.FC<CaseTransfersPanelProps> = ({ onNotify }) => {
  const [transfers, setTransfers] = useState<CaseTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await casesApi.listTransfers({ limit: 50 });
      setTransfers(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial das transferências
    void load();
  }, [load]);

  const respond = async (transfer: CaseTransfer, decision: 'ACCEPTED' | 'REJECTED') => {
    try {
      await casesApi.respondTransfer(transfer.id, { decision });
      await load();
      onNotify?.(decision === 'ACCEPTED' ? 'Processo transferido.' : 'Transferência recusada.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  if (loading) {
    return (
      <p className="rounded-xl border border-border bg-surface px-3 py-6 text-center text-xs text-text-muted">
        Carregando transferências…
      </p>
    );
  }

  return (
    <section className="space-y-3">
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}

      {transfers.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhuma transferência de processo entre unidades.
        </p>
      ) : (
        <ul className="space-y-2">
          {transfers.map(transfer => (
            <li
              key={transfer.id}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-text-primary">
                    {transfer.caseName ?? 'Processo'} · {transfer.originName ?? 'Origem'} →{' '}
                    {transfer.targetName ?? 'Destino'}
                  </p>
                  <p className="text-text-muted">
                    {TRANSFER_STATUS_LABELS[transfer.status]}
                    {transfer.acceptedAt ? ` · ${formatDate(transfer.acceptedAt)}` : ''}
                    {transfer.reason ? ` · ${transfer.reason}` : ''}
                  </p>
                </div>
                {transfer.status === 'PENDING' && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void respond(transfer, 'ACCEPTED')}
                      className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary"
                    >
                      <ArrowRightLeft size={12} /> Aceitar
                    </button>
                    <button
                      type="button"
                      onClick={() => void respond(transfer, 'REJECTED')}
                      className="rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-muted hover:text-text-primary"
                    >
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

/**
 * Diálogo simples de solicitação de transferência (usado no detalhe do
 * processo): escolhe a unidade de destino e informa o motivo.
 */
export const TransferCaseDialog: React.FC<{
  caseId: string;
  onClose: () => void;
  onDone?: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}> = ({ caseId, onClose, onDone, onNotify }) => {
  const [shops, setShops] = useState<{ id: string; name: string }[]>([]);
  const [target, setTarget] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga das unidades irmãs
    void casesApi
      .listSiblingShops()
      .then(setShops)
      .catch(() => setShops([]));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!target) return;
    setSaving(true);
    try {
      await casesApi.createTransfer(caseId, { targetBarbershopId: target, reason: reason.trim() || null });
      await onDone?.();
      onNotify?.('Transferência solicitada.');
      onClose();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-border bg-surface px-3 py-3 text-xs"
    >
      <p className="font-bold text-text-primary">Transferir processo para outra unidade</p>

      {shops.length === 0 ? (
        <p className="text-text-muted">
          Nenhuma outra unidade disponível. A transferência só é possível entre unidades da
          mesma organização.
        </p>
      ) : (
        <>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Unidade de destino
            </span>
            <select
              className={FIELD_CONTROL}
              value={target}
              onChange={event => setTarget(event.target.value)}
              aria-label="Unidade de destino"
            >
              <option value="">Selecione…</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Motivo (opcional)
            </span>
            <input
              className={FIELD_CONTROL}
              value={reason}
              onChange={event => setReason(event.target.value)}
              placeholder="Ex.: mudança de vara"
              aria-label="Motivo da transferência"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving || !target}
              className="rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {saving ? 'Enviando…' : 'Solicitar transferência'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-text-muted"
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </form>
  );
};
