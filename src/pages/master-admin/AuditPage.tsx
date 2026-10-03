import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuLoader, LuTriangleAlert, LuShield } from 'react-icons/lu';
import { apiClient } from '../../infra/apiClient';
import { authStorage } from '../../infra/authStorage';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export const AuditPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Number(searchParams.get('page') ?? 1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ page: String(page), limit: '25' });
      const res = await apiClient<{ success: boolean; data: AuditLog[]; meta: any }>(
        `/api/admin/audit-logs?${q.toString()}`, 'GET', undefined, authStorage.getAccessToken() || ''
      );
      setLogs(res.data);
      setMeta(res.meta);
    } catch {
      setError('Não foi possível carregar os logs de auditoria.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  const updatePage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LuLoader className="animate-spin text-accent" size={32} /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button onClick={load} className="text-accent text-sm mt-2 hover:underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <LuShield size={20} /> Auditoria
      </h1>

      <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border/50">
        {logs.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-muted">Nenhum registro encontrado.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="px-4 py-3 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-accent font-medium">{log.action}</span>
                  <span className="text-xs text-text-muted">em</span>
                  <span className="text-xs font-medium">{log.resource}</span>
                  {log.resourceId && (
                    <span className="text-xs text-text-muted font-mono truncate">{log.resourceId}</span>
                  )}
                </div>
                {log.details && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{log.details}</p>
                )}
              </div>
              <span className="text-[10px] text-text-muted shrink-0">
                {new Date(log.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
          ))
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">{meta.total} registros</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => updatePage(page - 1)}
              className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-surface-2">Anterior</button>
            <span className="text-text-muted">{page}/{meta.totalPages}</span>
            <button disabled={page >= meta.totalPages} onClick={() => updatePage(page + 1)}
              className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-surface-2">Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditPage;
