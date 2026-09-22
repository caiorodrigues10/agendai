import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuSearch, LuPlus, LuFilter, LuLoader, LuTriangleAlert, LuArrowRight, LuX
} from 'react-icons/lu';
import { adminInternalApi, Ticket, PaginatedResponse } from '../../infra/adminInternalApi';

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'text-danger bg-danger/10',
  HIGH: 'text-warning bg-warning/10',
  NORMAL: 'text-accent bg-accent/10',
  LOW: 'text-text-muted bg-surface-2',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'text-support bg-support/10',
  IN_PROGRESS: 'text-accent bg-accent/10',
  WAITING_SHOP: 'text-warning bg-warning/10',
  RESOLVED: 'text-success bg-success/10',
  CANCELLED: 'text-text-muted bg-surface-2',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em atendimento',
  WAITING_SHOP: 'Aguardando salão',
  RESOLVED: 'Resolvido',
  CANCELLED: 'Cancelado',
};

export const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get('page') ?? 1);
  const status = searchParams.get('status') ?? '';
  const priority = searchParams.get('priority') ?? '';
  const unassigned = searchParams.get('unassigned') ?? '';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminInternalApi.listTickets({
        page, limit: 25, search, status, priority, unassigned: unassigned || undefined,
      });
      setTickets(res.data);
      setMeta(res.meta);
    } catch {
      setError('Não foi possível carregar os chamados.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, unassigned]);

  useEffect(() => { void load(); }, [load]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Atendimento</h1>
        <button
          onClick={() => navigate('/master/tickets/new')}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover"
        >
          <LuPlus size={16} /> Novo chamado
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por protocolo ou título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('search', search)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg border ${showFilters ? 'border-accent bg-accent/10' : 'border-border bg-surface'}`}
        >
          <LuFilter size={16} />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-surface border border-border rounded-lg">
          <FilterChip
            label="Status"
            value={status}
            options={Object.entries(STATUS_LABELS)}
            onChange={(v) => updateParam('status', v)}
          />
          <FilterChip
            label="Prioridade"
            value={priority}
            options={[['LOW', 'Baixa'], ['NORMAL', 'Normal'], ['HIGH', 'Alta'], ['URGENT', 'Urgente']]}
            onChange={(v) => updateParam('priority', v)}
          />
          <button
            onClick={() => updateParam('unassigned', unassigned ? '' : 'true')}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              unassigned ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted hover:border-accent'
            }`}
          >
            Sem responsável
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LuLoader className="animate-spin text-accent" size={24} />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
          <p className="text-sm text-text-secondary">{error}</p>
          <button onClick={load} className="text-accent text-sm mt-2 hover:underline">Tentar novamente</button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">
          Nenhum chamado encontrado.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border/50">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/master/tickets/${t.id}`)}
              className="w-full text-left flex items-center gap-4 p-4 hover:bg-surface-2 transition-colors"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                {t.priority}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-text-muted">{t.protocol}</span>
                  <span className="text-sm font-medium truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[t.status] ?? ''}`}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                  {t.barbershop && <span className="text-xs text-text-muted">{t.barbershop.name}</span>}
                  <span className="text-xs text-text-muted">
                    {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {t.assignedTo ? (
                  <span className="text-xs text-text-muted">{t.assignedTo.name}</span>
                ) : (
                  <span className="text-xs text-warning">Sem responsável</span>
                )}
              </div>
              <LuArrowRight size={14} className="text-text-muted shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">{meta.total} resultados</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateParam('page', String(page - 1))}
              className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-surface-2"
            >
              Anterior
            </button>
            <span className="text-text-muted">{page}/{meta.totalPages}</span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => updateParam('page', String(page + 1))}
              className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-surface-2"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── FilterChip ────────────────────────────────────────────────────────────────

const FilterChip: React.FC<{
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none px-3 py-1 pr-6 rounded-full text-xs border border-border bg-surface text-text-primary focus:outline-none focus:border-accent"
    >
      <option value="">{label}</option>
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  </div>
);

export default TicketsPage;
