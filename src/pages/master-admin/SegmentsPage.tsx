import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LuLayers, LuSearch } from 'react-icons/lu';
import { adminInternalApi, SegmentCatalogItem } from '../../infra/adminInternalApi';
import { DataTableState } from '../../components/patterns/states/DataTableState';
import { getErrorMessage } from '../../utils/errorMessage';

const MODULE_LABEL: Record<string, string> = {
  products: 'Produtos',
  equipment: 'Equipamento',
  commissions: 'Comissões',
  tip: 'Gorjeta',
};

const FEATURE_LABEL: Record<string, string> = {
  caseManagement: 'Gestão de processos',
};

export const SegmentsPage: React.FC = () => {
  const [catalog, setCatalog] = useState<SegmentCatalogItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await adminInternalApi.getSegments();
      setCatalog(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const term = search.trim().toLowerCase();
    if (!term) return catalog;
    return catalog.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.segment.toLowerCase().includes(term) ||
        item.group.toLowerCase().includes(term),
    );
  }, [catalog, search]);

  const totalShops = useMemo(
    () => (catalog ?? []).reduce((sum, item) => sum + item.shops, 0),
    [catalog],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <LuLayers size={20} /> Segmentos
        </h1>
        <span className="text-sm text-text-muted">
          {catalog?.length ?? 0} segmentos · {totalShops} salão(ões)
        </span>
      </div>

      <p className="text-sm text-text-secondary">
        Catálogo versionado no código: a interface mostra o que cada segmento habilita e quantos
        salões o usam. Editar o catálogo é mudança de código, não ação de painel.
      </p>

      <form
        className="relative max-w-sm"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <LuSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar segmento..."
          aria-label="Buscar segmento"
          className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </form>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <DataTableState
          loading={!catalog && !error}
          error={error}
          isEmpty={Boolean(catalog) && filtered.length === 0}
          emptyTitle="Nenhum segmento encontrado"
          emptyDescription="Ajuste a busca para ver o catálogo completo."
          onRetry={() => void load()}
        />
        {catalog && filtered.length > 0 && (
          <div className="divide-y divide-border/50">
            {filtered.map((item) => (
              <div key={item.segment} className="px-4 py-3 space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium">{item.label}</p>
                  <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium">
                    {item.shops} salão(ões)
                  </span>
                  {item.advertisingRestricted && (
                    <span className="px-2 py-0.5 rounded bg-warning/10 text-warning text-[10px] font-medium">
                      Publicidade restrita
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  Módulos visíveis:{' '}
                  {item.visibleModules.length > 0
                    ? item.visibleModules.map((module) => MODULE_LABEL[module] ?? module).join(', ')
                    : 'nenhum'}
                </p>
                <p className="text-xs text-text-muted">
                  Features:{' '}
                  {item.features.length > 0
                    ? item.features.map((feature) => FEATURE_LABEL[feature] ?? feature).join(', ')
                    : 'nenhuma'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentsPage;
