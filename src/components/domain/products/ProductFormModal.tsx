import React, { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi, type Product, type ProductCategory, type ProductType } from '../../../infra/productsApi';
import { SmartSelect } from '../../ui/SmartSelect';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_FOOTER, FORM_GRID, FORM_SECTION_TITLE } from '../../ui/Field';
import { getErrorMessage } from '../../../utils/errorMessage';
import { ProductSchema, ProductFormData } from '../../../schemas';
import { PRODUCT_PURPOSE_LABEL } from './productMoney';

interface Props {
  open: boolean;
  product: Product | null;
  defaultType?: ProductType;
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
  defaultType = 'RETAIL',
  readOnly,
  categories,
  onClose,
  onSaved,
  onNotify,
  onCategoriesChange,
}) => {
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      description: '',
      salePrice: 0,
      sku: '',
      barcode: '',
      categoryId: '',
      type: defaultType,
      unitLabel: 'unidade',
      minStock: 0,
      trackStock: true,
    },
  });

  const productType = useWatch({ control, name: 'type' });
  const stockOnly = productType === 'CONSUMABLE';

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? '',
        salePrice: product.salePrice,
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        categoryId: product.categoryId ?? '',
        type: product.type,
        unitLabel: product.unitLabel,
        minStock: product.minStock,
        trackStock: product.trackStock,
      });
    } else {
      reset({
        name: '',
        description: '',
        salePrice: 0,
        sku: '',
        barcode: '',
        categoryId: '',
        type: defaultType,
        unitLabel: 'unidade',
        minStock: 0,
        trackStock: true,
      });
    }
  }, [open, product, defaultType, reset]);

  useEffect(() => {
    if (!open || product || !stockOnly) return;
    setValue('salePrice', 0);
  }, [open, product, stockOnly, setValue]);

  if (!open) return null;

  const onSubmit = async (data: ProductFormData) => {
    if (readOnly) return;
    setSaving(true);
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        salePrice: data.type === 'CONSUMABLE' ? 0 : data.salePrice,
        sku: data.sku?.trim() || null,
        barcode: data.barcode?.trim() || null,
        categoryId: data.categoryId || null,
        type: data.type,
        unitLabel: data.unitLabel?.trim() || 'unidade',
        minStock: data.minStock,
        trackStock: data.trackStock,
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
      reset(prev => ({ ...prev, categoryId: created.id }));
      setNewCategory('');
      onNotify?.('Categoria criada.', 'success');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível criar a categoria.'), 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">
            {readOnly ? 'Detalhes do produto' : product ? 'Editar produto' : 'Novo produto'}
          </h3>
          <button type="button" onClick={onClose} className="text-sm text-text-muted">Fechar</button>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <p className={FORM_SECTION_TITLE}>Identidade</p>
            <Field label="Nome" error={errors.name?.message}>
              <input
                disabled={readOnly}
                placeholder="Ex.: Shampoo hidratante"
                className={errors.name ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                {...register('name')}
              />
            </Field>
            <Field label="Descrição" error={errors.description?.message}>
              <textarea
                disabled={readOnly}
                placeholder="Detalhes opcionais do produto"
                rows={2}
                className={`${errors.description ? FIELD_CONTROL_ERROR : FIELD_CONTROL} resize-none`}
                {...register('description')}
              />
            </Field>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <SmartSelect
                  label="Finalidade"
                  disabled={readOnly}
                  value={field.value}
                  onChange={value => field.onChange(value ?? 'RETAIL')}
                  options={[
                    { value: 'RETAIL', label: PRODUCT_PURPOSE_LABEL.RETAIL },
                    { value: 'CONSUMABLE', label: PRODUCT_PURPOSE_LABEL.CONSUMABLE },
                    { value: 'BOTH', label: PRODUCT_PURPOSE_LABEL.BOTH },
                  ]}
                  searchable={false}
                />
              )}
            />
            <p className="text-xs text-text-muted">
              {stockOnly
                ? 'Só estoque do salão — não entra no PDV.'
                : productType === 'BOTH'
                  ? 'Aparece na venda e no estoque de uso interno.'
                  : 'Entra no PDV e na aba Vendas.'}
            </p>
          </div>

          <div className="space-y-4">
            <p className={FORM_SECTION_TITLE}>{stockOnly ? 'Cadastro' : 'Venda'}</p>
            {!stockOnly && (
              <Field label="Preço de venda (R$)" error={errors.salePrice?.message}>
                <input
                  disabled={readOnly}
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  className={errors.salePrice ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                  {...register('salePrice')}
                />
              </Field>
            )}
            <div className={FORM_GRID}>
              <Field label="Unidade" error={errors.unitLabel?.message}>
                <input
                  disabled={readOnly}
                  placeholder="Ex.: unidade, ml, g"
                  className={errors.unitLabel ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                  {...register('unitLabel')}
                />
              </Field>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <SmartSelect
                    label="Categoria"
                    disabled={readOnly}
                    value={field.value || null}
                    onChange={value => field.onChange(value ?? '')}
                    options={[{ value: '', label: 'Sem categoria' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                    searchable="auto"
                  />
                )}
              />
            </div>
            {!readOnly && (
              <div className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Nova categoria"
                  className={`${FIELD_CONTROL} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => void addCategory()}
                  className="min-h-11 shrink-0 rounded-lg border border-border px-3 text-xs font-bold text-text-secondary"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className={FORM_SECTION_TITLE}>Estoque</p>
            <Controller
              control={control}
              name="trackStock"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                  />
                  Controlar estoque
                </label>
              )}
            />
            <Controller
              control={control}
              name="trackStock"
              render={({ field: { value: trackStock } }) =>
                trackStock ? (
                  <>
                    <div className={FORM_GRID}>
                      <Field label="Estoque mínimo" error={errors.minStock?.message}>
                        <input
                          disabled={readOnly}
                          type="number"
                          min={0}
                          step="0.001"
                          placeholder="0"
                          className={errors.minStock ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                          {...register('minStock')}
                        />
                      </Field>
                      <Field label="SKU" error={errors.sku?.message}>
                        <input
                          disabled={readOnly}
                          placeholder="Código interno"
                          className={errors.sku ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                          {...register('sku')}
                        />
                      </Field>
                    </div>
                    <Field label="Código de barras" error={errors.barcode?.message}>
                      <input
                        disabled={readOnly}
                        placeholder="EAN / código de barras"
                        className={errors.barcode ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                        {...register('barcode')}
                      />
                    </Field>
                  </>
                ) : null
              }
            />
          </div>

          {!readOnly && (
            <div className={FORM_FOOTER}>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 flex-1 rounded-xl bg-surface-2 py-3 text-sm font-bold text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-fg disabled:opacity-50"
              >
                {saving ? 'Salvando…' : product ? 'Salvar alterações' : 'Cadastrar produto'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
