import React, { useCallback, useEffect, useState } from 'react';
import { productsApi, type ProductAttentionItem, type ProductReports } from '../../../infra/productsApi';
import { getErrorMessage } from '../../../utils/errorMessage';
import { addDaysISO, todayISO } from '../../../utils/dateRanges';
import { PRODUCT_PURPOSE_SHORT, productMoney } from './productMoney';

const initialPeriod = () => ({
  from: addDaysISO(-29),
  to: todayISO(),
});

interface Props {
  loadError: string | null;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onGoStock?: () => void;
}

type AttentionKey = 'missing' | 'hot' | 'needsReorder' | 'idle';

const BANDS: { key: AttentionKey; title: string; hint: string; empty: string }[] = [
  { key: 'missing', title: 'Faltando', hint: 'Abaixo do estoque mínimo', empty: 'Nenhum produto abaixo do mínimo.' },
  { key: 'hot', title: 'Bombando', hint: 'Mais vendidos no período', empty: 'Sem vendas no período.' },
  { key: 'needsReorder', title: 'Atenção: repor', hint: 'Vende bem e o estoque está curto', empty: 'Nada urgente para repor.' },
  { key: 'idle', title: 'Parados', hint: 'Com estoque e sem venda no período', empty: 'Nenhum produto parado.' },
];

const purposeLabel = (purpose: ProductAttentionItem['purpose']) => {
  if (purpose === 'sale') return PRODUCT_PURPOSE_SHORT.RETAIL;
  if (purpose === 'own') return PRODUCT_PURPOSE_SHORT.CONSUMABLE;
  return PRODUCT_PURPOSE_SHORT.BOTH;
};

export const ProductReportsPanel: React.FC<Props> = ({ loadError, onNotify, onGoStock }) => {
  const [period, setPeriod] = useState(initialPeriod);
  const [reports, setReports] = useState<ProductReports | null>(null);
  const [loading, setLoading] = useState(false);
  const [openBand, setOpenBand] = useState<AttentionKey | null>('needsReorder');

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

  const attention = reports?.attention ?? {
    missing: (reports?.lowStock ?? []).map(p => ({
      productId: p.id,
      name: p.name,
      stockQty: p.stockQty,
      minStock: p.minStock,
      purpose: p.type === 'CONSUMABLE' ? 'own' as const : p.type === 'BOTH' ? 'both' as const : 'sale' as const,
    })),
    hot: (reports?.byProduct ?? []).slice(0, 5).map(row => ({
      productId: row.productId,
      name: row.name,
      stockQty: 0,
      quantity: row.quantity,
      revenue: row.revenue,
      margin: row.margin,
      purpose: 'sale' as const,
    })),
    needsReorder: [],
    idle: (reports?.idleProducts ?? []).map(p => ({
      productId: p.id,
      name: p.name,
      stockQty: p.stockQty,
      purpose: 'sale' as const,
    })),
  };

  const renderItem = (item: ProductAttentionItem) => (
    <div key={item.productId} className="flex justify-between gap-2 border-b border-border pb-2 text-sm last:border-0">
      <div>
        <p className="font-medium text-text-primary">{item.name}</p>
        <p className="text-xs text-text-muted">
          {purposeLabel(item.purpose)}
          {' · estoque '}
          {item.stockQty}
          {item.minStock != null && item.minStock > 0 ? ` · mín ${item.minStock}` : ''}
          {item.daysOfCover != null ? ` · ~${item.daysOfCover} dias de cobertura` : ''}
        </p>
      </div>
      <div className="shrink-0 text-right text-text-muted">
        {item.quantity != null ? <p>{item.quantity} un</p> : null}
        {item.revenue != null ? <p>{productMoney.format(item.revenue)}</p> : null}
      </div>
    </div>
  );

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BANDS.map(band => (
              <button
                key={band.key}
                type="button"
                onClick={() => setOpenBand(openBand === band.key ? null : band.key)}
                className={`rounded-xl border p-3 text-left ${openBand === band.key ? 'border-accent bg-accent/10' : 'border-border bg-surface'}`}
              >
                <p className="text-xs text-text-muted">{band.title}</p>
                <p className="font-bold text-text-primary">{attention[band.key].length}</p>
                <p className="mt-1 text-[11px] text-text-secondary">{band.hint}</p>
              </button>
            ))}
          </div>

          {openBand && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-text-primary">{BANDS.find(b => b.key === openBand)?.title}</p>
                  <p className="text-xs text-text-muted">{BANDS.find(b => b.key === openBand)?.hint}</p>
                </div>
                {(openBand === 'missing' || openBand === 'needsReorder') && onGoStock && (
                  <button type="button" onClick={onGoStock} className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-text-secondary">
                    Registrar compra
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {attention[openBand].map(renderItem)}
                {!attention[openBand].length && (
                  <p className="text-sm text-text-muted">{BANDS.find(b => b.key === openBand)?.empty}</p>
                )}
              </div>
            </div>
          )}

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
