import React, { useCallback, useEffect, useState } from 'react';
import { productsApi, type ProductReports } from '../../../infra/productsApi';
import { getErrorMessage } from '../../../utils/errorMessage';
import { productMoney } from './productMoney';

const initialPeriod = () => ({
  from: new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
});

interface Props {
  loadError: string | null;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const ProductReportsPanel: React.FC<Props> = ({ loadError, onNotify }) => {
  const [period, setPeriod] = useState(initialPeriod);
  const [reports, setReports] = useState<ProductReports | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.reports(period.from, period.to);
      setReports(data);
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível carregar relatórios.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [period.from, period.to, onNotify]);

  useEffect(() => { void load(); }, [load]);

  if (loadError) return <p className="text-sm text-danger">{loadError}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-text-muted">
          De
          <input type="date" value={period.from} max={period.to} onChange={e => setPeriod(p => ({ ...p, from: e.target.value }))} className="mt-1 block min-h-10 rounded-lg border border-border bg-bg px-2 text-text-primary" />
        </label>
        <label className="text-xs text-text-muted">
          Até
          <input type="date" value={period.to} min={period.from} onChange={e => setPeriod(p => ({ ...p, to: e.target.value }))} className="mt-1 block min-h-10 rounded-lg border border-border bg-bg px-2 text-text-primary" />
        </label>
        <button type="button" onClick={() => void load()} className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-text-secondary">Atualizar</button>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Carregando…</p>
      ) : reports ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-xs text-text-muted">Valor em estoque</p>
              <p className="font-bold text-text-primary">{productMoney.format(reports.inventoryValue)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-xs text-text-muted">Abaixo do mínimo</p>
              <p className="font-bold text-text-primary">{reports.lowStock.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-xs text-text-muted">Ociosos</p>
              <p className="font-bold text-text-primary">{reports.idleProducts.length}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold text-text-primary">Por produto</p>
            <div className="space-y-2 text-sm">
              {reports.byProduct.map(row => (
                <div key={row.productId} className="flex justify-between gap-2 border-b border-border pb-2">
                  <span className="text-text-primary">{row.name}</span>
                  <span className="text-text-muted">{row.quantity} un · {productMoney.format(row.revenue)} · margem {productMoney.format(row.margin)}</span>
                </div>
              ))}
              {!reports.byProduct.length && <p className="text-text-muted">Sem vendas no período.</p>}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold text-text-primary">Por profissional</p>
            <div className="space-y-2 text-sm">
              {reports.byStaff.map(row => (
                <div key={row.soldById} className="flex justify-between gap-2">
                  <span className="text-text-primary">{row.soldByName}</span>
                  <span className="text-text-muted">{row.count} vendas · {productMoney.format(row.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
