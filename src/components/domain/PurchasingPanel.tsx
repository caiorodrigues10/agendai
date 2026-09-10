import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Loader2,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import { purchasingApi, PurchaseOrder, PurchaseOrderItem } from '../../infra/purchasingApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';

export const PurchasingPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSupplier, setNewSupplier] = useState('');
  const [newExpectedDate, setNewExpectedDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newItems, setNewItems] = useState<{ name: string; quantity: number; unitPrice: number }[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);

  useEffect(() => {
    if (!barbershopId) return;
    setLoading(true);
    purchasingApi
      .listOrders(barbershopId, statusFilter ? { status: statusFilter } : undefined)
      .then(setOrders)
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar pedidos.')))
      .finally(() => setLoading(false));
  }, [barbershopId, statusFilter]);

  const handleCreateOrder = async () => {
    if (!barbershopId || !newSupplier.trim()) return;
    setCreating(true);
    setError('');
    try {
      const order = await purchasingApi.createOrder(barbershopId, {
        supplier: newSupplier.trim(),
        expectedDate: newExpectedDate || undefined,
        notes: newNotes.trim() || undefined,
        items: newItems,
      });
      setOrders(prev => [order, ...prev]);
      setShowCreate(false);
      setNewSupplier('');
      setNewExpectedDate('');
      setNewNotes('');
      setNewItems([]);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar pedido.'));
    } finally {
      setCreating(false);
    }
  };

  const handleAddItem = () => {
    if (!itemName.trim()) return;
    setNewItems(prev => [...prev, { name: itemName.trim(), quantity: itemQty, unitPrice: itemPrice }]);
    setItemName('');
    setItemQty(1);
    setItemPrice(0);
  };

  const handleRemoveItem = (idx: number) => {
    setNewItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleReceiveOrder = async (orderId: string) => {
    if (!barbershopId) return;
    try {
      const updated = await purchasingApi.receiveOrder(barbershopId, orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao receber pedido.'));
    }
  };

  const handleReceiveItem = async (orderId: string, itemId: string) => {
    if (!barbershopId) return;
    try {
      const item = selectedOrder?.items.find(i => i.id === itemId);
      if (!item) return;
      const remaining = item.quantity - item.received;
      const updated = await purchasingApi.receiveItem(barbershopId, orderId, itemId, { quantity: remaining });
      setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o;
        return { ...o, items: o.items.map(i => i.id === itemId ? updated : i) };
      }));
      setSelectedOrder(prev => {
        if (!prev || prev.id !== orderId) return prev;
        return { ...prev, items: prev.items.map(i => i.id === itemId ? updated : i) };
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao receber item.'));
    }
  };

  const statusColor = (s: string) => {
    if (s === 'RECEIVED') return 'bg-success/15 text-success';
    if (s === 'PARTIAL') return 'bg-warning/15 text-warning';
    return 'bg-surface-2 text-text-muted';
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Compras</h3>
        <button
          onClick={() => { setShowCreate(!showCreate); setSelectedOrder(null); }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
        >
          <Plus size={16} /> Novo Pedido
        </button>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {showCreate && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <input
            type="text"
            placeholder="Fornecedor"
            value={newSupplier}
            onChange={e => setNewSupplier(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={newExpectedDate}
              onChange={e => setNewExpectedDate(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary"
            />
            <input
              type="text"
              placeholder="Notas (opcional)"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-text-secondary">Itens</p>
            {newItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-xl bg-surface-2 p-2">
                <span className="flex-1 text-xs text-text-primary">{item.name} x{item.quantity}</span>
                <span className="text-xs text-text-muted">R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                <button onClick={() => handleRemoveItem(idx)} className="text-text-muted hover:text-error">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome"
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <input
                type="number"
                min={1}
                value={itemQty}
                onChange={e => setItemQty(Number(e.target.value))}
                className="w-16 rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-primary"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={itemPrice}
                onChange={e => setItemPrice(Number(e.target.value))}
                className="w-20 rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-primary"
              />
              <button onClick={handleAddItem} className="rounded-lg bg-surface-2 p-2 text-text-secondary hover:bg-surface">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => void handleCreateOrder()}
              disabled={creating || !newSupplier.trim()}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {['', 'PENDING', 'PARTIAL', 'RECEIVED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              statusFilter === s ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {s === '' ? 'Todos' : s}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <ShoppingCart size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-secondary">Nenhum pedido de compra.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div
              key={order.id}
              className={`rounded-2xl border bg-surface p-3 transition-colors cursor-pointer ${
                selectedOrder?.id === order.id ? 'border-accent' : 'border-border hover:border-accent/50'
              }`}
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">{order.supplier}</p>
                  <p className="text-xs text-text-muted">
                    {order.items.length} itens · {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-accent">R$ {order.totalAmount.toFixed(2)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-surface-2 p-2">
                      <div>
                        <p className="text-xs font-bold text-text-primary">{item.name}</p>
                        <p className="text-[10px] text-text-muted">
                          {item.quantity} x R$ {item.unitPrice.toFixed(2)} · Recebido: {item.received}
                        </p>
                      </div>
                      {item.received < item.quantity && order.status !== 'RECEIVED' && (
                        <button
                          onClick={e => { e.stopPropagation(); void handleReceiveItem(order.id, item.id); }}
                          className="flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[10px] font-bold text-success hover:bg-success/20"
                        >
                          <PackageCheck size={10} /> Receber
                        </button>
                      )}
                    </div>
                  ))}
                  {order.status !== 'RECEIVED' && (
                    <button
                      onClick={e => { e.stopPropagation(); void handleReceiveOrder(order.id); }}
                      className="flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-xs font-bold text-white hover:bg-success/90"
                    >
                      <CheckCircle2 size={14} /> Receber Tudo
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
