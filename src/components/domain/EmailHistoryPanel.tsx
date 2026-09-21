import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Clock3, CheckCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { emailApi } from '../../infra/emailApi';

interface EmailHistoryPanelProps {
  barbershopId: string;
}

type LogEntry = {
  id: string;
  template: string;
  category: string;
  recipientMasked: string;
  subject: string;
  status: string;
  attemptCount: number;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  errorCode?: string | null;
  errorMessage?: string | null;
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Na fila', color: 'text-text-muted' },
  SENT: { label: 'Enviado', color: 'text-success' },
  DELIVERED: { label: 'Entregue', color: 'text-accent' },
  READ: { label: 'Lido', color: 'text-accent' },
  FAILED: { label: 'Falhou', color: 'text-danger' },
  SKIPPED: { label: 'Ignorado', color: 'text-text-muted' },
  BOUNCED: { label: 'Rejeitado', color: 'text-danger' },
};

export const EmailHistoryPanel: React.FC<EmailHistoryPanelProps> = ({ barbershopId }) => {
  const [items, setItems] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await emailApi.listHistory(barbershopId, { page: p, limit: 10 });
      setItems(res.data);
      setTotal(res.meta.total);
      setPage(res.meta.page);
    } catch (err) {
      setError('Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => { void load(1); }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / 10));

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <Mail size={16} className="text-accent" aria-hidden /> Histórico de e-mails
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            O que foi enviado da sua conta. Mostra tentativas e falhas sem revelar conteúdo dos e-mails.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load(1)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Atualizar
        </button>
      </div>

      {/* Lista */}
      {error ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <AlertTriangle size={28} className="text-danger" aria-hidden />
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Mail size={32} className="mx-auto text-text-muted" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-text-secondary">
            Nenhum e-mail enviado ainda.
          </p>
          <p className="text-xs text-text-muted mt-1">
            A história será preenchida conforme você usar a plataforma.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map(entry => (
            <div key={entry.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-text-primary">
                    {entry.subject}
                  </span>
                  <span className="shrink-0 rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] font-bold text-text-muted">
                    {entry.template}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-text-muted">
                  Para: <strong>{entry.recipientMasked}</strong>
                </p>
                {entry.errorMessage && (
                  <p className="mt-1 text-xs text-danger truncate">{entry.errorMessage}</p>
                )}
                <p className="mt-1 text-[11px] text-text-muted">
                  {entry.sentAt
                    ? `Enviado em ${new Date(entry.sentAt).toLocaleString('pt-BR')}`
                    : `Criado em ${new Date(entry.createdAt).toLocaleString('pt-BR')}`}
                  {entry.attemptCount > 1 && ` · ${entry.attemptCount} tentativas`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`text-xs font-bold ${STATUS_META[entry.status]?.color ?? 'text-text-muted'}`}>
                  {STATUS_META[entry.status]?.label ?? entry.status}
                </span>
                {entry.deliveredAt && (
                  <span className="text-[10px] text-text-muted">
                    Entregue {new Date(entry.deliveredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <button
            type="button"
            onClick={() => void load(page - 1)}
            disabled={page <= 1 || loading}
            className="min-h-10 rounded-lg border border-border px-3 text-xs font-bold text-text-secondary hover:border-border/80 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-xs text-text-muted">Página {page} de {pageCount}</span>
          <button
            type="button"
            onClick={() => void load(page + 1)}
            disabled={page >= pageCount || loading}
            className="min-h-10 rounded-lg border border-border px-3 text-xs font-bold text-text-secondary hover:border-border/80 disabled:opacity-40"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
};
