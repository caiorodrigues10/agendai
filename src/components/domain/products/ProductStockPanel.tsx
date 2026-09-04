import React, { useCallback, useEffect, useState } from 'react';
import { productsApi, type InventoryReceipt, type Product, type Supplier } from '../../../infra/productsApi';
import { SmartSelect } from '../../ui/SmartSelect';
import { getErrorMessage } from '../../../utils/errorMessage';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { MOVEMENT_LABEL, productMoney } from './productMoney';

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
  const [newSupplier, setNewSupplier] = useState('');
  const [reverseReceipt, setReverseReceipt] = useState<InventoryReceipt | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, sups, mov, rec] = await Promise.all([
        productsApi.listProducts({ limit: 200 }),
        productsApi.listSuppliers(),
        productsApi.listMovements({ page: 1, limit: 20 }),
        productsApi.listReceipts({ page: 1, limit: 20 }),
      ]);
      setProducts(list.data);
      setSuppliers(sups);
      setMovements(mov.data);
      setReceipts(rec.data);
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível carregar estoque.'), 'error');
    }
  }, [onNotify]);

  useEffect(() => { void load(); }, [load]);

  if (loadError) return <p className="text-sm text-danger">{loadError}</p>;

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

  return (
    <div className="space-y-4">
      <form
        className="space-y-2 rounded-xl border border-border bg-surface p-4"
        onSubmit={async e => {
          e.preventDefault();
          const form = e.currentTarget;
          const productId = (form.elements.namedItem('productId') as HTMLSelectElement).value;
          const quantity = Number((form.elements.namedItem('quantity') as HTMLInputElement).value);
          const unitCost = Number((form.elements.namedItem('unitCost') as HTMLInputElement).value);
          try {
            await productsApi.createReceipt({
              items: [{ productId, quantity, unitCost }],
              supplierId: supplierId || null,
              createExpense: true,
            });
            onNotify?.('Compra registrada e estoque atualizado.', 'success');
            await load();
            onReload();
            form.reset();
          } catch (err) {
            onNotify?.(getErrorMessage(err, 'Não foi possível registrar a compra.'), 'error');
          }
        }}
      >
        <p className="font-bold text-text-primary">Entrada de mercadoria</p>
        <select name="productId" required className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary">
          {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input name="quantity" type="number" min={0.01} step="0.01" required placeholder="Qtd" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm" />
          <input name="unitCost" type="number" min={0} step="0.01" required placeholder="Custo unitário" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm" />
        </div>
        <SmartSelect
          label="Fornecedor"
          value={supplierId || null}
          onChange={value => setSupplierId(value ?? '')}
          options={[{ value: '', label: 'Sem fornecedor' }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]}
          searchable="auto"
        />
        <div className="flex gap-2">
          <input value={newSupplier} onChange={e => setNewSupplier(e.target.value)} placeholder="Novo fornecedor" className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary" />
          <button type="button" onClick={() => void addSupplier()} className="rounded-lg border border-border px-3 text-xs font-bold text-text-secondary">Adicionar</button>
        </div>
        <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg">Confirmar compra</button>
      </form>

      <form
        className="space-y-2 rounded-xl border border-border bg-surface p-4"
        onSubmit={async e => {
          e.preventDefault();
          const form = e.currentTarget;
          const productId = (form.elements.namedItem('adjProductId') as HTMLSelectElement).value;
          const quantity = Number((form.elements.namedItem('adjQty') as HTMLInputElement).value);
          const reason = (form.elements.namedItem('adjReason') as HTMLInputElement).value;
          const type = (form.elements.namedItem('adjType') as HTMLSelectElement).value as 'MANUAL_ADJUSTMENT' | 'INTERNAL_CONSUMPTION';
          try {
            await productsApi.adjustStock({ productId, quantity, reason, type });
            onNotify?.('Estoque ajustado.', 'success');
            await load();
            onReload();
            form.reset();
          } catch (err) {
            onNotify?.(getErrorMessage(err, 'Não foi possível ajustar o estoque.'), 'error');
          }
        }}
      >
        <p className="font-bold text-text-primary">Ajuste / consumo interno</p>
        <select name="adjProductId" required className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary">
          {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input name="adjQty" type="number" step="0.001" required placeholder="Qtd (+/-)" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm" />
          <select name="adjType" className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary">
            <option value="MANUAL_ADJUSTMENT">Ajuste manual</option>
            <option value="INTERNAL_CONSUMPTION">Consumo interno</option>
          </select>
        </div>
        <input name="adjReason" required minLength={3} placeholder="Motivo" className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary" />
        <button type="submit" className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text-secondary">Aplicar ajuste</button>
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
          <input value={reverseReason} onChange={e => setReverseReason(e.target.value)} placeholder="Motivo do estorno" className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary" />
        </div>
      )}
    </div>
  );
};
