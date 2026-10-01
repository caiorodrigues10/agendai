import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuPackage as Package, LuChevronRight as ChevronRight } from 'react-icons/lu';
import { publicProductsApi, type PublicProduct } from '../../infra/publicProductsApi';
import { productMoney } from './products/productMoney';

interface Props {
  barbershopId: string;
}

function availabilityLabel(product: PublicProduct): string {
  if (product.available === null) return 'Disponível';
  return `${product.available} disponível${product.available === 1 ? '' : 'is'}`;
}

/**
 * Carrossel de produtos públicos da barbearia — renderizado abaixo do
 * agendador, na aba Agenda. Sem produtos, a seção inteira não é renderizada
 * (a reserva é conteúdo extra da página pública, nunca um bloqueio).
 */
export const PublicProductCarousel: React.FC<Props> = ({ barbershopId }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    publicProductsApi
      .list(barbershopId)
      .then(res => {
        if (alive) setProducts(res.products);
      })
      .catch(() => {
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

  return (
    <section className="mt-8" aria-label="Produtos para reserva">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <Package size={18} aria-hidden />
          Produtos à reserva
        </h3>
        <span className="rounded-full border border-border-strong bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-text-secondary">
          {products.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map(product => (
          <button
            key={product.id}
            type="button"
            onClick={() => navigate(`/queue/${barbershopId}/produtos/${product.id}`)}
            className="w-44 shrink-0 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-accent/40 focus:outline-none focus-visible:border-accent"
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
            <p className="truncate text-[11px] text-text-muted">
              {product.category ?? product.unitLabel}
            </p>

            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="text-sm font-bold text-accent">
                {productMoney.format(product.price)}
              </span>
              <ChevronRight size={14} className="text-text-muted" aria-hidden />
            </div>
            <p className="mt-0.5 text-[11px] text-text-secondary">{availabilityLabel(product)}</p>
          </button>
        ))}
      </div>
    </section>
  );
};
