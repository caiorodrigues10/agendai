import React, { useCallback, useEffect, useState } from 'react';
import { productsApi } from '../../infra/productsApi';
import { usePermissions } from '../../hooks/usePermissions';
import { getErrorMessage } from '../../utils/errorMessage';
import { ProductCatalogPanel } from './products/ProductCatalogPanel';
import { ProductStockPanel } from './products/ProductStockPanel';
import { ProductSalesPanel } from './products/ProductSalesPanel';
import { ProductReportsPanel } from './products/ProductReportsPanel';

type HubTab = 'catalog' | 'stock' | 'sales' | 'reports';

export const ProductsHub: React.FC<{ onNotify?: (message: string, type?: 'success' | 'error') => void }> = ({ onNotify }) => {
  const { hasPermission, isOwnerOrAdmin } = usePermissions();
  const canManage = isOwnerOrAdmin || hasPermission('PRODUCTS_MANAGE');
  const canView = isOwnerOrAdmin || hasPermission('PRODUCTS_VIEW');
  const canInventory = isOwnerOrAdmin || hasPermission('INVENTORY_MANAGE');
  const canSell = isOwnerOrAdmin || hasPermission('RETAIL_SELL');
  const canRefund = isOwnerOrAdmin || hasPermission('RETAIL_REFUND');
  const canReports = isOwnerOrAdmin || hasPermission('PRODUCT_REPORTS_VIEW');
  const canSeeCost = isOwnerOrAdmin || hasPermission('PRODUCTS_MANAGE') || hasPermission('INVENTORY_MANAGE') || hasPermission('FINANCE_VIEW');
  const sellOnly = canSell && !canManage && !canInventory && !canView && !canReports;

  const defaultTab: HubTab = sellOnly ? 'sales' : canView || canManage ? 'catalog' : canInventory ? 'stock' : canSell ? 'sales' : 'reports';
  const [tab, setTab] = useState<HubTab>(defaultTab);
  const [error, setError] = useState<string | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [needsReorderCount, setNeedsReorderCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const probe = useCallback(async () => {
    try {
      setError(null);
      const result = await productsApi.listProducts({ active: 'true', lowStock: 'true', limit: 1, page: 1 });
      setLowStockCount(result.meta.total);
      if (canReports) {
        const from = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);
        const to = new Date().toISOString().slice(0, 10);
        const reports = await productsApi.reports(from, to);
        setNeedsReorderCount(reports.attention?.needsReorder.length ?? 0);
      } else {
        setNeedsReorderCount(0);
      }
      const alerts = await productsApi.stockAlerts();
      setExpiredCount(alerts.expired.count);
      setExpiringCount(alerts.expiringSoon.count);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar produtos.'));
      setLowStockCount(0);
      setNeedsReorderCount(0);
      setExpiredCount(0);
      setExpiringCount(0);
    }
  }, [canReports]);

  useEffect(() => { void probe(); }, [probe, refreshKey]);

  const reload = () => setRefreshKey(k => k + 1);

  const tabBtn = (id: HubTab, label: string, visible: boolean) => visible ? (
    <button type="button" onClick={() => setTab(id)} className={`rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${tab === id ? 'border-accent/30 bg-selection text-accent' : 'border-border bg-surface text-text-secondary hover:bg-surface-2'}`}>{label}</button>
  ) : null;

  const bannerParts: string[] = [];
  if (lowStockCount > 0) bannerParts.push(`${lowStockCount} abaixo do mínimo`);
  if (expiredCount > 0) bannerParts.push(`${expiredCount} vencido(s)`);
  if (expiringCount > 0) bannerParts.push(`${expiringCount} vencendo em breve`);
  if (needsReorderCount > 0) bannerParts.push(`${needsReorderCount} vendendo bem e precisando repor`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabBtn('catalog', 'Catálogo', canView || canManage)}
        {tabBtn('stock', 'Estoque', canInventory)}
        {tabBtn('sales', 'Vendas', canSell)}
        {tabBtn('reports', 'Relatórios', canReports)}
      </div>

      {bannerParts.length > 0 && (
        <button
          type="button"
          onClick={() => canReports ? setTab('reports') : canInventory ? setTab('stock') : undefined}
          className="w-full rounded-xl border border-warning/40 bg-warning/10 p-3 text-left text-sm text-text-primary"
        >
          {bannerParts.join(' · ')}. A operação continua liberada.
          {canReports ? ' Ver atenção nos relatórios.' : ''}
        </button>
      )}

      {tab === 'catalog' && (canView || canManage) && (
        <ProductCatalogPanel canManage={canManage} canView={canView} canSeeCost={canSeeCost} loadError={error} onNotify={onNotify} onReload={reload} />
      )}
      {tab === 'stock' && canInventory && (
        <ProductStockPanel loadError={error} onNotify={onNotify} onReload={reload} />
      )}
      {tab === 'sales' && canSell && (
        <ProductSalesPanel canManage={canManage} canRefund={canRefund} loadError={error} onNotify={onNotify} onReload={reload} />
      )}
      {tab === 'reports' && canReports && (
        <ProductReportsPanel
          loadError={error}
          onNotify={onNotify}
          onGoStock={canInventory ? () => setTab('stock') : undefined}
        />
      )}
    </div>
  );
};
