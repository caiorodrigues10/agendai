import React, { useCallback, useEffect, useState } from 'react';
import { productsApi, type Product, type ProductCategory, type ProductListPurpose, type ProductType } from '../../infra/productsApi';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { useAuth } from '../../contexts/AuthContext';
import type { BusinessSegment } from '../../types';
import { getErrorMessage } from '../../utils/errorMessage';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProductFormModal } from './ProductFormModal';
import { CatalogTemplateModal } from './CatalogTemplateModal';
import { PRODUCT_PURPOSE_SHORT, productMoney } from './productMoney';
import { formatStockQty, isLowStock } from './productStock';
import { formatBrPhone } from '../../utils/phoneDisplay';
import { normalizePhoneBR } from '../../utils/documentUtils';
import { formatDateTimeBR } from '../../utils/formatters';
import { LuPackage as Package, LuClock as Clock, LuTriangleAlert as AlertTriangle, LuCheck as Check, LuPencil as Pencil, LuTrash2 as Trash2, LuBookmark as Bookmark, LuChevronDown as ChevronDown, LuChevronUp as ChevronUp, LuMessageCircle as MessageCircle } from 'react-icons/lu';

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

type CatalogPurpose = ProductListPurpose;

const PURPOSE_META: Record<CatalogPurpose, { title: string; hint: string; defaultType: ProductType }> = {
  sale: {
    title: 'Para vender',
    hint: 'Entra no PDV e na aba Vendas.',
    defaultType: 'RETAIL',
  },
  own: {
    title: 'Estoque do salão',
    hint: 'Uso interno — entrada, ajuste e consumo. Não aparece no carrinho.',
    defaultType: 'CONSUMABLE',
  },
};

interface Props {
  canManage: boolean;
  canView: boolean;
  canSeeCost: boolean;
  loadError: string | null;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onReload: () => void;
  /** Atalho "Ver todas" → aba Reservas do ProductsHub. */
  onGoReservations?: () => void;
}

export const ProductCatalogPanel: React.FC<Props> = ({ canManage, canView, canSeeCost, loadError, onNotify, onReload, onGoReservations }) => {
  const { user } = useAuth();
  const { settings } = useBarbershop();
  const barbershopId = user?.barbershopId;
  const [catalogPurpose, setCatalogPurpose] = useState<CatalogPurpose>('sale');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null | 'new'>(null);
  const [defaultType, setDefaultType] = useState<ProductType>('RETAIL');
  const [readOnly, setReadOnly] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [openReservations, setOpenReservations] = useState<string | null>(null);
  const limit = 30;
  const purposeMeta = PURPOSE_META[catalogPurpose];

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    if (!canView && !canManage) return;
    setLoading(true);
    try {
      const [list, cats] = await Promise.all([
        productsApi.listProducts({
          search: searchDebounced || undefined,
          purpose: catalogPurpose,
          page,
          limit,
        }),
        productsApi.listCategories(),
      ]);
      setProducts(prev => (page === 1 ? list.data : [...prev, ...list.data]));
      setTotal(list.meta.total);
      setCategories(cats);
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível carregar produtos.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [canView, canManage, searchDebounced, page, catalogPurpose, onNotify]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [searchDebounced, catalogPurpose]);

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

  const openNew = () => {
    setDefaultType(purposeMeta.defaultType);
    setModalProduct('new');
    setReadOnly(false);
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

  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return;
    try {
      await productsApi.deleteProduct(confirmDelete.id);
      setConfirmDelete(null);
      onNotify?.('Produto apagado.', 'success');
      await load();
      onReload();
    } catch (err) {
      setConfirmDelete(null);
      onNotify?.(getErrorMessage(err, 'Não foi possível apagar o produto.'), 'error');
    }
  };

  const purposeBtn = (id: CatalogPurpose) => (
    <button
      type="button"
      onClick={() => setCatalogPurpose(id)}
      className={`rounded-xl px-3 py-2 text-sm font-bold ${catalogPurpose === id ? 'bg-accent text-accent-fg' : 'bg-surface border border-border text-text-secondary'}`}
    >
      {PURPOSE_META[id].title}
    </button>
  );

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

      <div className="flex flex-wrap gap-2">
        {purposeBtn('sale')}
        {purposeBtn('own')}
      </div>
      <p className="text-xs text-text-secondary">{purposeMeta.hint}</p>

      {canManage && (
        <button type="button" onClick={openNew} className="w-full rounded-xl border border-dashed border-border bg-bg px-4 py-3 text-sm font-bold text-text-primary">
          + Novo produto · {purposeMeta.title}
        </button>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto…" className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary" />

      {loading ? (
        <p className="text-sm text-text-muted">Carregando…</p>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <div key={product.id} className="rounded-xl border border-border bg-surface p-4 transition duration-150 hover:border-border-strong hover:shadow-sm">
              <button
                type="button"
                onClick={() => openProduct(product, !canManage)}
                className="block w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <Thumb product={product} />
                  <div className="min-w-0 flex-1">
                    <CardHead product={product} />
                    <MetricGrid product={product} canSeeCost={canSeeCost} />
                    <StockBar product={product} />
                    <ReservedSummary product={product} />
                  </div>
                </div>
              </button>
              <ReservationsBlock
                product={product}
                open={openReservations === product.id}
                onToggle={() => setOpenReservations(prev => (prev === product.id ? null : product.id))}
                onGoReservations={onGoReservations}
              />
              {canManage && (
                <CardActions
                  product={product}
                  onEdit={() => openProduct(product)}
                  onToggle={() => setConfirmToggle(product)}
                  onDelete={() => setConfirmDelete(product)}
                />
              )}
            </div>
          ))}
          {!products.length && <p className="text-sm text-text-muted">Nenhum produto neste cadastro.</p>}
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
        defaultType={defaultType}
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
        message={confirmToggle ? `"${confirmToggle.name}" deixará de aparecer nas listas ativas.` : ''}
        confirmLabel={confirmToggle?.active ? 'Inativar' : 'Ativar'}
        variant={confirmToggle?.active ? 'danger' : 'default'}
        onConfirm={() => void toggleActive()}
        onCancel={() => setConfirmToggle(null)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Apagar produto?"
        message={
          confirmDelete
            ? `Apagar ${confirmDelete.name}? Esta ação não pode ser desfeita. Se o produto já teve vendas ou movimentação de estoque, use Inativar.`
            : ''
        }
        confirmLabel="Apagar"
        variant="danger"
        onConfirm={() => void confirmDeleteProduct()}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

function ReservedBadge({ product }: { product: Product }) {
  const reservedQty = product.reservedQty ?? 0;
  if (reservedQty <= 0) return null;
  return (
    <StatusBadge tone="accent" icon={Bookmark}>
      Reservado · {formatStockQty(reservedQty, product.unit)}
    </StatusBadge>
  );
}

/** Selo de nível de estoque: âmbar abaixo do mínimo, vermelho zerado, verde ok. */
function StockStatusBadge({ product }: { product: Product }) {
  if (!product.trackStock) return null;
  if (product.stockQty <= 0) {
    return (
      <StatusBadge tone="danger" icon={AlertTriangle}>
        zerado
      </StatusBadge>
    );
  }
  if (isLowStock(product)) {
    return (
      <StatusBadge tone="warning" icon={AlertTriangle}>
        estoque baixo
      </StatusBadge>
    );
  }
  return (
    <StatusBadge tone="success" icon={Check}>
      ok
    </StatusBadge>
  );
}

type MetricTone = 'accent' | 'danger' | 'warning' | 'default';

const METRIC_VALUE_TONE: Record<MetricTone, string> = {
  accent: 'text-base font-bold text-success sm:text-lg',
  danger: 'text-sm font-bold text-danger',
  warning: 'text-sm font-bold text-warning',
  default: 'text-sm font-bold text-text-primary',
};

function Metric({ label, value, tone = 'default', sub }: { label: string; value: string; tone?: MetricTone; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`truncate ${METRIC_VALUE_TONE[tone]}`}>{value}</p>
      {sub && <p className="truncate text-[10px] text-text-muted">{sub}</p>}
    </div>
  );
}

/** Margem discreta (preço − custo) exibida sob o custo. */
function marginSub(product: Product): React.ReactNode {
  if (product.averageCost == null || product.type === 'CONSUMABLE') return undefined;
  const margin = product.salePrice - product.averageCost;
  return (
    <span className={margin < 0 ? 'text-danger' : 'text-success'}>
      Margem {productMoney.format(margin)}
    </span>
  );
}

/** Barra fina de estoque atual vs. mínimo (só quando há mínimo definido). */
function StockBar({ product }: { product: Product }) {
  if (!product.trackStock || product.minStock <= 0) return null;
  const pct = Math.min(100, Math.max(0, Math.round((product.stockQty / (product.minStock * 2)) * 100)));
  const tone = product.stockQty <= 0 ? 'bg-danger' : isLowStock(product) ? 'bg-warning' : 'bg-success';
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ReservedSummary({ product }: { product: Product }) {
  const reservedQty = product.reservedQty ?? 0;
  if (reservedQty <= 0 || typeof product.availableQty !== 'number') return null;
  return (
    <p className="text-xs text-text-secondary">
      Em estoque {product.stockQty} · reservado {reservedQty} · livre {product.availableQty}
    </p>
  );
}

/** Miniatura 64px (76px no desktop) com placeholder quando não há imagem. */
function Thumb({ product }: { product: Product }) {
  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 sm:h-[76px] sm:w-[76px]">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-surface-2 to-bg">
          <Package size={26} className="text-text-muted" aria-hidden />
        </div>
      )}
    </div>
  );
}

/** Nome + chips (categoria/uso) à esquerda e selos de estado no topo direito. */
function CardHead({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary sm:text-base">
          {product.name}
        </p>
        {(product.category?.name || product.type === 'BOTH') && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {product.category?.name && (
              <span className="inline-flex rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                {product.category.name}
              </span>
            )}
            {product.type === 'BOTH' && (
              <span className="inline-flex rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                {PRODUCT_PURPOSE_SHORT.BOTH}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 md:max-w-[55%] md:shrink-0 md:justify-end">
        <StockStatusBadge product={product} />
        {!product.active && <StatusBadge status="Inativo" tone="neutral" />}
        <ReservedBadge product={product} />
        {product.expirationStatus === 'expired' && <StatusBadge status="vencido" tone="danger" />}
        {product.expirationStatus === 'expiring' && (
          <StatusBadge tone="warning" icon={Clock}>
            vence em {product.daysToExpire}d
          </StatusBadge>
        )}
      </div>
    </div>
  );
}

/** Métricas em colunas: preço em destaque, estoque com tom semântico, mínimo e custo. */
function MetricGrid({ product, canSeeCost }: { product: Product; canSeeCost: boolean }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
      {product.type !== 'CONSUMABLE' && (
        <Metric label="Preço" value={productMoney.format(product.salePrice)} tone="accent" />
      )}
      <Metric
        label="Estoque"
        value={formatStockQty(product.stockQty, product.unit)}
        tone={product.trackStock && product.stockQty <= 0 ? 'danger' : isLowStock(product) ? 'warning' : 'default'}
      />
      <Metric label="Mínimo" value={product.minStock > 0 ? formatStockQty(product.minStock, product.unit) : '—'} />
      {canSeeCost && (
        <Metric
          label="Custo"
          value={product.averageCost != null ? productMoney.format(product.averageCost) : '—'}
          sub={marginSub(product)}
        />
      )}
    </div>
  );
}

/** Rodapé de ações alinhado à direita (empilhado em telas pequenas). */
function CardActions({
  product,
  onEdit,
  onToggle,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const toggleLabel = product.active ? 'Inativar' : 'Ativar';
  return (
    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 sm:justify-end">
      <button
        type="button"
        aria-label="Editar produto"
        title="Editar produto"
        onClick={onEdit}
        className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-text-primary outline-none transition-colors duration-150 hover:border-border-strong hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:flex-none"
      >
        <Pencil size={14} aria-hidden /> Editar
      </button>
      <button
        type="button"
        aria-label={toggleLabel}
        onClick={onToggle}
        className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold text-text-secondary outline-none transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:flex-none"
      >
        {toggleLabel}
      </button>
      <button
        type="button"
        aria-label="Apagar produto"
        title="Apagar produto"
        onClick={onDelete}
        className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border border-transparent px-2.5 text-text-secondary outline-none transition-colors duration-150 hover:border-danger/30 hover:bg-danger/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <Trash2 size={15} aria-hidden />
      </button>
    </div>
  );
}

interface ReservationsBlockProps {
  product: Product;
  open: boolean;
  onToggle: () => void;
  onGoReservations?: () => void;
}

function ReservationsBlock({ product, open, onToggle, onGoReservations }: ReservationsBlockProps) {
  const reservations = product.reservations ?? [];
  if (!reservations.length) return null;
  return (
    <div className="mt-2 border-t border-border pt-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex items-center gap-1 text-xs font-bold text-text-secondary transition-colors hover:text-accent"
        >
          {open ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
          Ver reservas ({reservations.length})
        </button>
        {onGoReservations && (
          <button type="button" onClick={onGoReservations} className="text-xs font-bold text-accent hover:underline">
            Ver todas
          </button>
        )}
      </div>
      {open && (
        <ul className="mt-2 space-y-2">
          {reservations.map(reservation => (
            <li key={reservation.id} className="rounded-lg border border-border bg-bg px-2.5 py-2">
              <p className="text-xs font-semibold text-text-primary">
                {reservation.quantity}× · {reservation.customerName} · {formatBrPhone(reservation.whatsapp)}
              </p>
              <p className="text-[11px] text-text-muted">
                retirar até {formatDateTimeBR(reservation.expiresAt)}
              </p>
              <a
                href={`https://wa.me/55${normalizePhoneBR(reservation.whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
              >
                <MessageCircle size={13} aria-hidden /> Chamar no WhatsApp
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
