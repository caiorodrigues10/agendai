import React, { useCallback, useEffect, useState } from 'react';
import { productsApi, type Product, type ProductCategory } from '../../../infra/productsApi';
import { useBarbershop } from '../../../contexts/BarbershopContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { BusinessSegment } from '../../../types';
import { getErrorMessage } from '../../../utils/errorMessage';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { ProductFormModal } from './ProductFormModal';
import { CatalogTemplateModal } from './CatalogTemplateModal';
import { productMoney } from './productMoney';

const SEGMENTS: Record<BusinessSegment, string> = {
  BARBERSHOP: 'Barbearia',
  HAIR_SALON: 'Salão de cabelo',
  BEAUTY_STUDIO: 'Studio de beleza',
  NAIL_STUDIO: 'Unhas',
  LASH_BROW_STUDIO: 'Cílios e sobrancelhas',
  AESTHETICS: 'Estética',
  SPA: 'Spa',
  OTHER: 'Outro',
};

interface Props {
  canManage: boolean;
  canView: boolean;
  canSeeCost: boolean;
  loadError: string | null;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onReload: () => void;
}

export const ProductCatalogPanel: React.FC<Props> = ({ canManage, canView, canSeeCost, loadError, onNotify, onReload }) => {
  const { user } = useAuth();
  const { settings } = useBarbershop();
  const barbershopId = user?.barbershopId;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null | 'new'>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<Product | null>(null);
  const limit = 30;

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    if (!canView && !canManage) return;
    setLoading(true);
    try {
      const [list, cats] = await Promise.all([
        productsApi.listProducts({ search: searchDebounced || undefined, page, limit }),
        productsApi.listCategories(),
      ]);
      setProducts(list.data);
      setTotal(list.meta.total);
      setCategories(cats);
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível carregar produtos.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [canView, canManage, searchDebounced, page, onNotify]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [searchDebounced]);

  if (!canView && !canManage) {
    return <p className="text-sm text-text-muted">Você não tem permissão para ver o catálogo.</p>;
  }

  if (loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  const openProduct = (product: Product, viewOnly = false) => {
    setModalProduct(product);
    setReadOnly(viewOnly || !canManage);
  };

  const toggleActive = async () => {
    if (!confirmToggle) return;
    try {
      await productsApi.updateProduct(confirmToggle.id, { active: !confirmToggle.active });
      onNotify?.(confirmToggle.active ? 'Produto inativado.' : 'Produto reativado.', 'success');
      setConfirmToggle(null);
      await load();
      onReload();
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível atualizar o produto.'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      {canManage && barbershopId && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-bold text-text-primary">
            Modelo sugerido para {SEGMENTS[settings?.businessSegment ?? 'OTHER']}
          </p>
          <p className="mt-1 text-xs text-text-secondary">A instalação nunca sobrescreve cadastros existentes.</p>
          <button type="button" onClick={() => setTemplateOpen(true)} className="mt-3 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg">
            Ver sugestões
          </button>
        </div>
      )}

      {canManage && (
        <button type="button" onClick={() => { setModalProduct('new'); setReadOnly(false); }} className="w-full rounded-xl border border-dashed border-border bg-bg px-4 py-3 text-sm font-bold text-text-primary">
          + Novo produto
        </button>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, SKU ou código" className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary" />

      {loading ? (
        <p className="text-sm text-text-muted">Carregando…</p>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <div key={product.id} className="rounded-xl border border-border bg-surface px-3 py-3">
              <button type="button" onClick={() => openProduct(product, !canManage)} className="w-full text-left">
                <p className="font-semibold text-text-primary">{product.name}</p>
                <p className="text-xs text-text-muted">
                  {productMoney.format(product.salePrice)} · estoque {product.stockQty} {product.unitLabel}
                  {product.minStock > 0 ? ` · mín ${product.minStock}` : ''}
                  {product.sku ? ` · SKU ${product.sku}` : ''}
                  {canSeeCost && product.averageCost != null ? ` · custo ${productMoney.format(product.averageCost)}` : ''}
                </p>
                {product.category?.name && <p className="text-xs text-text-secondary">{product.category.name}</p>}
              </button>
              {canManage && (
                <button type="button" className="mt-2 text-xs font-bold text-text-secondary" onClick={() => setConfirmToggle(product)}>
                  {product.active ? 'Inativar' : 'Ativar'}
                </button>
              )}
            </div>
          ))}
          {!products.length && <p className="text-sm text-text-muted">Nenhum produto encontrado.</p>}
        </div>
      )}

      {total > page * limit && (
        <button type="button" onClick={() => setPage(p => p + 1)} className="w-full rounded-xl border border-border py-2 text-sm font-bold text-text-secondary">
          Carregar mais ({products.length} de {total})
        </button>
      )}

      <ProductFormModal
        open={modalProduct !== null}
        product={modalProduct === 'new' || modalProduct === null ? null : modalProduct}
        readOnly={readOnly}
        categories={categories}
        onClose={() => setModalProduct(null)}
        onSaved={() => { void load(); onReload(); }}
        onNotify={onNotify}
        onCategoriesChange={setCategories}
      />

      <CatalogTemplateModal
        open={templateOpen}
        barbershopId={barbershopId ?? ''}
        segment={settings?.businessSegment}
        onClose={() => setTemplateOpen(false)}
        onInstalled={() => { void load(); onReload(); }}
        onNotify={onNotify}
      />

      <ConfirmDialog
        open={Boolean(confirmToggle)}
        title={confirmToggle?.active ? 'Inativar produto?' : 'Reativar produto?'}
        message={confirmToggle ? `"${confirmToggle.name}" deixará de aparecer nas vendas.` : ''}
        confirmLabel={confirmToggle?.active ? 'Inativar' : 'Ativar'}
        variant={confirmToggle?.active ? 'danger' : 'default'}
        onConfirm={() => void toggleActive()}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
};
