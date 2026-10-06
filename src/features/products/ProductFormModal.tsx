import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi, type Product, type ProductCategory, type ProductType, type StockUnit } from '../../infra/productsApi';
import { SmartSelect } from '../../components/ui/SmartSelect';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_FOOTER, FORM_GRID, FORM_SECTION_TITLE } from '../../components/ui/Field';
import { CurrencyInput } from '../../components/ui/CurrencyInput';
import { getErrorMessage } from '../../utils/errorMessage';
import { ProductSchema, ProductFormData } from '../../schemas';
import { PRODUCT_PURPOSE_LABEL } from './productMoney';
import { STOCK_UNIT_OPTIONS } from './productStock';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LuTrash2 as Trash2, LuUpload as Upload, LuX as X } from 'react-icons/lu';

const TITLE_CASE_EXCEPTIONS = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'para', 'com', 'sem', 'ou']);

const toTitleCase = (text: string): string =>
  text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, i) =>
      i === 0 || !TITLE_CASE_EXCEPTIONS.has(word.toLowerCase())
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase()
    )
    .join(' ');

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<ProductCategory | null>(null);
  const [deletingCat, setDeletingCat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      description: '',
      salePrice: 0,
      categoryId: '',
      imageUrl: '',
      type: defaultType,
      unit: 'UNIT',
      unitLabel: '',
      initialStock: 0,
      minStock: 0,
      trackStock: true,
      expirationDate: '',
      lotNumber: '',
    },
  });

  const productType = useWatch({ control, name: 'type' });
  const unitValue = useWatch({ control, name: 'unit' });
  const stockOnly = productType === 'CONSUMABLE';
  const showExpiration = productType === 'CONSUMABLE' || productType === 'BOTH';

  useEffect(() => {
    if (!open) return;
    setImagePreview(null);
    setImageFile(null);
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? '',
        salePrice: product.salePrice,
        categoryId: product.categoryId ?? '',
        imageUrl: product.imageUrl ?? '',
        type: product.type,
        unit: product.unit ?? 'UNIT',
        unitLabel: product.unitLabel,
        initialStock: product.stockQty ?? 0,
        minStock: product.minStock,
        trackStock: product.trackStock,
        expirationDate: product.expirationDate ?? '',
        lotNumber: product.lotNumber ?? '',
      });
      if (product.imageUrl) setImagePreview(product.imageUrl);
    } else {
      reset({
        name: '',
        description: '',
        salePrice: 0,
        categoryId: '',
        imageUrl: '',
        type: defaultType,
        unit: 'UNIT',
        unitLabel: '',
        initialStock: 0,
        minStock: 0,
        trackStock: true,
        expirationDate: '',
        lotNumber: '',
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
      const isRetail = data.type === 'RETAIL';
      const payload: Record<string, unknown> = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        salePrice: data.type === 'CONSUMABLE' ? 0 : data.salePrice,
        categoryId: data.categoryId || null,
        imageUrl: data.imageUrl || null,
        type: data.type,
        unit: data.unit,
        unitLabel: data.unit === 'OTHER' ? (data.unitLabel?.trim() || null) : undefined,
        minStock: data.minStock,
        trackStock: data.trackStock,
        expirationDate: isRetail ? null : (data.expirationDate || null),
        lotNumber: isRetail ? null : (data.lotNumber?.trim() || null),
      };
      // Estoque inicial só existe no cadastro e só quando o produto controla estoque.
      if (!product && data.trackStock) {
        payload.initialStock = Number(data.initialStock) || 0;
      }
      let savedId: string;
      if (product) {
        await productsApi.updateProduct(product.id, payload);
        savedId = product.id;
        // O saldo nunca é gravado direto no produto: a diferença vira ajuste auditado.
        if (data.trackStock && typeof product.stockQty === 'number') {
          const novo = Number(data.initialStock);
          const diff = novo - product.stockQty;
          const delta = Math.round(diff * 1000) / 1000;
          if (Number.isFinite(novo) && Math.abs(diff) > 0.0001 && delta !== 0) {
            try {
              await productsApi.adjustStock({
                productId: product.id,
                quantity: delta,
                reason: 'Ajuste de estoque pela edição do produto',
                type: 'MANUAL_ADJUSTMENT',
              });
            } catch (adjustErr) {
              const msg = getErrorMessage(adjustErr, 'Erro desconhecido');
              onNotify?.(`Produto salvo, mas não foi possível ajustar o estoque: ${msg}`, 'error');
              return;
            }
          }
        }
        onNotify?.('Produto atualizado.', 'success');
      } else {
        const created = await productsApi.createProduct(payload);
        savedId = created.id;
        onNotify?.('Produto cadastrado.', 'success');
      }
      if (imageFile && savedId) {
        try {
          const { imageUrl } = await productsApi.uploadProductImage(savedId, imageFile);
          await productsApi.updateProduct(savedId, { imageUrl });
        } catch (uploadErr) {
          console.error('[ProductForm] upload image failed:', uploadErr);
          const msg = uploadErr instanceof Error ? uploadErr.message : 'Erro desconhecido';
          onNotify?.(`Produto salvo, mas falhou o upload: ${msg}`, 'error');
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível salvar o produto.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = (fieldErrors: FieldErrors<ProductFormData>) => {
    const firstError = Object.values(fieldErrors).find(issue => issue?.message);
    onNotify?.(firstError?.message ?? 'Confira os campos destacados.', 'error');
  };

  const addCategory = async () => {
    if (!newCategory.trim() || readOnly) return;
    const formattedName = toTitleCase(newCategory);
    try {
      const created = await productsApi.createCategory({ name: formattedName });
      onCategoriesChange?.([...categories, created]);
      reset(prev => ({ ...prev, categoryId: created.id }));
      setNewCategory('');
      onNotify?.('Categoria criada.', 'success');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível criar a categoria.'), 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setDeletingCat(true);
    try {
      const result = await productsApi.deleteCategory(deleteCatTarget.id);
      onCategoriesChange?.(categories.filter(c => c.id !== deleteCatTarget.id));
      if (getValues('categoryId') === deleteCatTarget.id) {
        setValue('categoryId', '');
      }
      const msg = result.movedProducts > 0
        ? `Categoria excluída. ${result.movedProducts} produto(s) movido(s) para "Sem categoria".`
        : 'Categoria excluída.';
      onNotify?.(msg, 'success');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível excluir a categoria.'), 'error');
    } finally {
      setDeletingCat(false);
      setDeleteCatTarget(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onNotify?.('Imagem muito grande. Máximo: 5 MB.', 'error');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue('imageUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
            {!readOnly && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-secondary">Imagem do produto</label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-xl object-cover border border-border" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-danger-fg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
                  >
                    <Upload size={18} />
                    <span className="text-[10px] font-medium">Adicionar</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            )}
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
              <Controller
                control={control}
                name="salePrice"
                render={({ field }) => (
                  <Field label="Preço de venda" error={errors.salePrice?.message}>
                    <CurrencyInput
                      value={field.value}
                      onChangeValue={field.onChange}
                      disabled={readOnly}
                      error={!!errors.salePrice}
                      placeholder="0,00"
                    />
                  </Field>
                )}
              />
            )}
            <div className={FORM_GRID}>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <SmartSelect
                    label="Unidade"
                    disabled={readOnly}
                    value={field.value}
                    onChange={value => field.onChange(value ?? 'UNIT')}
                    options={[...STOCK_UNIT_OPTIONS]}
                    searchable={false}
                  />
                )}
              />
              {unitValue === 'OTHER' && (
                <Field label="Nome da unidade" error={errors.unitLabel?.message}>
                  <input
                    disabled={readOnly}
                    placeholder="Ex: frasco"
                    className={errors.unitLabel ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                    {...register('unitLabel')}
                  />
                </Field>
              )}
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <SmartSelect
                    label="Categoria"
                    disabled={readOnly}
                    value={field.value || null}
                    onChange={value => field.onChange(value ?? '')}
                    options={[{ value: '', label: 'Sem categoria' }, ...categories.map(c => ({ value: c.id, label: toTitleCase(c.name) }))]}
                    searchable="auto"
                  />
                )}
              />
            </div>
            {!readOnly && (
              <div className="space-y-2">
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
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(c => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-text-secondary"
                      >
                        {toTitleCase(c.name)}
                        <button
                          type="button"
                          onClick={() => setDeleteCatTarget(c)}
                          className="ml-0.5 rounded p-0.5 text-text-muted hover:bg-danger/15 hover:text-danger transition-colors"
                          title="Excluir categoria"
                        >
                          <Trash2 size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                    {!product && (
                      <Field
                        label="Estoque inicial"
                        hint="Quantidade que você tem agora. Depois, ajuste pela aba Estoque."
                        error={errors.initialStock?.message}
                      >
                        <input
                          disabled={readOnly}
                          type="number"
                          min={0}
                          step="0.001"
                          placeholder="0"
                          className={errors.initialStock ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                          {...register('initialStock')}
                        />
                      </Field>
                    )}
                    {product && typeof product.stockQty === 'number' && (
                      <Field
                        label="Estoque atual"
                        hint="Ao salvar, a diferença é registrada como ajuste manual no histórico do estoque."
                        error={errors.initialStock?.message}
                      >
                        <input
                          disabled={readOnly}
                          type="number"
                          min={0}
                          step="0.001"
                          placeholder="0"
                          className={errors.initialStock ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                          {...register('initialStock')}
                        />
                      </Field>
                    )}
                    <Field
                      label="Estoque mínimo"
                      hint="Avisa quando o estoque chegar nesse valor ou abaixo. Não altera a quantidade."
                      error={errors.minStock?.message}
                    >
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
                  </>
                ) : null
              }
            />
            {showExpiration && (
              <>
                <div className={FORM_GRID}>
                  <Field label="Data de validade" error={errors.expirationDate?.message}>
                    <input
                      disabled={readOnly}
                      type="date"
                      className={errors.expirationDate ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                      {...register('expirationDate')}
                    />
                  </Field>
                  <Field label="Lote" error={errors.lotNumber?.message}>
                    <input
                      disabled={readOnly}
                      placeholder="Opcional"
                      className={errors.lotNumber ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                      {...register('lotNumber')}
                    />
                  </Field>
                </div>
              </>
            )}
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
      <ConfirmDialog
        open={!!deleteCatTarget}
        title="Excluir categoria"
        message={
          deleteCatTarget
            ? `Excluir "${deleteCatTarget.name}"? Produtos vinculados perderão a categoria (não serão excluídos).`
            : ''
        }
        confirmLabel="Excluir"
        variant="danger"
        loading={deletingCat}
        onConfirm={() => void handleDeleteCategory()}
        onCancel={() => setDeleteCatTarget(null)}
      />
    </div>
  );
};
