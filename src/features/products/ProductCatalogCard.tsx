import React from 'react';
import type { Product } from '../../infra/productsApi';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PRODUCT_PURPOSE_SHORT, productMoney } from './productMoney';
import { formatStockQty, isLowStock } from './productStock';
import { formatBrPhone } from '../../utils/phoneDisplay';
import { normalizePhoneBR } from '../../utils/documentUtils';
import { formatDateTimeBR } from '../../utils/formatters';
import {
  LuPackage as Package,
  LuClock as Clock,
  LuTriangleAlert as AlertTriangle,
  LuCheck as Check,
  LuPencil as Pencil,
  LuTrash2 as Trash2,
  LuBookmark as Bookmark,
  LuChevronDown as ChevronDown,
  LuChevronUp as ChevronUp,
  LuMessageCircle as MessageCircle,
  LuEyeOff as EyeOff,
  LuEye as Eye,
} from 'react-icons/lu';

/**
 * Partes visuais do card de produto do catálogo (/app/products): thumbnail,
 * cabeçalho com selos, métricas, barra de estoque, bloco de reservas e ações.
 * O estado inativo é só de apresentação: borda tracejada, faixa de status,
 * métricas em cinza e "Ativar" como ação principal.
 */

function ReservedBadge({ product }: { product: Product }) {
  const reservedQty = product.reservedQty ?? 0;
  if (reservedQty <= 0) return null;
  return (
    <StatusBadge tone="accent" icon={Bookmark}>
      Reservado · {formatStockQty(reservedQty, product.unit)}
    </StatusBadge>
  );
}

/** Faixa discreta no topo do card inativo: substitui o chip "Inativo" solto. */
export function InactiveStrip({ product }: { product: Product }) {
  const reservedQty = product.reservedQty ?? 0;
  if (product.active) return null;
  return (
    <div
      data-testid="inactive-strip"
      className="mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold text-text-secondary"
    >
      <span className="inline-flex items-center gap-1.5">
        <EyeOff size={14} className="shrink-0" aria-hidden />
        Produto inativo · não aparece no PDV nem na vitrine
      </span>
      {reservedQty > 0 && <span>· Há {reservedQty} reservas pendentes</span>}
    </div>
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

/** Tamanho do valor por métrica (o preço continua destacado mesmo inativo). */
const METRIC_VALUE_SIZE: Record<MetricTone, string> = {
  accent: 'text-base sm:text-lg',
  danger: 'text-sm',
  warning: 'text-sm',
  default: 'text-sm',
};

/** Cor do valor por métrica; substituída por cinza neutro quando o produto está inativo. */
const METRIC_VALUE_COLOR: Record<MetricTone, string> = {
  accent: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  default: 'text-text-primary',
};

const METRIC_VALUE_MUTED_COLOR = 'text-text-secondary';

function Metric({
  label,
  value,
  tone = 'default',
  muted = false,
  sub,
}: {
  label: string;
  value: string;
  tone?: MetricTone;
  muted?: boolean;
  sub?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`truncate font-bold ${METRIC_VALUE_SIZE[tone]} ${muted ? METRIC_VALUE_MUTED_COLOR : METRIC_VALUE_COLOR[tone]}`}>
        {value}
      </p>
      {sub && <p className="truncate text-[10px] text-text-muted">{sub}</p>}
    </div>
  );
}

/** Margem discreta (preço − custo) exibida sob o custo. */
function marginSub(product: Product, muted: boolean): React.ReactNode {
  if (product.averageCost == null || product.type === 'CONSUMABLE') return undefined;
  const margin = product.salePrice - product.averageCost;
  return (
    <span className={muted ? METRIC_VALUE_MUTED_COLOR : margin < 0 ? 'text-danger' : 'text-success'}>
      Margem {productMoney.format(margin)}
    </span>
  );
}

/** Barra fina de estoque atual vs. mínimo (só quando há mínimo definido). */
export function StockBar({ product }: { product: Product }) {
  if (!product.trackStock || product.minStock <= 0) return null;
  const pct = Math.min(100, Math.max(0, Math.round((product.stockQty / (product.minStock * 2)) * 100)));
  const tone = !product.active
    ? 'bg-text-muted'
    : product.stockQty <= 0
      ? 'bg-danger'
      : isLowStock(product)
        ? 'bg-warning'
        : 'bg-success';
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ReservedSummary({ product }: { product: Product }) {
  const reservedQty = product.reservedQty ?? 0;
  if (reservedQty <= 0 || typeof product.availableQty !== 'number') return null;
  return (
    <p className="text-xs text-text-secondary">
      Em estoque {product.stockQty} · reservado {reservedQty} · livre {product.availableQty}
    </p>
  );
}

/** Miniatura 64px (76px no desktop) com placeholder quando não há imagem. */
export function Thumb({ product }: { product: Product }) {
  const inactive = !product.active;
  const mediaTone = inactive ? 'grayscale opacity-60' : '';
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 sm:h-[76px] sm:w-[76px]">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className={`h-full w-full object-cover ${mediaTone}`} loading="lazy" />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-b from-surface-2 to-bg ${mediaTone}`}>
          <Package size={26} className="text-text-muted" aria-hidden />
        </div>
      )}
      {inactive && (
        <span className="absolute bottom-1 left-1 rounded-full border border-border bg-surface/90 px-1.5 py-0.5 text-[9px] font-bold leading-none text-text-secondary">
          Inativo
        </span>
      )}
    </div>
  );
}

/** Nome + chips (categoria/uso) à esquerda e selos de estado no topo direito. */
export function CardHead({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <p
          className={`line-clamp-2 text-sm font-semibold leading-snug sm:text-base ${
            product.active ? 'text-text-primary' : 'text-text-secondary'
          }`}
        >
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
        {product.active && <StockStatusBadge product={product} />}
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
export function MetricGrid({ product, canSeeCost }: { product: Product; canSeeCost: boolean }) {
  const muted = !product.active;
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
      {product.type !== 'CONSUMABLE' && (
        <Metric label="Preço" value={productMoney.format(product.salePrice)} tone="accent" muted={muted} />
      )}
      <Metric
        label="Estoque"
        value={formatStockQty(product.stockQty, product.unit)}
        tone={product.trackStock && product.stockQty <= 0 ? 'danger' : isLowStock(product) ? 'warning' : 'default'}
        muted={muted}
      />
      <Metric label="Mínimo" value={product.minStock > 0 ? formatStockQty(product.minStock, product.unit) : '—'} muted={muted} />
      {canSeeCost && (
        <Metric
          label="Custo"
          value={product.averageCost != null ? productMoney.format(product.averageCost) : '—'}
          muted={muted}
          sub={marginSub(product, muted)}
        />
      )}
    </div>
  );
}

/** Rodapé de ações alinhado à direita (empilhado em telas pequenas). */
export function CardActions({
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
  const inactive = !product.active;
  const toggleLabel = inactive ? 'Ativar' : 'Inativar';
  const toggleAria = inactive ? `Ativar ${product.name}` : 'Inativar';
  return (
    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 sm:justify-end">
      <button
        type="button"
        aria-label="Editar produto"
        title="Editar produto"
        onClick={onEdit}
        className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-text-primary outline-none transition-colors duration-200 hover:border-border-strong hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:flex-none"
      >
        <Pencil size={14} aria-hidden /> Editar
      </button>
      <button
        type="button"
        aria-label={toggleAria}
        onClick={onToggle}
        className={`inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:flex-none ${
          inactive
            ? 'bg-accent text-accent-fg hover:bg-accent-hover'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
        }`}
      >
        {inactive && <Eye size={14} className="shrink-0" aria-hidden />}
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

export function ReservationsBlock({ product, open, onToggle, onGoReservations }: ReservationsBlockProps) {
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
