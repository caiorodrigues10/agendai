import React, { useEffect, useState } from 'react';
import { productsApi, type Product, type ProductCategory, type ProductType } from '../../../infra/productsApi';
import { SmartSelect } from '../../ui/SmartSelect';
import { getErrorMessage } from '../../../utils/errorMessage';

export interface ProductFormValues {
  name: string;
  description: string;
  salePrice: string;
  sku: string;
  barcode: string;
  categoryId: string;
  type: ProductType;
  unitLabel: string;
  minStock: string;
  trackStock: boolean;
}

const emptyForm = (): ProductFormValues => ({
  name: '',
  description: '',
  salePrice: '0',
  sku: '',
  barcode: '',
  categoryId: '',
  type: 'RETAIL',
  unitLabel: 'unidade',
  minStock: '0',
  trackStock: true,
});

interface Props {
  open: boolean;
  product: Product | null;
  readOnly?: boolean;
  categories: ProductCategory[];
  onClose: () => void;
  onSaved: () => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onCategoriesChange?: (categories: ProductCategory[]) => void;
}

export const ProductFormModal: React.FC<Props> = ({
  open,
  product,
  readOnly,
  categories,
  onClose,
  onSaved,
  onNotify,
  onCategoriesChange,
}) => {
  const [form, setForm] = useState<ProductFormValues>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? '',
        salePrice: String(product.salePrice),
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        categoryId: product.categoryId ?? '',
        type: product.type,
        unitLabel: product.unitLabel,
        minStock: String(product.minStock),
        trackStock: product.trackStock,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, product]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        salePrice: Number(form.salePrice),
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        categoryId: form.categoryId || null,
        type: form.type,
        unitLabel: form.unitLabel.trim() || 'unidade',
        minStock: Number(form.minStock),
        trackStock: form.trackStock,
      };
      if (product) {
        await productsApi.updateProduct(product.id, payload);
        onNotify?.('Produto atualizado.', 'success');
      } else {
        await productsApi.createProduct(payload);
        onNotify?.('Produto cadastrado.', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível salvar o produto.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim() || readOnly) return;
    try {
      const created = await productsApi.createCategory({ name: newCategory.trim() });
      onCategoriesChange?.([...categories, created]);
      setForm(prev => ({ ...prev, categoryId: created.id }));
      setNewCategory('');
      onNotify?.('Categoria criada.', 'success');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível criar a categoria.'), 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">
            {readOnly ? 'Detalhes do produto' : product ? 'Editar produto' : 'Novo produto'}
          </h3>
          <button type="button" onClick={onClose} className="text-sm text-text-muted">Fechar</button>
        </div>
        <form className="space-y-3" onSubmit={submit}>
          <input required disabled={readOnly} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary disabled:opacity-70" />
          <textarea disabled={readOnly} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição" rows={2} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary disabled:opacity-70" />
          <div className="grid grid-cols-2 gap-2">
            <input required disabled={readOnly} type="number" min={0} step="0.01" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} placeholder="Preço" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary disabled:opacity-70" />
            <input disabled={readOnly} type="number" min={0} step="0.001" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} placeholder="Estoque mínimo" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary disabled:opacity-70" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input disabled={readOnly} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary disabled:opacity-70" />
            <input disabled={readOnly} value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="Código de barras" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary disabled:opacity-70" />
          </div>
          <SmartSelect
            label="Categoria"
            disabled={readOnly}
            value={form.categoryId || null}
            onChange={value => setForm({ ...form, categoryId: value ?? '' })}
            options={[{ value: '', label: 'Sem categoria' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
            searchable="auto"
          />
          {!readOnly && (
            <div className="flex gap-2">
              <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nova categoria" className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary" />
              <button type="button" onClick={() => void addCategory()} className="rounded-lg border border-border px-3 text-xs font-bold text-text-secondary">Adicionar</button>
            </div>
          )}
          <SmartSelect
            label="Tipo"
            disabled={readOnly}
            value={form.type}
            onChange={value => setForm({ ...form, type: (value ?? 'RETAIL') as ProductType })}
            options={[
              { value: 'RETAIL', label: 'Revenda' },
              { value: 'CONSUMABLE', label: 'Consumo interno' },
              { value: 'BOTH', label: 'Ambos' },
            ]}
            searchable={false}
          />
          <input disabled={readOnly} value={form.unitLabel} onChange={e => setForm({ ...form, unitLabel: e.target.value })} placeholder="Unidade (ex.: unidade, ml)" className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary disabled:opacity-70" />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" disabled={readOnly} checked={form.trackStock} onChange={e => setForm({ ...form, trackStock: e.target.checked })} />
            Controlar estoque
          </label>
          {!readOnly && (
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-fg disabled:opacity-50">
              {saving ? 'Salvando…' : product ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
