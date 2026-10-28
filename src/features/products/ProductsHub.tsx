import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, Tabs } from '../../components/patterns';
import { usePermissions } from '../../hooks/usePermissions';
import { productsApi } from '../../infra/productsApi';
import { addDaysISO, todayISO } from '../../utils/dateRanges';
import { getErrorMessage } from '../../utils/errorMessage';
import { ProductCatalogPanel } from './ProductCatalogPanel';
import { ProductReportsPanel } from './ProductReportsPanel';
import { ProductReservationsPanel } from './ProductReservationsPanel';
import { ProductSalesPanel } from './ProductSalesPanel';
import { ProductStockPanel } from './ProductStockPanel';

type HubTab = 'catalog' | 'stock' | 'sales' | 'reports' | 'reservations';

export const ProductsHub: React.FC<{
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}> = ({ onNotify }) => {
  const { hasPermission, isOwnerOrAdmin } = usePermissions();
  const canManage = isOwnerOrAdmin || hasPermission('PRODUCTS_MANAGE');
  const canView = isOwnerOrAdmin || hasPermission('PRODUCTS_VIEW');
  const canInventory = isOwnerOrAdmin || hasPermission('INVENTORY_MANAGE');
  const canSell = isOwnerOrAdmin || hasPermission('RETAIL_SELL');
  const canRefund = isOwnerOrAdmin || hasPermission('RETAIL_REFUND');
  const canReports = isOwnerOrAdmin || hasPermission('PRODUCT_REPORTS_VIEW');
  const canSeeCost =
    isOwnerOrAdmin ||
    hasPermission('PRODUCTS_MANAGE') ||
    hasPermission('INVENTORY_MANAGE') ||
    hasPermission('FINANCE_VIEW');
  const sellOnly = canSell && !canManage && !canInventory && !canView && !canReports;

  const defaultTab: HubTab = sellOnly
    ? 'sales'
    : canView || canManage
      ? 'catalog'
      : canInventory
        ? 'stock'
        : canSell
          ? 'sales'
          : 'reports';
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
      const result = await productsApi.listProducts({
        active: 'true',
        lowStock: 'true',
        limit: 1,
        page: 1,
      });
      setLowStockCount(result.meta.total);
      if (canReports) {
        const from = addDaysISO(-29);
        const to = todayISO();
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

  useEffect(() => {
    void probe();
  }, [probe, refreshKey]);

  const reload = () => setRefreshKey(k => k + 1);

  const tabs: { id: HubTab; label: string }[] = [
    ...(canView || canManage
      ? [
          { id: 'catalog' as const, label: 'Catálogo' },
          { id: 'reservations' as const, label: 'Reservas' },
        ]
      : []),
    ...(canInventory ? [{ id: 'stock' as const, label: 'Estoque' }] : []),
    ...(canSell ? [{ id: 'sales' as const, label: 'Vendas' }] : []),
    ...(canReports ? [{ id: 'reports' as const, label: 'Relatórios' }] : []),
  ];
  const activeTab = tabs.some(item => item.id === tab) ? tab : defaultTab;

  const bannerParts: string[] = [];
  if (lowStockCount > 0) bannerParts.push(`${lowStockCount} abaixo do mínimo`);
  if (expiredCount > 0) bannerParts.push(`${expiredCount} vencido(s)`);
  if (expiringCount > 0) bannerParts.push(`${expiringCount} vencendo em breve`);
  if (needsReorderCount > 0)
    bannerParts.push(`${needsReorderCount} vendendo bem e precisando repor`);

  return (
    <div className="space-y-4">
      <PageHeader title="Produtos" description="Catálogo, reservas e movimentações do salão." />
      <Tabs<HubTab> ariaLabel="Áreas de produtos" items={tabs} value={activeTab} onChange={setTab}>
        <div className="space-y-4">
          {bannerParts.length > 0 && (
            <button
              type="button"
              disabled={!canReports && !canInventory}
              onClick={() =>
                canReports ? setTab('reports') : canInventory ? setTab('stock') : undefined
              }
              className="w-full rounded-xl border border-warning/40 bg-warning/10 p-3 text-left text-sm text-text-primary"
            >
              {bannerParts.join(' · ')}. A operação continua liberada.
              {canReports ? ' Ver atenção nos relatórios.' : ''}
            </button>
          )}

          {activeTab === 'catalog' && (canView || canManage) && (
            <ProductCatalogPanel
              canManage={canManage}
              canView={canView}
              canSeeCost={canSeeCost}
              loadError={error}
              onNotify={onNotify}
              onReload={reload}
              onGoReservations={() => setTab('reservations')}
            />
          )}
          {activeTab === 'stock' && canInventory && (
            <ProductStockPanel loadError={error} onNotify={onNotify} onReload={reload} />
          )}
          {activeTab === 'reservations' && (canView || canManage) && (
            <ProductReservationsPanel loadError={error} onNotify={onNotify} onReload={reload} />
          )}
          {activeTab === 'sales' && canSell && (
            <ProductSalesPanel
              canManage={canManage}
              canRefund={canRefund}
              loadError={error}
              onNotify={onNotify}
              onReload={reload}
            />
          )}
          {activeTab === 'reports' && canReports && (
            <ProductReportsPanel
              loadError={error}
              onNotify={onNotify}
              onGoStock={canInventory ? () => setTab('stock') : undefined}
            />
          )}
        </div>
      </Tabs>
    </div>
  );
};
