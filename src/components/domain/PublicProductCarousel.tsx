import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuPackage as Package, LuChevronRight as ChevronRight } from 'react-icons/lu';
import { publicProductsApi, type PublicProduct } from '../../infra/publicProductsApi';
import { productMoney } from '../../features/products/productMoney';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  barbershopId: string;
}

/** `1–3` produtos viram grade (sem scroll horizontal); `4+` mantêm o carrossel. */
function availabilityLabel(product: PublicProduct): string {
  if (product.available === null) return 'Disponível';
  return `${product.available} disponível${product.available === 1 ? '' : 'is'}`;
}

interface ProductCardProps {
  barbershopId: string;
  product: PublicProduct;
  variant: 'grid' | 'carousel';
}

const ProductCard: React.FC<ProductCardProps> = ({ barbershopId, product, variant }) => {
  const navigate = useNavigate();
  const soldOut = product.available === 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/queue/${barbershopId}/produtos/${product.id}`)}
      className={
        variant === 'grid'
          ? 'w-full rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-accent/40 focus:outline-none focus-visible:border-accent'
          : 'w-44 shrink-0 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-accent/40 focus:outline-none focus-visible:border-accent'
      }
      aria-label={`Ver ${product.name}`}
    >
      <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-text-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Package size={26} aria-hidden />
        )}
      </div>

      <p className="truncate text-sm font-bold text-text-primary">{product.name}</p>
      {variant === 'grid' && product.description && (
        <p className="truncate text-[11px] text-text-secondary">{product.description}</p>
      )}
      <p className="truncate text-[11px] text-text-muted">
        {product.category ?? product.unitLabel}
      </p>

      <div className="mt-2 flex items-center justify-between gap-1">
        <span className="text-sm font-bold text-accent">
          {productMoney.format(product.price)}
        </span>
        <ChevronRight size={14} className="text-text-muted" aria-hidden />
      </div>

      {soldOut ? (
        <StatusBadge tone="danger" className="mt-1">
          Esgotado
        </StatusBadge>
      ) : (
        <p className="mt-0.5 text-[11px] text-text-secondary">{availabilityLabel(product)}</p>
      )}
    </button>
  );
};

/**
 * Produtos públicos da barbearia — renderizado abaixo do agendador, na aba
 * Agenda, e na aba Perfil. Sem produtos (ou falha da API), a seção inteira não
 * é renderizada (a reserva é conteúdo extra da página pública, nunca um
 * bloqueio); a falha vira `console.error` para o dono investigar.
 */
export const PublicProductCarousel: React.FC<Props> = ({ barbershopId }) => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setProducts([]);
    publicProductsApi
      .list(barbershopId)
      .then(res => {
        if (alive) setProducts(Array.isArray(res.products) ? res.products : []);
      })
      .catch(err => {
        console.error('[PublicProductCarousel] falha ao carregar produtos públicos:', err);
        if (alive) setProducts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [barbershopId]);

  if (loading || products.length === 0) return null;

  const variant = products.length <= 3 ? 'grid' : 'carousel';

  return (
    <section className="mt-8" aria-label="Produtos para reserva">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <Package size={18} aria-hidden />
          Produtos
        </h3>
        <span className="rounded-full border border-border-strong bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-text-secondary">
          {products.length}
        </span>
      </div>

      <div
        className={
          variant === 'grid'
            ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex gap-3 overflow-x-auto pb-2'
        }
      >
        {products.map(product => (
          <ProductCard
            key={product.id}
            barbershopId={barbershopId}
            product={product}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
};
