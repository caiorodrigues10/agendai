import React, { useEffect, useState } from 'react';
import { LuLoader, LuTriangleAlert, LuRefreshCcw, LuPackage } from 'react-icons/lu';
import { adminInternalApi, ProductAdoption } from '../../infra/adminInternalApi';
import { formatCurrencyBRL } from '../../utils/formatters';

const timeAgo = (iso: string, now: number): string => {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `há ${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  return `há ${Math.round(minutes / 60)}h`;
};

const AdoptionCard: React.FC<{ label: string; value: string; hint?: string; danger?: boolean }> = ({
  label,
  value,
  hint,
  danger,
}) => (
  <div className="bg-surface border border-border rounded-xl p-4">
    <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
    <p className={`text-2xl font-bold mt-2 ${danger ? 'text-danger' : 'text-text-primary'}`}>{value}</p>
    {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
  </div>
);

const AdoptionPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
    <h3 className="text-sm font-bold">{title}</h3>
    {children}
  </div>
);

const TopProductsList: React.FC<{ data: ProductAdoption }> = ({ data }) => {
  if (data.topProducts.length === 0) {
    return <p className="text-sm text-text-muted">Nenhuma venda de produto concluída até o momento.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {data.topProducts.map((product) => (
        <li key={product.productId} className="flex items-center justify-between gap-3">
          <span className="text-text-secondary truncate">{product.name}</span>
          <span className="shrink-0 text-right">
            <span className="font-bold">{product.units} un</span>
            <span className="block text-xs text-text-muted">{formatCurrencyBRL(product.revenue)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};

const TopCategoriesList: React.FC<{ data: ProductAdoption }> = ({ data }) => {
  if (data.topCategories.length === 0) {
    return <p className="text-sm text-text-muted">Nenhuma categoria cadastrada até o momento.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {data.topCategories.map((category) => (
        <li
          key={category.categoryId ?? 'sem-categoria'}
          className="flex items-center justify-between gap-3"
        >
          <span className="text-text-secondary truncate">{category.name}</span>
          <span className="font-bold shrink-0">{category.products}</span>
        </li>
      ))}
    </ul>
  );
};

export const OverviewProductAdoption: React.FC = () => {
  const [data, setData] = useState<ProductAdoption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    adminInternalApi
      .getProductAdoption()
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Não foi possível carregar a adoção de produtos.');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  if (!data && !error) {
    return (
      <div className="flex justify-center py-6">
        <LuLoader className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-6 rounded-xl border border-border bg-surface">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="text-accent text-sm mt-2 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const { catalog, sales30d } = data;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <LuPackage size={18} /> Adoção de produtos
          </h2>
          <p className="text-xs text-text-muted">Atualizado {timeAgo(data.generatedAt, now)}</p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          aria-label="Atualizar adoção de produtos"
          className="p-2 rounded-lg border border-border bg-surface text-text-muted hover:bg-hover-bg"
        >
          <LuRefreshCcw size={16} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          <LuTriangleAlert size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <AdoptionCard
          label="Adoção do catálogo"
          value={`${catalog.adoptionPct}%`}
          hint={`${catalog.shopsWithCatalog} de ${catalog.shopsTotal} salões com produtos`}
        />
        <AdoptionCard
          label="Produtos ativos"
          value={String(catalog.productsActive)}
          hint={`${catalog.productsInactive} inativos`}
        />
        <AdoptionCard label="Categorias" value={String(catalog.categoriesTotal)} />
        <AdoptionCard
          label="Receita (30 dias)"
          value={formatCurrencyBRL(sales30d.revenue)}
          hint={`${sales30d.units} unidades vendidas`}
        />
        <AdoptionCard
          label="Estoque baixo"
          value={String(catalog.lowStock)}
          hint="no mínimo configurado"
          danger={catalog.lowStock > 0}
        />
        <AdoptionCard
          label="Estoque zerado"
          value={String(catalog.outOfStock)}
          hint="produtos ativos sem estoque"
          danger={catalog.outOfStock > 0}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AdoptionPanel title="Mais vendidos">
          <TopProductsList data={data} />
        </AdoptionPanel>
        <AdoptionPanel title="Categorias com mais produtos">
          <TopCategoriesList data={data} />
        </AdoptionPanel>
      </div>
    </section>
  );
};

export default OverviewProductAdoption;
