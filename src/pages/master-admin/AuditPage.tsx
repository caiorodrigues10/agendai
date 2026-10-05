import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuSearch, LuLoader, LuTriangleAlert, LuShield, LuDownload, LuX } from 'react-icons/lu';
import {
  adminAuditApi,
  AuditFacets,
  AuditFilterValues,
  AuditLogsResponse,
  buildAuditFilterParams,
} from '../../infra/adminAuditApi';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { AuditAlertsPanel, AuditSessionsPanel } from './AuditAdvancedPanels';
import { AuditDetailModal } from './AuditDetailModal';

const PAGE_SIZE = 25;

const AuditLogList: React.FC<{
  logs: AuditLogsResponse['data'];
  shops: AuditFacets['shops'];
  onSelect: (log: AuditLogsResponse['data'][number]) => void;
}> = ({ logs, shops, onSelect }) => {
  if (logs.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-text-muted">Nenhum registro encontrado.</p>
    );
  }
  return (
    <>
      {logs.map((log) => (
        <div key={log.id} className="px-4 py-3 flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent font-medium">{log.action}</span>
              <span className="text-xs text-text-muted">em</span>
              <span className="text-xs font-medium">{log.resource}</span>
              {log.barbershopId && (
                <span className="rounded border border-border bg-bg px-1.5 py-0.5 text-[10px] font-bold text-text-secondary shrink-0">
                  {shops.find((shop) => shop.id === log.barbershopId)?.name ?? 'Salão'}
                </span>
              )}
              {log.resourceId && (
                <span className="text-xs text-text-muted font-mono truncate">{log.resourceId}</span>
              )}
            </div>
            {log.details && <p className="text-xs text-text-muted mt-0.5 truncate">{log.details}</p>}
          </div>
          <button
            type="button"
            onClick={() => onSelect(log)}
            className="text-xs font-bold text-accent hover:underline shrink-0"
          >
            Detalhes
          </button>
          <span className="text-[10px] text-text-muted shrink-0">
            {new Date(log.createdAt).toLocaleString('pt-BR')}
          </span>
        </div>
      ))}
    </>
  );
};

const FilterField: React.FC<{
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}> = ({ label, name, type = 'text', placeholder, defaultValue }) => (
  <label className="flex flex-col gap-1 text-xs font-medium text-text-muted min-w-0">
    {label}
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
    />
  </label>
);

const SelectField: React.FC<{
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}> = ({ label, name, options, defaultValue }) => (
  <label className="flex flex-col gap-1 text-xs font-medium text-text-muted min-w-0">
    {label}
    <select
      name={name}
      defaultValue={defaultValue}
      className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
    >
      <option value="">Todos</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const AuditFilters: React.FC<{
  signature: string;
  values: AuditFilterValues;
  facets: { users: AuditFacets['users']; shops: AuditFacets['shops'] };
  hasFilters: boolean;
  onApply: (values: AuditFilterValues) => void;
  onClear: () => void;
}> = ({ signature, values, facets, hasFilters, onApply, onClear }) => (
  <form
    key={signature}
    onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const read = (field: string) => {
        const value = data.get(field);
        return typeof value === 'string' ? value.trim() : '';
      };
      onApply({
        q: read('q'),
        action: read('action'),
        resource: read('resource'),
        userId: read('userId'),
        shopId: read('shopId'),
        from: read('from'),
        to: read('to'),
      });
    }}
    className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end"
  >
    <div className="col-span-2 md:col-span-2">
      <FilterField
        label="Busca"
        name="q"
        placeholder="Ação, recurso ou detalhes"
        defaultValue={values.q}
      />
    </div>
    <FilterField label="Ação" name="action" placeholder="ex.: PATCH" defaultValue={values.action} />
    <FilterField
      label="Recurso"
      name="resource"
      placeholder="ex.: products"
      defaultValue={values.resource}
    />
    <SelectField
      label="Usuário"
      name="userId"
      defaultValue={values.userId}
      options={facets.users.map((user) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
      }))}
    />
    <SelectField
      label="Salão"
      name="shopId"
      defaultValue={values.shopId}
      options={facets.shops.map((shop) => ({ value: shop.id, label: shop.name }))}
    />
    <FilterField label="De" name="from" type="date" defaultValue={values.from} />
    <FilterField label="Até" name="to" type="date" defaultValue={values.to} />
    <div className="col-span-2 md:col-span-4 flex gap-2 justify-end">
      <button
        type="submit"
        className="px-3 py-1.5 text-xs font-bold flex items-center gap-1 border border-border rounded-lg hover:bg-surface transition-colors"
      >
        <LuSearch size={14} /> Filtrar
      </button>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-1.5 text-xs font-bold flex items-center gap-1 border border-border rounded-lg hover:bg-surface transition-colors"
        >
          <LuX size={14} /> Limpar filtros
        </button>
      )}
    </div>
  </form>
);

const AuditHeader: React.FC<{
  meta: AuditLogsResponse['meta'] | undefined;
  exporting: boolean;
  exportError: string | null;
  onExport: () => void;
}> = ({ meta, exporting, exportError, onExport }) => (
  <>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <LuShield size={20} /> Auditoria
        </h1>
        {meta && (
          <p className="text-sm text-text-muted">
            {meta.total} registro(s) · página {meta.page} de {Math.max(meta.totalPages, 1)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onExport}
        disabled={exporting || meta?.total === 0}
        className="px-3 py-1.5 text-xs font-bold flex items-center gap-1 border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LuDownload size={14} /> {exporting ? 'Exportando...' : 'Exportar CSV'}
      </button>
    </div>
    {exportError && (
      <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
        <LuTriangleAlert size={16} />
        {exportError}
      </div>
    )}
  </>
);

const AuditBody: React.FC<{
  loading: boolean;
  error: string | null;
  response: AuditLogsResponse | null;
  shops: AuditFacets['shops'];
  page: number;
  onRetry: () => void;
  onPageChange: (next: number) => void;
  onSelect: (log: AuditLogsResponse['data'][number]) => void;
}> = ({ loading, error, response, shops, page, onRetry, onPageChange, onSelect }) => {
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
        <LuTriangleAlert className="mx-auto mb-3 text-warning" size={24} />
        <p className="text-sm text-text-secondary mb-3">{error}</p>
        <button onClick={onRetry} className="text-accent text-sm hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  const meta = response?.meta;

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          <LuTriangleAlert size={16} />
          {error}
        </div>
      )}
      <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border/50">
        <AuditLogList logs={response?.data ?? []} shops={shops} onSelect={onSelect} />
      </div>
      <PaginationBar
        page={page}
        totalPages={meta?.totalPages ?? 0}
        onPageChange={onPageChange}
      />
    </>
  );
};

const readFilters = (params: URLSearchParams): AuditFilterValues => ({
  q: params.get('q') ?? '',
  action: params.get('action') ?? '',
  resource: params.get('resource') ?? '',
  userId: params.get('userId') ?? '',
  shopId: params.get('shopId') ?? '',
  from: params.get('from') ?? '',
  to: params.get('to') ?? '',
});

export const AuditPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [response, setResponse] = useState<AuditLogsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [facets, setFacets] = useState<AuditFacets>({ resources: [], users: [], shops: [] });
  const [selectedLog, setSelectedLog] = useState<AuditLogsResponse['data'][number] | null>(
    null,
  );

  const { q, action, resource, userId, shopId, from, to } = readFilters(searchParams);
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1;

  const setParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let active = true;
    adminAuditApi
      .getAuditFacets()
      .then((res) => {
        if (active) setFacets(res.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    adminAuditApi
      .getAuditLogs({
        page,
        limit: PAGE_SIZE,
        ...buildAuditFilterParams({ q, action, resource, userId, shopId, from, to }),
      })
      .then((res) => {
        if (!active) return;
        setResponse(res);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Não foi possível carregar os logs de auditoria.');
      });
    return () => {
      active = false;
    };
  }, [q, action, resource, userId, shopId, from, to, page, reloadKey]);

  const loading = !response && !error;

  const handleExport = () => {
    setExporting(true);
    setExportError(null);
    adminAuditApi
      .exportAuditLogsCsv(
        buildAuditFilterParams({ q, action, resource, userId, shopId, from, to }),
      )
      .then(async (res) => {
        if (!res.ok) throw new Error('Falha no export');
        const blob = new Blob([await res.blob()], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => setExportError('Não foi possível exportar os registros.'))
      .finally(() => setExporting(false));
  };

  const hasFilters = Object.values({ q, action, resource, userId, shopId, from, to }).some(
    Boolean,
  );
  const meta = response?.meta;

  return (
    <div className="space-y-4">
      <AuditHeader
        meta={meta}
        exporting={exporting}
        exportError={exportError}
        onExport={handleExport}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <AuditAlertsPanel />
        <AuditSessionsPanel />
      </div>

      <AuditFilters
        signature={`${q}|${action}|${resource}|${userId}|${shopId}|${from}|${to}`}
        values={{ q, action, resource, userId, shopId, from, to }}
        facets={{ users: facets.users, shops: facets.shops }}
        hasFilters={hasFilters}
        onApply={(values) => setParams({ ...values, page: '' })}
        onClear={() => setSearchParams(new URLSearchParams(), { replace: true })}
      />

      <AuditBody
        loading={loading}
        error={error}
        response={response}
        shops={facets.shops}
        page={page}
        onRetry={() => setReloadKey((key) => key + 1)}
        onPageChange={(next) => setParams({ page: String(next) })}
        onSelect={setSelectedLog}
      />

      <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default AuditPage;
