import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuSearch, LuPlus, LuLoader, LuTriangleAlert, LuArrowRight, LuCalendar, LuFilter
} from 'react-icons/lu';
import { adminInternalApi, Task } from '../../infra/adminInternalApi';

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'text-danger bg-danger/10', HIGH: 'text-warning bg-warning/10',
  NORMAL: 'text-accent bg-accent/10', LOW: 'text-text-muted bg-surface-2',
};

const STATUS_COLORS: Record<string, string> = {
  TODO: 'text-text-muted bg-surface-2', IN_PROGRESS: 'text-accent bg-accent/10',
  BLOCKED: 'text-danger bg-danger/10', DONE: 'text-success bg-success/10',
  CANCELLED: 'text-text-muted bg-surface-2',
};

const STATUS_LABELS: Record<string, string> = {
  TODO: 'A fazer', IN_PROGRESS: 'Em andamento', BLOCKED: 'Bloqueada',
  DONE: 'Concluída', CANCELLED: 'Cancelada',
};

export const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  const page = Number(searchParams.get('page') ?? 1);
  const status = searchParams.get('status') ?? '';
  const priority = searchParams.get('priority') ?? '';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminInternalApi.listTasks({ page, limit: 25, search, status, priority });
      setTasks(res.data);
      setMeta(res.meta);
    } catch {
      setError('Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority]);

  useEffect(() => { void load(); }, [load]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tarefas</h1>
        <button
          onClick={() => navigate('/master/tasks/new')}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover"
        >
          <LuPlus size={16} /> Nova tarefa
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" placeholder="Buscar tarefa..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('search', search)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={status} onChange={(e) => updateParam('status', e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LuLoader className="animate-spin text-accent" size={24} /></div>
      ) : error ? (
        <div className="text-center py-12">
          <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
          <p className="text-sm text-text-secondary">{error}</p>
          <button onClick={load} className="text-accent text-sm mt-2 hover:underline">Tentar novamente</button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">Nenhuma tarefa encontrada.</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/master/tasks/${t.id}`)}
              className="w-full text-left flex items-center gap-4 p-4 hover:bg-surface-2 transition-colors"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${PRIORITY_COLORS[t.priority]}`}>
                {t.priority}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[t.status]}`}>
                    {STATUS_LABELS[t.status]}
                  </span>
                  {t.assignedTo && <span className="text-xs text-text-muted">{t.assignedTo.name}</span>}
                  {t.dueDate && (
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <LuCalendar size={10} />
                      {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {t.ticket && <span className="text-xs text-accent">{t.ticket.protocol}</span>}
                </div>
              </div>
              <LuArrowRight size={14} className="text-text-muted shrink-0" />
            </button>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">{meta.total} resultados</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}
              className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-surface-2">Anterior</button>
            <span className="text-text-muted">{page}/{meta.totalPages}</span>
            <button disabled={page >= meta.totalPages} onClick={() => updateParam('page', String(page + 1))}
              className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-surface-2">Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
