import React, { useCallback, useEffect, useState } from 'react';
import { WhatsAppTabs } from './WhatsAppTabs';
import {
  adminWhatsappApi,
  type OwnerBotActionLog,
  type WhatsAppShop,
} from '../../infra/adminWhatsappApi';
import { DataTableState } from '../../components/patterns/states/DataTableState';
import { PaginationBar } from '../../components/ui/PaginationBar';

const RISK_OPTIONS = [
  { value: 'READ', label: 'Leitura' },
  { value: 'WRITE', label: 'Escrita' },
  { value: 'SENSITIVE', label: 'Sensível' },
];

const STATUS_OPTIONS = [
  { value: 'SUCCESS', label: 'Sucesso' },
  { value: 'ERROR', label: 'Erro' },
  { value: 'NEEDS_CONFIRMATION', label: 'Aguardando confirmação' },
  { value: 'BLOCKED', label: 'Bloqueada' },
];

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Não foi possível carregar os logs.';
}

export const WhatsAppOwnerLogsPage: React.FC = () => {
  const [items, setItems] = useState<OwnerBotActionLog[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [shops, setShops] = useState<WhatsAppShop[]>([]);
  const [page, setPage] = useState(1);
  const [barbershopId, setBarbershopId] = useState('');
  const [riskClass, setRiskClass] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminWhatsappApi.ownerBotActionLogs({
        page: targetPage,
        limit: 20,
        barbershopId: barbershopId || undefined,
        riskClass: riskClass || undefined,
        status: status || undefined,
      });
      setItems(res.data);
      setMeta(res.meta);
      setPage(res.meta.page);
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [barbershopId, riskClass, status]);

  useEffect(() => { load(1); }, [load]);

  useEffect(() => {
    let active = true;
    adminWhatsappApi
      .shops({ limit: 50 })
      .then((res) => { if (active) setShops(res.data); })
      .catch(() => { if (active) setShops([]); });
    return () => { active = false; };
  }, []);

  const showTable = !loading && !loadError && items.length > 0;

  return (
    <div className="p-6 space-y-4">
      <WhatsAppTabs />
      <h1 className="text-xl font-bold">WhatsApp — Logs do assistente</h1>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm" htmlFor="whatsapp-logs-shop">Salão</label>
        <select
          id="whatsapp-logs-shop"
          className="rounded-lg border border-border bg-bg px-2 py-1 text-sm"
          value={barbershopId}
          onChange={(e) => { setBarbershopId(e.target.value); setPage(1); }}
        >
          <option value="">Todos</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>

        <label className="text-sm" htmlFor="whatsapp-logs-risk">Risco</label>
        <select
          id="whatsapp-logs-risk"
          className="rounded-lg border border-border bg-bg px-2 py-1 text-sm"
          value={riskClass}
          onChange={(e) => { setRiskClass(e.target.value); setPage(1); }}
        >
          <option value="">Todos</option>
          {RISK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <label className="text-sm" htmlFor="whatsapp-logs-status">Status</label>
        <select
          id="whatsapp-logs-status"
          className="rounded-lg border border-border bg-bg px-2 py-1 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">Todos</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1 text-sm"
          onClick={() => load(1)}
        >
          Filtrar
        </button>
      </div>

      <DataTableState
        loading={loading}
        error={loadError}
        onRetry={() => load(page)}
        isEmpty={!loading && !loadError && items.length === 0}
        emptyTitle="Nenhum log encontrado"
        emptyDescription="Ajuste os filtros para ver outros registros."
        skeletonProps={{ rows: 5, cols: 4 }}
      />

      {showTable && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border">
              <th className="p-2">Salão</th>
              <th className="p-2">Ação</th>
              <th className="p-2">Status</th>
              <th className="p-2">Risco</th>
              <th className="p-2">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => (
              <tr key={log.id} className="border-b border-border">
                <td className="p-2">{log.barbershopName ?? log.barbershopId}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2">{log.status}</td>
                <td className="p-2">{log.riskClass ?? '—'}</td>
                <td className="p-2">{log.phoneMasked ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <PaginationBar page={meta.page} totalPages={meta.totalPages} onPageChange={(next) => load(next)} />
    </div>
  );
};
export default WhatsAppOwnerLogsPage;
