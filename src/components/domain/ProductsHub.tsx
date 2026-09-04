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
  const [refreshKey, setRefreshKey] = useState(0);

  const probe = useCallback(async () => {
    try {
      setError(null);
      const result = await productsApi.listProducts({ lowStock: 'true', limit: 1, page: 1 });
      setLowStockCount(result.meta.total);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar produtos.'));
      setLowStockCount(0);
    }
  }, []);

  useEffect(() => { void probe(); }, [probe, refreshKey]);

  const reload = () => setRefreshKey(k => k + 1);

  const tabBtn = (id: HubTab, label: string, visible: boolean) => visible ? (
    <button type="button" onClick={() => setTab(id)} className={`rounded-xl px-3 py-2 text-sm font-bold ${tab === id ? 'bg-accent text-accent-fg' : 'bg-surface border border-border text-text-secondary'}`}>{label}</button>
  ) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabBtn('catalog', 'Catálogo', canView || canManage)}
        {tabBtn('stock', 'Estoque', canInventory)}
        {tabBtn('sales', 'Vendas', canSell)}
        {tabBtn('reports', 'Relatórios', canReports)}
      </div>

      {lowStockCount > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-text-primary">
          {lowStockCount} produto(s) abaixo do estoque mínimo. A operação continua liberada.
        </div>
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
        <ProductReportsPanel loadError={error} onNotify={onNotify} />
      )}
    </div>
  );
};
