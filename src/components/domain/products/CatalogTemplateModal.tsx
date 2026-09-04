import React, { useEffect, useState } from 'react';
import { productsApi, type CatalogTemplatePreview } from '../../../infra/productsApi';
import type { BusinessSegment } from '../../../types';
import { getErrorMessage } from '../../../utils/errorMessage';

interface Props {
  open: boolean;
  barbershopId: string;
  segment?: BusinessSegment;
  onClose: () => void;
  onInstalled: () => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

function Section({ title, items }: { title: string; items: { name: string; alreadyExists?: boolean }[] }) {
  const pending = items.filter(i => !i.alreadyExists);
  if (!items.length) return null;
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="text-sm font-bold text-text-primary">{title}</p>
      <p className="text-xs text-text-muted">{pending.length} novo(s) · {items.length - pending.length} já existente(s)</p>
      <ul className="mt-2 max-h-28 overflow-y-auto text-xs text-text-secondary">
        {items.slice(0, 12).map(item => (
          <li key={item.name} className={item.alreadyExists ? 'line-through opacity-60' : ''}>{item.name}</li>
        ))}
        {items.length > 12 && <li>… e mais {items.length - 12}</li>}
      </ul>
    </div>
  );
}

export const CatalogTemplateModal: React.FC<Props> = ({ open, barbershopId, segment, onClose, onInstalled, onNotify }) => {
  const [preview, setPreview] = useState<CatalogTemplatePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [include, setInclude] = useState({
    serviceCategories: true,
    productCategories: true,
    expenseCategories: true,
    services: true,
    products: true,
  });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    productsApi.previewTemplate(barbershopId, segment)
      .then(setPreview)
      .catch(err => onNotify?.(getErrorMessage(err, 'Não foi possível carregar o modelo.'), 'error'))
      .finally(() => setLoading(false));
  }, [open, barbershopId, segment, onNotify]);

  if (!open) return null;

  const install = async () => {
    if (!preview || preview.alreadyInstalled) return;
    setInstalling(true);
    try {
      const result = await productsApi.installTemplate(barbershopId, { segment, include });
      onNotify?.(result.alreadyInstalled ? 'Este modelo já foi instalado.' : 'Catálogo sugerido importado.', 'success');
      onInstalled();
      onClose();
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível instalar o modelo.'), 'error');
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Modelo sugerido</h3>
          <button type="button" onClick={onClose} className="text-sm text-text-muted">Fechar</button>
        </div>
        {loading ? (
          <p className="text-sm text-text-muted">Carregando sugestões…</p>
        ) : preview ? (
          <div className="space-y-3">
            {preview.alreadyInstalled ? (
              <p className="rounded-lg bg-accent/10 p-3 text-sm text-text-secondary">Este modelo já foi instalado neste salão.</p>
            ) : (
              <>
                <p className="text-xs text-text-muted">A instalação nunca sobrescreve cadastros existentes.</p>
                {(['productCategories', 'products', 'serviceCategories', 'services', 'expenseCategories'] as const).map(key => (
                  <label key={key} className="flex items-center gap-2 text-sm text-text-secondary">
                    <input
                      type="checkbox"
                      checked={include[key]}
                      onChange={e => setInclude(prev => ({ ...prev, [key]: e.target.checked }))}
                    />
                    Incluir {key === 'productCategories' ? 'categorias de produto' : key === 'products' ? 'produtos' : key === 'serviceCategories' ? 'categorias de serviço' : key === 'services' ? 'serviços' : 'categorias de despesa'}
                  </label>
                ))}
                <Section title="Produtos" items={preview.products} />
                <Section title="Categorias de produto" items={preview.productCategories} />
                <button type="button" disabled={installing} onClick={() => void install()} className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-fg disabled:opacity-50">
                  {installing ? 'Importando…' : 'Confirmar importação'}
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
