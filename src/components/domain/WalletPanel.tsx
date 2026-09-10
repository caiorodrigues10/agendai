import React, { useEffect, useState } from 'react';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react';
import { walletApi, WalletBalance, WalletEntry } from '../../infra/walletApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';

export const WalletPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Forms
  const [showCredit, setShowCredit] = useState(false);
  const [showDebit, setShowDebit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!barbershopId) return;
    setLoading(true);
    Promise.all([
      walletApi.getBalance(barbershopId),
      walletApi.listEntries(barbershopId, typeFilter ? { type: typeFilter } : undefined),
    ])
      .then(([b, e]) => { setBalance(b); setEntries(e); })
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar carteira.')))
      .finally(() => setLoading(false));
  }, [barbershopId, typeFilter]);

  const resetForm = () => {
    setAmount(0);
    setDescription('');
    setReferenceId('');
    setTransferTo('');
    setShowCredit(false);
    setShowDebit(false);
    setShowTransfer(false);
  };

  const handleCredit = async () => {
    if (!barbershopId || amount <= 0 || !description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const entry = await walletApi.credit(barbershopId, {
        amount,
        description: description.trim(),
        referenceId: referenceId.trim() || undefined,
      });
      setEntries(prev => [entry, ...prev]);
      setBalance(prev => prev ? { ...prev, balance: prev.balance + amount } : null);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao creditar.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDebit = async () => {
    if (!barbershopId || amount <= 0 || !description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const entry = await walletApi.debit(barbershopId, {
        amount,
        description: description.trim(),
        referenceId: referenceId.trim() || undefined,
      });
      setEntries(prev => [entry, ...prev]);
      setBalance(prev => prev ? { ...prev, balance: prev.balance - amount } : null);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao debitar.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!barbershopId || amount <= 0 || !transferTo.trim() || !description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const entry = await walletApi.transfer(barbershopId, {
        toBarbershopId: transferTo.trim(),
        amount,
        description: description.trim(),
      });
      setEntries(prev => [entry, ...prev]);
      setBalance(prev => prev ? { ...prev, balance: prev.balance - amount } : null);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao transferir.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Carteira</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { resetForm(); setShowCredit(!showCredit); }}
            className="inline-flex items-center gap-1 rounded-xl bg-success/10 px-3 py-2 text-xs font-bold text-success hover:bg-success/20"
          >
            <ArrowUpCircle size={14} /> Crédito
          </button>
          <button
            onClick={() => { resetForm(); setShowDebit(!showDebit); }}
            className="inline-flex items-center gap-1 rounded-xl bg-error/10 px-3 py-2 text-xs font-bold text-error hover:bg-error/20"
          >
            <ArrowDownCircle size={14} /> Débito
          </button>
          <button
            onClick={() => { resetForm(); setShowTransfer(!showTransfer); }}
            className="inline-flex items-center gap-1 rounded-xl bg-surface-2 px-3 py-2 text-xs font-bold text-text-secondary hover:bg-surface"
          >
            <ArrowRightLeft size={14} /> Transferir
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {balance && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
          <Wallet size={28} className="mx-auto mb-2 text-accent" />
          <p className="text-3xl font-bold text-accent">R$ {balance.balance.toFixed(2)}</p>
          <p className="text-xs text-text-muted">Saldo disponível</p>
        </div>
      )}

      {showCredit && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <p className="text-xs font-bold text-success">Creditar</p>
          <input
            type="number"
            min={0.01}
            step={0.01}
            placeholder="Valor"
            value={amount || ''}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Referência (opcional)"
            value={referenceId}
            onChange={e => setReferenceId(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void handleCredit()}
              disabled={submitting || amount <= 0 || !description.trim()}
              className="flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={14} /> : <ArrowUpCircle size={14} />}
              Creditar
            </button>
            <button onClick={resetForm} className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showDebit && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <p className="text-xs font-bold text-error">Debitar</p>
          <input
            type="number"
            min={0.01}
            step={0.01}
            placeholder="Valor"
            value={amount || ''}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Referência (opcional)"
            value={referenceId}
            onChange={e => setReferenceId(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void handleDebit()}
              disabled={submitting || amount <= 0 || !description.trim()}
              className="flex items-center gap-2 rounded-xl bg-error px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={14} /> : <ArrowDownCircle size={14} />}
              Debitar
            </button>
            <button onClick={resetForm} className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <p className="text-xs font-bold text-text-secondary">Transferir</p>
          <input
            type="text"
            placeholder="ID da barbearia destino"
            value={transferTo}
            onChange={e => setTransferTo(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <input
            type="number"
            min={0.01}
            step={0.01}
            placeholder="Valor"
            value={amount || ''}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void handleTransfer()}
              disabled={submitting || amount <= 0 || !transferTo.trim() || !description.trim()}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={14} /> : <ArrowRightLeft size={14} />}
              Transferir
            </button>
            <button onClick={resetForm} className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {['', 'CREDIT', 'DEBIT', 'TRANSFER'].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              typeFilter === t ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {t === '' ? 'Todos' : t === 'CREDIT' ? 'Créditos' : t === 'DEBIT' ? 'Débitos' : 'Transferências'}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <Wallet size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-secondary">Nenhuma movimentação.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
              <div className={`rounded-full p-2 ${entry.type === 'CREDIT' ? 'bg-success/10' : entry.type === 'DEBIT' ? 'bg-error/10' : 'bg-surface-2'}`}>
                {entry.type === 'CREDIT' ? (
                  <ArrowUpCircle size={16} className="text-success" />
                ) : entry.type === 'DEBIT' ? (
                  <ArrowDownCircle size={16} className="text-error" />
                ) : (
                  <ArrowRightLeft size={16} className="text-text-muted" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary">{entry.description}</p>
                <p className="text-[10px] text-text-muted">
                  {entry.type} · {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className={`text-sm font-bold ${entry.type === 'CREDIT' ? 'text-success' : entry.type === 'DEBIT' ? 'text-error' : 'text-text-secondary'}`}>
                {entry.type === 'CREDIT' ? '+' : entry.type === 'DEBIT' ? '-' : ''}R$ {entry.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
