import React, { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi, type InventoryReceipt, type Product, type Supplier } from '../../../infra/productsApi';
import { SmartSelect } from '../../ui/SmartSelect';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_GRID } from '../../ui/Field';
import { getErrorMessage } from '../../../utils/errorMessage';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { MOVEMENT_LABEL, PRODUCT_PURPOSE_SHORT, productMoney } from './productMoney';
import { formatStockQty } from './productStock';
import { StockReceiptSchema, StockReceiptFormData, StockAdjustmentSchema, StockAdjustmentFormData } from '../../../schemas';

interface Props {
  loadError: string | null;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onReload: () => void;
}

export const ProductStockPanel: React.FC<Props> = ({ loadError, onNotify, onReload }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<Awaited<ReturnType<typeof productsApi.listMovements>>['data']>([]);
  const [receipts, setReceipts] = useState<InventoryReceipt[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [adjProductId, setAdjProductId] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [reverseReceipt, setReverseReceipt] = useState<InventoryReceipt | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const {
    register: registerReceipt,
    handleSubmit: handleReceiptSubmit,
    control: receiptControl,
    formState: { errors: receiptErrors },
    reset: resetReceipt,
  } = useForm<StockReceiptFormData>({
    resolver: zodResolver(StockReceiptSchema),
    defaultValues: { productId: '', quantity: 1, unitCost: 0, supplierId: '' },
  });

  const {
    register: registerAdj,
    handleSubmit: handleAdjSubmit,
    control: adjControl,
    formState: { errors: adjErrors },
    reset: resetAdj,
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(StockAdjustmentSchema),
    defaultValues: { productId: '', quantity: 0, type: 'MANUAL_ADJUSTMENT', reason: '' },
  });

  const load = useCallback(async () => {
    try {
      const [list, sups, mov, rec] = await Promise.all([
        productsApi.listProducts({ limit: 100 }),
        productsApi.listSuppliers(),
        productsApi.listMovements({ page: 1, limit: 20 }),
        productsApi.listReceipts({ page: 1, limit: 20 }),
      ]);
      setProducts(list.data);
      setSuppliers(sups);
      setMovements(mov.data);
      setReceipts(rec.data);
      if (list.data.length) {
        setAdjProductId(prev => prev || list.data[0].id);
      }
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível carregar estoque.'), 'error');
    }
  }, [onNotify]);

  useEffect(() => { void load(); }, [load]);

  if (loadError) return <p className="text-sm text-danger">{loadError}</p>;

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.name} · ${PRODUCT_PURPOSE_SHORT[p.type]}`,
  }));

  const addSupplier = async () => {
    if (!newSupplier.trim()) return;
    try {
      const created = await productsApi.createSupplier({ name: newSupplier.trim() });
      setSuppliers(prev => [...prev, created]);
      setSupplierId(created.id);
      setNewSupplier('');
      onNotify?.('Fornecedor cadastrado.', 'success');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível cadastrar fornecedor.'), 'error');
    }
  };

  const onReceiptSubmit = async (data: StockReceiptFormData) => {
    try {
      await productsApi.createReceipt({
        items: [{ productId: data.productId, quantity: data.quantity, unitCost: data.unitCost }],
        supplierId: data.supplierId || null,
        createExpense: true,
      });
      onNotify?.('Compra registrada e estoque atualizado.', 'success');
      resetReceipt({ productId: products[0]?.id ?? '', quantity: 1, unitCost: 0, supplierId: '' });
      await load();
      onReload();
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível registrar a compra.'), 'error');
    }
  };

  const onAdjSubmit = async (data: StockAdjustmentFormData) => {
    try {
      await productsApi.adjustStock({ productId: data.productId, quantity: data.quantity, reason: data.reason, type: data.type });
      onNotify?.('Estoque ajustado.', 'success');
      resetAdj({ productId: products[0]?.id ?? '', quantity: 0, type: 'MANUAL_ADJUSTMENT', reason: '' });
      await load();
      onReload();
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível ajustar o estoque.'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-2 font-bold text-text-primary">Produtos em estoque</p>
        <div className="space-y-2 text-sm">
          {products.map(p => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text-primary">{p.name}</span>
                  <span className="inline-flex rounded-lg border border-border bg-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                    {PRODUCT_PURPOSE_SHORT[p.type]}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {formatStockQty(p.stockQty, p.unit)}
                  {p.minStock > 0 ? ` · mín ${p.minStock}` : ''}
                </p>
              </div>
            </div>
          ))}
          {!products.length && <p className="text-text-muted">Nenhum produto cadastrado.</p>}
        </div>
      </div>

      <form
        onSubmit={handleReceiptSubmit(onReceiptSubmit)}
        className="space-y-4 rounded-xl border border-border bg-surface p-4"
      >
        <p className="font-bold text-text-primary">Entrada de mercadoria</p>
        <Controller
          control={receiptControl}
          name="productId"
          render={({ field, fieldState }) => (
            <SmartSelect
              label="Produto"
              value={field.value || null}
              onChange={value => field.onChange(value ?? '')}
              error={fieldState.error?.message}
              options={productOptions}
              searchable="auto"
            />
          )}
        />
        <div className={FORM_GRID}>
          <Field label="Quantidade" error={receiptErrors.quantity?.message}>
            <input type="number" min={0.01} step="0.01" placeholder="0" className={receiptErrors.quantity ? FIELD_CONTROL_ERROR : FIELD_CONTROL} {...registerReceipt('quantity')} />
          </Field>
          <Field label="Custo unitário (R$)" error={receiptErrors.unitCost?.message}>
            <input type="number" min={0} step="0.01" placeholder="0,00" className={receiptErrors.unitCost ? FIELD_CONTROL_ERROR : FIELD_CONTROL} {...registerReceipt('unitCost')} />
          </Field>
        </div>
        <Controller
          control={receiptControl}
          name="supplierId"
          render={({ field }) => (
            <SmartSelect
              label="Fornecedor"
              value={field.value || null}
              onChange={value => field.onChange(value ?? '')}
              options={[{ value: '', label: 'Sem fornecedor' }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]}
              searchable="auto"
            />
          )}
        />
        <div className="flex gap-2">
          <input
            value={newSupplier}
            onChange={e => setNewSupplier(e.target.value)}
            placeholder="Novo fornecedor"
            className={`${FIELD_CONTROL} flex-1`}
          />
          <button type="button" onClick={() => void addSupplier()} className="min-h-11 shrink-0 rounded-lg border border-border px-3 text-xs font-bold text-text-secondary">
            Adicionar
          </button>
        </div>
        <button type="submit" className="min-h-11 w-full rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg">
          Confirmar compra
        </button>
      </form>

      <form
        onSubmit={handleAdjSubmit(onAdjSubmit)}
        className="space-y-4 rounded-xl border border-border bg-surface p-4"
      >
        <p className="font-bold text-text-primary">Ajuste / consumo interno</p>
        <Controller
          control={adjControl}
          name="productId"
          render={({ field, fieldState }) => (
            <SmartSelect
              label="Produto"
              value={field.value || null}
              onChange={value => field.onChange(value ?? '')}
              error={fieldState.error?.message}
              options={productOptions}
              searchable="auto"
            />
          )}
        />
        <div className={FORM_GRID}>
          <Field label="Quantidade" hint="Use valor negativo para saída" error={adjErrors.quantity?.message}>
            <input type="number" step="0.001" placeholder="+/- 0" className={adjErrors.quantity ? FIELD_CONTROL_ERROR : FIELD_CONTROL} {...registerAdj('quantity')} />
          </Field>
          <Controller
            control={adjControl}
            name="type"
            render={({ field }) => (
              <Field label="Tipo" error={adjErrors.type?.message}>
                <SmartSelect
                  value={field.value}
                  onChange={value => field.onChange(value ?? 'MANUAL_ADJUSTMENT')}
                  options={[
                    { value: 'MANUAL_ADJUSTMENT', label: 'Ajuste manual' },
                    { value: 'INTERNAL_CONSUMPTION', label: 'Consumo interno' },
                  ]}
                  searchable
                  clearable={false}
                />
              </Field>
            )}
          />
        </div>
        <Field label="Motivo" error={adjErrors.reason?.message}>
          <input placeholder="Descreva o motivo do ajuste" className={adjErrors.reason ? FIELD_CONTROL_ERROR : FIELD_CONTROL} {...registerAdj('reason')} />
        </Field>
        <button type="submit" className="min-h-11 w-full rounded-xl border border-border px-4 py-2 text-sm font-bold text-text-secondary">
          Aplicar ajuste
        </button>
      </form>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-2 font-bold text-text-primary">Movimentações recentes</p>
        <div className="space-y-2 text-sm">
          {movements.map(m => (
            <div key={m.id} className="flex justify-between gap-2 border-b border-border pb-2">
              <span className="text-text-primary">{m.product?.name ?? 'Produto'}</span>
              <span className="text-text-muted">{MOVEMENT_LABEL[m.type] ?? m.type} · {m.quantity > 0 ? '+' : ''}{m.quantity}</span>
            </div>
          ))}
          {!movements.length && <p className="text-text-muted">Sem movimentações.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-2 font-bold text-text-primary">Compras registradas</p>
        <div className="space-y-2 text-sm">
          {receipts.map(r => (
            <div key={r.id} className="rounded-lg border border-border bg-bg p-3">
              <div className="flex justify-between">
                <span className="font-semibold text-text-primary">{productMoney.format(r.total)}</span>
                <span className="text-xs text-text-muted">{new Date(r.receivedAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-xs text-text-secondary">{r.supplier?.name ?? r.supplierName ?? 'Sem fornecedor'}</p>
              {!r.reversedAt && (
                <button type="button" className="mt-2 text-xs font-bold text-danger" onClick={() => setReverseReceipt(r)}>Estornar compra</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(reverseReceipt)}
        title="Estornar compra?"
        message="O estoque e a despesa vinculada serão revertidos."
        confirmLabel="Estornar"
        onCancel={() => { setReverseReceipt(null); setReverseReason(''); }}
        onConfirm={async () => {
          if (!reverseReceipt || reverseReason.trim().length < 3) {
            onNotify?.('Informe um motivo com pelo menos 3 caracteres.', 'error');
            return;
          }
          try {
            await productsApi.reverseReceipt(reverseReceipt.id, { reason: reverseReason.trim() });
            onNotify?.('Compra estornada.', 'success');
            setReverseReceipt(null);
            setReverseReason('');
            await load();
            onReload();
          } catch (err) {
            onNotify?.(getErrorMessage(err, 'Não foi possível estornar a compra.'), 'error');
          }
        }}
      />
      {reverseReceipt && (
        <div className="rounded-xl border border-border bg-surface p-3">
          <Field label="Motivo do estorno">
            <input value={reverseReason} onChange={e => setReverseReason(e.target.value)} placeholder="Descreva o motivo" className={FIELD_CONTROL} />
          </Field>
        </div>
      )}
    </div>
  );
};
