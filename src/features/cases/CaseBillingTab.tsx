import React, { useState } from 'react';
import { LuPlus as Plus, LuReceipt as Receipt } from 'react-icons/lu';
import {
  casesApi,
  type CaseFeeInvoice,
  type CaseSuccessFee,
} from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import { formatCurrency, formatDate } from './caseLabels';

export const SUCCESS_FEE_STATUS_LABELS: Record<CaseSuccessFee['status'], string> = {
  PENDING: 'A receber',
  INVOICED: 'Faturado',
  PAID: 'Recebido',
  CANCELED: 'Cancelado',
};

export const FEE_INVOICE_STATUS_LABELS: Record<CaseFeeInvoice['status'], string> = {
  DRAFT: 'Rascunho',
  ISSUED: 'Emitida',
  CANCELED: 'Cancelada',
  FAILED: 'Falha na emissão',
};

export interface CaseBillingTabProps {
  caseId: string;
  clientId: string;
  successFees: CaseSuccessFee[];
  invoices: CaseFeeInvoice[];
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

/**
 * Honorários e faturamento do processo.
 *
 * Honorário de êxito: o escritório informa o percentual; o valor é
 * calculado sobre o resultado apurado no caso. NFS-e: emissão manual (o
 * número é digitado) ou via provedor configurado pelo escritório.
 */
export const CaseBillingTab: React.FC<CaseBillingTabProps> = ({
  caseId,
  clientId,
  successFees,
  invoices,
  onChanged,
  onNotify,
}) => {
  const [percent, setPercent] = useState('');
  const [installments, setInstallments] = useState('1');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [busy, setBusy] = useState(false);

  const createSuccessFee = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(percent);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setBusy(true);
    try {
      await casesApi.createSuccessFee(caseId, {
        percent: parsed,
        installments: Number(installments) || 1,
      });
      setPercent('');
      await onChanged();
      onNotify?.('Honorário de êxito registrado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const markFeePaid = async (fee: CaseSuccessFee) => {
    try {
      await casesApi.updateSuccessFee(fee.id, { status: 'PAID', paidAt: new Date().toISOString() });
      await onChanged();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  const createInvoice = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(amount);
    if (!description.trim() || !Number.isFinite(parsed) || parsed <= 0) return;
    setBusy(true);
    try {
      await casesApi.createFeeInvoice({
        caseId,
        clientId,
        description: description.trim(),
        amount: parsed,
        invoiceNumber: invoiceNumber.trim() || null,
      });
      setDescription('');
      setAmount('');
      setInvoiceNumber('');
      await onChanged();
      onNotify?.('Nota fiscal criada.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const issueInvoice = async (invoice: CaseFeeInvoice) => {
    try {
      await casesApi.issueFeeInvoice(invoice.id, {
        invoiceNumber: invoice.invoiceNumber ?? undefined,
      });
      await onChanged();
      onNotify?.('Nota fiscal emitida.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
      await onChanged();
    }
  };

  return (
    <section className="space-y-4">
      {/* Honorários de êxito */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Honorários de êxito
        </h3>
        <form onSubmit={createSuccessFee} className="flex flex-wrap items-end gap-2">
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Percentual (%)
            </span>
            <input
              className={FIELD_CONTROL}
              type="number"
              min={1}
              max={100}
              step="0.01"
              value={percent}
              onChange={event => setPercent(event.target.value)}
              aria-label="Percentual de honorário de êxito"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Parcelas
            </span>
            <input
              className={FIELD_CONTROL}
              type="number"
              min={1}
              value={installments}
              onChange={event => setInstallments(event.target.value)}
              aria-label="Número de parcelas"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !percent}
            className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
          >
            <Plus size={14} /> Registrar
          </button>
        </form>

        {successFees.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-3 py-3 text-center text-xs text-text-muted">
            Nenhum honorário de êxito registrado.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {successFees.map(fee => (
              <li
                key={fee.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs"
              >
                <div>
                  <p className="font-bold text-text-primary">
                    {fee.percent}% {fee.amount !== null ? `· ${formatCurrency(fee.amount)}` : ''}
                  </p>
                  <p className="text-text-muted">
                    {SUCCESS_FEE_STATUS_LABELS[fee.status]}
                    {fee.baseAmount !== null ? ` · base ${formatCurrency(fee.baseAmount)}` : ''}
                    {fee.installments > 1 ? ` · ${fee.installments} parcelas` : ''}
                    {fee.dueDate ? ` · vence ${formatDate(fee.dueDate)}` : ''}
                  </p>
                </div>
                {fee.status !== 'PAID' && (
                  <button
                    type="button"
                    onClick={() => void markFeePaid(fee)}
                    className="rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary"
                  >
                    Marcar recebido
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* NFS-e */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Notas fiscais (NFS-e)
        </h3>
        <form onSubmit={createInvoice} className="flex flex-wrap items-end gap-2">
          <label className="min-w-[10rem] flex-1 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Descrição
            </span>
            <input
              className={FIELD_CONTROL}
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Ex.: Honorários — petição inicial"
              aria-label="Descrição da nota fiscal"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Valor</span>
            <input
              className={FIELD_CONTROL}
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              aria-label="Valor da nota fiscal"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Nº da NFS-e (opcional)
            </span>
            <input
              className={FIELD_CONTROL}
              value={invoiceNumber}
              onChange={event => setInvoiceNumber(event.target.value)}
              placeholder="000123"
              aria-label="Número da nota fiscal"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !description.trim() || !amount}
            className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
          >
            <Receipt size={14} /> Criar nota
          </button>
        </form>

        {invoices.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface px-3 py-3 text-center text-xs text-text-muted">
            Nenhuma nota fiscal emitida neste processo.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {invoices.map(invoice => (
              <li
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs"
              >
                <div>
                  <p className="font-bold text-text-primary">
                    {invoice.description} · {formatCurrency(invoice.amount)}
                  </p>
                  <p className="text-text-muted">
                    {FEE_INVOICE_STATUS_LABELS[invoice.status]}
                    {invoice.invoiceNumber ? ` · nº ${invoice.invoiceNumber}` : ''}
                    {invoice.issuedAt ? ` · emitida em ${formatDate(invoice.issuedAt)}` : ''}
                  </p>
                  {invoice.errorMessage && (
                    <p className="text-danger">{invoice.errorMessage}</p>
                  )}
                </div>
                {invoice.status !== 'ISSUED' && (
                  <button
                    type="button"
                    onClick={() => void issueInvoice(invoice)}
                    className="rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary"
                  >
                    Emitir
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
