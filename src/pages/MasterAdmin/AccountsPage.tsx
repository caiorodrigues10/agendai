import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuSearch,
  LuLoader,
  LuTriangleAlert,
  LuBuilding2,
  LuChevronRight,
} from 'react-icons/lu';
import {
  adminInternalApi,
  AccountsListResponse,
  AccountsApprovalFilter,
  AccountsSort,
  AccountsStatusFilter,
} from '../../infra/adminInternalApi';
import { PaginationBar } from '../../components/ui/PaginationBar';

const PAGE_SIZE = 20;

const VALID_STATUS: AccountsStatusFilter[] = ['active', 'inactive'];
const VALID_APPROVAL: AccountsApprovalFilter[] = ['PENDING', 'APPROVED', 'REJECTED'];
const VALID_SORT: AccountsSort[] = ['recent', 'oldest', 'name'];

const APPROVAL_LABEL: Record<AccountsApprovalFilter, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
};

const SORT_OPTIONS: { key: AccountsSort; label: string }[] = [
  { key: 'recent', label: 'Mais recentes' },
  { key: 'oldest', label: 'Mais antigas' },
  { key: 'name', label: 'Nome (A-Z)' },
];

const STATUS_OPTIONS: { key: AccountsStatusFilter | ''; label: string }[] = [
  { key: '', label: 'Todas' },
  { key: 'active', label: 'Ativas' },
  { key: 'inactive', label: 'Inativas' },
];

const APPROVAL_OPTIONS: { key: AccountsApprovalFilter | ''; label: string }[] = [
  { key: '', label: 'Toda aprovação' },
  { key: 'APPROVED', label: 'Aprovada' },
  { key: 'PENDING', label: 'Pendente' },
  { key: 'REJECTED', label: 'Rejeitada' },
];

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
      active ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
    }`}
  >
    {active ? 'Ativo' : 'Inativo'}
  </span>
);

const ApprovalBadge: React.FC<{ status: AccountsApprovalFilter }> = ({ status }) => {
  const tone =
    status === 'APPROVED'
      ? 'text-success bg-success/10'
      : status === 'PENDING'
        ? 'text-warning bg-warning/10'
        : 'text-danger bg-danger/10';
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${tone}`}>{APPROVAL_LABEL[status]}</span>;
};

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [response, setResponse] = useState<AccountsListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const q = searchParams.get('q') ?? '';
  const statusParam = searchParams.get('status') as AccountsStatusFilter | null;
  const status = statusParam && VALID_STATUS.includes(statusParam) ? statusParam : undefined;
  const approvalParam = searchParams.get('approval') as AccountsApprovalFilter | null;
  const approval = approvalParam && VALID_APPROVAL.includes(approvalParam) ? approvalParam : undefined;
  const sortParam = searchParams.get('sort') as AccountsSort | null;
  const sort: AccountsSort = sortParam && VALID_SORT.includes(sortParam) ? sortParam : 'recent';
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1;

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let active = true;
    adminInternalApi
      .getAccounts({
        page,
        limit: PAGE_SIZE,
        search: q || undefined,
        status,
        approval,
        sort,
      })
      .then((res) => {
        if (!active) return;
        setResponse(res);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Não foi possível carregar as contas.');
      });
    return () => {
      active = false;
    };
  }, [q, status, approval, sort, page, reloadKey]);

  const loading = !response && !error;

  const applySearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q');
    setParams({ q: typeof value === 'string' ? value.trim() : '', page: null });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasFilters = Boolean(q || status || approval || sort !== 'recent');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LuLoader className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error && !response) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          onClick={() => setReloadKey((key) => key + 1)}
          className="text-accent text-sm mt-2 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const meta = response?.meta;
  const accounts = response?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <LuBuilding2 size={20} /> Contas dos salões
        </h1>
        {meta && (
          <span className="text-sm text-text-muted">
            {meta.summary.total} conta(s) · {meta.summary.active} ativa(s) ·{' '}
            {meta.summary.inactive} inativa(s)
            {meta.summary.pendingApproval > 0 && ` · ${meta.summary.pendingApproval} pendente(s)`}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={applySearch} className="relative flex-1 min-w-[220px]">
          <LuSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            name="q"
            key={q || 'empty'}
            placeholder="Buscar por nome, CNPJ, WhatsApp ou cidade..."
            aria-label="Buscar contas"
            defaultValue={q}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </form>

        <div className="flex rounded-lg border border-border bg-surface p-1" role="group" aria-label="Status">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.key || 'all'}
              type="button"
              aria-pressed={(status ?? '') === option.key}
              onClick={() => setParams({ status: option.key || null, page: null })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                (status ?? '') === option.key
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-hover-bg'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Aprovação"
          value={approval ?? ''}
          onChange={(e) => setParams({ approval: e.target.value || null, page: null })}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-accent"
        >
          {APPROVAL_OPTIONS.map((option) => (
            <option key={option.key || 'all'} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Ordenação"
          value={sort}
          onChange={(e) => setParams({ sort: e.target.value === 'recent' ? null : e.target.value, page: null })}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-accent"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-accent hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          <LuTriangleAlert size={16} />
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border/50">
        {accounts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-muted">
            Nenhuma conta encontrada com estes filtros.
          </p>
        ) : (
          accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => navigate(`/master/accounts/${account.id}`)}
              className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
            >
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                {account.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{account.name}</p>
                <p className="text-xs text-text-muted truncate">
                  {account.whatsapp}
                  {account.city ? ` · ${account.city}` : ''} · criada em {formatDate(account.createdAt)}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-text-muted shrink-0">
                <span>{account.counts.users} membros</span>
                <span>{account.counts.appointments} agendamentos</span>
              </div>
              <div className="shrink-0 text-xs">
                {account.subscription ? (
                  <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-medium">
                    {account.subscription.plan.name}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-hover-bg text-text-muted">Sem plano</span>
                )}
              </div>
              <ApprovalBadge status={account.approvalStatus} />
              <StatusBadge active={account.active} />
              <LuChevronRight size={16} className="text-text-muted shrink-0" />
            </button>
          ))
        )}
      </div>

      {meta && (
        <div className="flex items-center justify-between gap-3 text-sm text-text-muted">
          <span>
            {meta.total} resultado(s) · página {meta.page} de {Math.max(meta.totalPages, 1)}
          </span>
          <PaginationBar
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(next) => setParams({ page: next > 1 ? String(next) : null })}
          />
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
