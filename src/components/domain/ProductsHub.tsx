import React, { useCallback, useEffect, useState } from 'react';
import { productsApi, type Product, type ProductCategory, type RetailSale, type Supplier } from '../../infra/productsApi';
import { usePermissions } from '../../hooks/usePermissions';
import { getErrorMessage } from '../../utils/errorMessage';
import { RetailCheckoutBlock } from './RetailCheckoutBlock';
import type { RetailSalePayload } from '../../infra/productsApi';
import { useAuth } from '../../contexts/AuthContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import type { BusinessSegment } from '../../types';

const SEGMENTS: { value: BusinessSegment; label: string }[] = [
  { value: 'BARBERSHOP', label: 'Barbearia' },
  { value: 'HAIR_SALON', label: 'Salão de cabelo' },
  { value: 'BEAUTY_STUDIO', label: 'Studio de beleza' },
  { value: 'NAIL_STUDIO', label: 'Unhas' },
  { value: 'LASH_BROW_STUDIO', label: 'Cílios e sobrancelhas' },
  { value: 'AESTHETICS', label: 'Estética' },
  { value: 'SPA', label: 'Spa' },
  { value: 'OTHER', label: 'Outro' },
];

type HubTab = 'catalog' | 'stock' | 'sales';

export const ProductsHub: React.FC<{ onNotify?: (message: string, type?: 'success' | 'error') => void }> = ({ onNotify }) => {
  const { hasPermission, isOwnerOrAdmin } = usePermissions();
  const { user } = useAuth();
  const { settings } = useBarbershop();
  const barbershopId = user?.barbershopId;
  const canManage = isOwnerOrAdmin || hasPermission('PRODUCTS_MANAGE');
  const canInventory = isOwnerOrAdmin || hasPermission('INVENTORY_MANAGE');
  const canSell = isOwnerOrAdmin || hasPermission('RETAIL_SELL');
  const canRefund = isOwnerOrAdmin || hasPermission('RETAIL_REFUND');
  const canSeeCost = isOwnerOrAdmin || hasPermission('PRODUCTS_MANAGE') || hasPermission('INVENTORY_MANAGE') || hasPermission('FINANCE_VIEW');
  const sellOnly = canSell && !canManage && !canInventory;
  const [tab, setTab] = useState<HubTab>(sellOnly ? 'sales' : 'catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<RetailSale[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [walkin, setWalkin] = useState<(RetailSalePayload & { total: number }) | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, cats] = await Promise.all([
        productsApi.listProducts({ search, limit: 80 }),
        canManage || canSell ? productsApi.listCategories() : Promise.resolve([]),
      ]);
      setProducts(list);
      setCategories(cats);
      if (canInventory) setSuppliers(await productsApi.listSuppliers().catch(() => []));
      if (canSell) setSales(await productsApi.listSales().catch(() => []));
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar produtos.'));
    }
  }, [search, canManage, canSell, canInventory]);

  useEffect(() => { void load(); }, [load]);

  const lowStock = products.filter(p => p.trackStock && p.minStock > 0 && p.stockQty <= p.minStock);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {!sellOnly && <button type="button" onClick={() => setTab('catalog')} className={`rounded-xl px-3 py-2 text-sm font-bold ${tab === 'catalog' ? 'bg-accent text-accent-fg' : 'bg-surface border border-border text-text-secondary'}`}>Catálogo</button>}
        {canInventory && <button type="button" onClick={() => setTab('stock')} className={`rounded-xl px-3 py-2 text-sm font-bold ${tab === 'stock' ? 'bg-accent text-accent-fg' : 'bg-surface border border-border text-text-secondary'}`}>Estoque</button>}
        {canSell && <button type="button" onClick={() => setTab('sales')} className={`rounded-xl px-3 py-2 text-sm font-bold ${tab === 'sales' ? 'bg-accent text-accent-fg' : 'bg-surface border border-border text-text-secondary'}`}>Vendas</button>}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-text-primary">
          {lowStock.length} produto(s) abaixo do estoque mínimo. A operação continua liberada.
        </div>
      )}

      {tab === 'catalog' && canManage && (
        <div className="space-y-4">
          {barbershopId && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-bold text-text-primary">Modelo sugerido para {SEGMENTS.find(s => s.value === (settings?.businessSegment ?? 'OTHER'))?.label}</p>
              <p className="text-xs text-text-secondary mt-1">A instalação nunca sobrescreve cadastros existentes.</p>
              <button
                type="button"
                className="mt-3 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg"
                onClick={async () => {
                  try {
                    const result = await productsApi.installTemplate(barbershopId, { segment: settings?.businessSegment });
                    onNotify?.(result.alreadyInstalled ? 'Este modelo já foi instalado.' : 'Catálogo sugerido importado.', 'success');
                    await load();
                  } catch (err) {
                    onNotify?.(getErrorMessage(err, 'Não foi possível instalar o modelo.'), 'error');
                  }
                }}
              >
                Ver e importar sugestões
              </button>
            </div>
          )}
          <form
            className="grid gap-2 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_120px_auto]"
            onSubmit={async e => {
              e.preventDefault();
              try {
                await productsApi.createProduct({ name, salePrice: Number(price), type: 'RETAIL', trackStock: true, unitLabel: 'unidade' });
                setName(''); setPrice('0'); await load();
                onNotify?.('Produto cadastrado.', 'success');
              } catch (err) {
                onNotify?.(getErrorMessage(err, 'Não foi possível cadastrar.'), 'error');
              }
            }}
          >
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nome do produto" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary" />
            <input required type="number" min={0} step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary" />
            <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg">Adicionar</button>
          </form>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, SKU ou código" className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary" />
          <div className="space-y-2">
            {products.map(product => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-3">
                <div>
                  <p className="font-semibold text-text-primary">{product.name}</p>
                  <p className="text-xs text-text-muted">R$ {product.salePrice.toFixed(2)} · estoque {product.stockQty} {product.unitLabel}{canSeeCost && product.averageCost != null ? ` · custo médio R$ ${product.averageCost.toFixed(2)}` : ''}</p>
                </div>
                <button type="button" className="text-xs font-bold text-text-secondary" onClick={async () => { await productsApi.updateProduct(product.id, { active: !product.active }); await load(); }}>
                  {product.active ? 'Inativar' : 'Ativar'}
                </button>
              </div>
            ))}
          </div>
          {categories.length > 0 && <p className="text-xs text-text-muted">{categories.length} categorias no catálogo</p>}
        </div>
      )}

      {tab === 'stock' && canInventory && (
        <div className="space-y-4">
          <form
            className="space-y-2 rounded-xl border border-border bg-surface p-4"
            onSubmit={async e => {
              e.preventDefault();
              const form = e.currentTarget;
              const productId = (form.elements.namedItem('productId') as HTMLSelectElement).value;
              const quantity = Number((form.elements.namedItem('quantity') as HTMLInputElement).value);
              const unitCost = Number((form.elements.namedItem('unitCost') as HTMLInputElement).value);
              try {
                await productsApi.createReceipt({ items: [{ productId, quantity, unitCost }], createExpense: true });
                onNotify?.('Compra registrada e estoque atualizado.', 'success');
                await load();
                form.reset();
              } catch (err) {
                onNotify?.(getErrorMessage(err, 'Não foi possível registrar a compra.'), 'error');
              }
            }}
          >
            <p className="font-bold text-text-primary">Entrada de mercadoria</p>
            <select name="productId" className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary">
              {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input name="quantity" type="number" min={0.01} step="0.01" required placeholder="Qtd" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm" />
              <input name="unitCost" type="number" min={0} step="0.01" required placeholder="Custo unitário" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm" />
            </div>
            {suppliers.length > 0 && <p className="text-xs text-text-muted">{suppliers.length} fornecedor(es) cadastrados</p>}
            <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg">Confirmar compra</button>
          </form>
        </div>
      )}

      {tab === 'sales' && canSell && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <p className="font-bold text-text-primary">Venda avulsa</p>
            <RetailCheckoutBlock canOverridePrice={canManage} onChange={setWalkin} />
            <button
              type="button"
              disabled={!walkin}
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-fg disabled:opacity-50"
              onClick={async () => {
                if (!walkin) return;
                try {
                  await productsApi.createSale({ paymentMethod: walkin.paymentMethod, items: walkin.items });
                  onNotify?.('Venda concluída.', 'success');
                  setWalkin(null);
                  await load();
                } catch (err) {
                  onNotify?.(getErrorMessage(err, 'Não foi possível concluir a venda.'), 'error');
                }
              }}
            >
              Concluir venda {walkin ? `· R$ ${walkin.total.toFixed(2)}` : ''}
            </button>
          </div>
          <div className="space-y-2">
            {sales.map(sale => (
              <div key={sale.id} className="rounded-xl border border-border bg-surface px-3 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-text-primary">R$ {sale.total.toFixed(2)} · {sale.paymentMethod}</span>
                  <span className="text-text-muted">{sale.status}</span>
                </div>
                <p className="text-xs text-text-secondary">{sale.lines.map(line => `${line.quantity}× ${line.productName}`).join(', ')}</p>
                {canRefund && sale.status === 'COMPLETED' && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold text-danger"
                    onClick={async () => {
                      const reason = window.prompt('Motivo do estorno');
                      if (!reason) return;
                      try {
                        await productsApi.refundSale(sale.id, {
                          reason,
                          restock: true,
                          refundMethod: sale.paymentMethod === 'fiado' ? 'fiado_credit' : 'pix',
                          items: sale.lines.filter(line => line.quantity > line.refundedQty).map(line => ({ productId: line.productId, quantity: line.quantity - line.refundedQty })),
                        });
                        onNotify?.('Estorno registrado.', 'success');
                        await load();
                      } catch (err) {
                        onNotify?.(getErrorMessage(err, 'Não foi possível estornar.'), 'error');
                      }
                    }}
                  >
                    Estornar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
