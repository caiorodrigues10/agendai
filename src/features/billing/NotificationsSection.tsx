import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminNotificationItem } from '../../infra/adminApi';
import {
  formatDateTime,
  SectionError,
  TableSkeleton,
  EmptyRow,
  PaginationBar,
} from './billingShared';
import { LuRefreshCcw as RefreshCcw } from 'react-icons/lu';

// ─────────────────────────────────────────────
// Notificações admin
// ─────────────────────────────────────────────

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  BLOCK_AUTO: 'Bloqueio automático',
  UNBLOCK_AUTO: 'Desbloqueio automático',
  UNBLOCK_MANUAL: 'Desbloqueio manual',
  SUBSCRIPTION_EXPIRED: 'Assinatura expirada',
  PAYMENT_RECEIVED: 'Pagamento recebido',
  CONTACT_MESSAGE: 'Mensagem de contato',
};

export const NotificationsSection: React.FC = () => {
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listNotifications({
        page,
        limit: 20,
        read: filter === 'unread' ? false : undefined,
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e?.message ?? 'Falha ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await adminApi.markNotificationRead(id);
      setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      setMeta(prev => (prev ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) } : prev));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      setMeta(prev => (prev ? { ...prev, unreadCount: 0 } : prev));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2 border border-transparent'
              }`}
            >
              {f === 'all'
                ? 'Todas'
                : `Não lidas${meta?.unreadCount ? ` (${meta.unreadCount})` : ''}`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {(meta?.unreadCount ?? 0) > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-accent hover:text-accent-hover border border-accent/20 hover:bg-accent/10 rounded-lg px-3 py-1.5 transition-all"
            >
              Marcar todas como lidas
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all disabled:opacity-50"
            aria-label="Atualizar"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error ? (
        <SectionError message={error} onRetry={fetchNotifications} />
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Notificação</th>
                  <th className="px-6 py-3.5 hidden md:table-cell">Tipo</th>
                  <th className="px-6 py-3.5 hidden lg:table-cell">Data</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <TableSkeleton cols={4} />
                ) : items.length === 0 ? (
                  <EmptyRow cols={4} message="Nenhuma notificação encontrada." />
                ) : (
                  items.map(n => (
                    <tr
                      key={n.id}
                      className={`hover:bg-surface-2/20 transition-colors ${!n.read ? 'bg-accent/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p
                          className={`text-sm ${n.read ? 'text-text-secondary' : 'text-text-primary font-semibold'}`}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 max-w-md">{n.message}</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs text-text-secondary">
                          {NOTIFICATION_TYPE_LABELS[n.type] ?? n.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs text-text-secondary">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {n.read ? (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            Lida
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-xs font-bold text-accent hover:text-accent-hover border border-accent/20 hover:bg-accent/10 rounded-lg px-3 py-1.5 transition-all"
                          >
                            Marcar lida
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {meta && (
            <PaginationBar meta={meta} page={page} loading={loading} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  );
};
