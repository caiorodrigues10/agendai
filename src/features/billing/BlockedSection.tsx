import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, BlockedEntityItem, ListMeta } from '../../infra/adminApi';
import {
  errorMessage,
  formatDateTime,
  EMPTY_META,
  SectionError,
  TableSkeleton,
  EmptyRow,
  PaginationBar,
} from './billingShared';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import {
  LuSearch as Search,
  LuRefreshCcw as RefreshCcw,
  LuLockOpen as Unlock,
  LuBan as Ban,
  LuCircleCheck as CheckCircle2,
} from 'react-icons/lu';

// ─────────────────────────────────────────────
// Seção: Bloqueios (inadimplência)
// ─────────────────────────────────────────────

export const BlockedSection: React.FC = () => {
  const [entities, setEntities] = useState<BlockedEntityItem[]>([]);
  const [meta, setMeta] = useState<ListMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<BlockedEntityItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'bot' } | null>(null);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listBlockedEntities({
        page,
        limit: 10,
        isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
        search: search || undefined,
      });
      setEntities(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchEntities, 300);
    return () => clearTimeout(timer);
  }, [fetchEntities]);

  const handleUnblock = async (entity: BlockedEntityItem) => {
    setUnblockingId(entity.id);
    try {
      await adminApi.unblockEntity(entity.id);
      fetchEntities();
      setToast({ message: 'Entidade desbloqueada.', type: 'success' });
    } catch (err) {
      setToast({ message: errorMessage(err), type: 'error' });
    } finally {
      setUnblockingId(null);
      setConfirmUnblock(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={24} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por valor ou motivo..."
            className="w-full bg-surface border border-border text-text-primary text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-focus focus:ring-1 focus:ring-focus transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
          {(['active', 'inactive', 'all'] as const).map(s => (
            <button
              key={s}
              onClick={() => {
                setActiveFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeFilter === s
                  ? 'bg-accent text-accent-fg'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {s === 'active' ? 'Bloqueados' : s === 'inactive' ? 'Desbloqueados' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <SectionError message={error} onRetry={fetchEntities} />
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-text-muted uppercase text-[10px] font-bold tracking-widest border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Tipo / Valor</th>
                  <th className="px-6 py-3.5 hidden md:table-cell">Motivo</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 hidden lg:table-cell">Bloqueado em</th>
                  <th className="px-6 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <TableSkeleton cols={5} />
                ) : entities.length === 0 ? (
                  <EmptyRow cols={5} message="Nenhum bloqueio encontrado." />
                ) : (
                  entities.map(entity => (
                    <tr key={entity.id} className="hover:bg-surface-2/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-surface-2 text-text-secondary border-border-strong mr-2">
                          {entity.type}
                        </span>
                        <span className="font-mono text-sm text-text-primary">{entity.value}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs text-text-secondary max-w-[220px] truncate block">
                          {entity.reason ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                            entity.isActive
                              ? 'bg-danger/10 text-danger border-danger/20'
                              : 'bg-success/10 text-success border-success/20'
                          }`}
                        >
                          {entity.isActive ? <Ban size={9} /> : <CheckCircle2 size={9} />}
                          {entity.isActive ? 'Bloqueado' : 'Desbloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs text-text-secondary">
                          {formatDateTime(entity.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {entity.isActive && (
                          <button
                            onClick={() => setConfirmUnblock(entity)}
                            disabled={unblockingId === entity.id}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-success border border-success/20 hover:bg-success/10 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
                          >
                            {unblockingId === entity.id ? (
                              <RefreshCcw size={12} className="animate-spin" />
                            ) : (
                              <Unlock size={12} />
                            )}
                            Desbloquear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <PaginationBar meta={meta} page={page} loading={loading} onPageChange={setPage} />
        </div>
      )}
      <ConfirmDialog
        open={confirmUnblock !== null}
        title="Desbloquear entidade"
        message={`Desbloquear ${confirmUnblock?.type ?? ''} ${confirmUnblock?.value ?? ''}? O acesso será restaurado imediatamente.`}
        confirmLabel="Desbloquear"
        loading={unblockingId !== null}
        onConfirm={() => confirmUnblock && void handleUnblock(confirmUnblock)}
        onCancel={() => setConfirmUnblock(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
