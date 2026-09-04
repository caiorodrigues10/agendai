import React, { useEffect, useMemo, useState } from 'react';
import { productsApi, RetailPaymentMethod, type Product } from '../../infra/productsApi';
import { clientsApi } from '../../infra/clientsApi';
import type { SalonClient } from '../../types';
import { SmartSelect } from '../ui/SmartSelect';
import { getErrorMessage } from '../../utils/errorMessage';
import { productMoney } from './products/productMoney';

export interface RetailCartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface Props {
  canOverridePrice?: boolean;
  requireClientForFiado?: boolean;
  defaultClientId?: string | null;
  onChange: (payload: {
    paymentMethod: RetailPaymentMethod;
    items: { productId: string; quantity: number; unitPrice?: number }[];
    clientId?: string;
    total: number;
  } | null) => void;
}

const METHODS: { value: RetailPaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit_card', label: 'Crédito' },
  { value: 'debit_card', label: 'Débito' },
  { value: 'fiado', label: 'Fiado' },
];

export const RetailCheckoutBlock: React.FC<Props> = ({
  canOverridePrice,
  requireClientForFiado,
  defaultClientId,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<RetailCartItem[]>([]);
  const [method, setMethod] = useState<RetailPaymentMethod>('pix');
  const [clientId, setClientId] = useState<string | null>(defaultClientId ?? null);
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultClientId) setClientId(defaultClientId);
  }, [defaultClientId]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      productsApi.listProducts({ search, forSale: 'true', active: 'true', limit: 30 })
        .then(res => setProducts(res.data))
        .catch(err => setError(getErrorMessage(err, 'Não foi possível buscar produtos.')));
    }, 200);
    return () => clearTimeout(t);
  }, [open, search]);

  useEffect(() => {
    if (!open || method !== 'fiado') return;
    const t = setTimeout(() => {
      clientsApi.list({ search: clientSearch, limit: 20 })
        .then(res => setClients(res.data))
        .catch(() => setClients([]));
    }, 200);
    return () => clearTimeout(t);
  }, [open, method, clientSearch]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [cart]);

  useEffect(() => {
    if (!open || cart.length === 0) {
      onChange(null);
      return;
    }
    if (requireClientForFiado && method === 'fiado' && !clientId) {
      onChange(null);
      return;
    }
    onChange({
      paymentMethod: method,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: canOverridePrice ? item.unitPrice : undefined,
      })),
      clientId: clientId ?? undefined,
      total,
    });
  }, [open, cart, method, total, canOverridePrice, onChange, clientId, requireClientForFiado]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full rounded-xl border border-dashed border-border bg-bg px-4 py-3 text-sm font-semibold text-text-primary">
        Cliente comprou produtos?
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-bg p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-primary">Produtos</p>
        <button type="button" className="text-xs text-text-muted" onClick={() => { setOpen(false); setCart([]); }}>Remover</button>
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nome, SKU ou código"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
      />
      <div className="max-h-40 space-y-1 overflow-y-auto">
        {products.map(product => (
          <button
            key={product.id}
            type="button"
            onClick={() => setCart(prev => {
              const existing = prev.find(item => item.product.id === product.id);
              if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
              return [...prev, { product, quantity: 1, unitPrice: product.salePrice }];
            })}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-surface"
          >
            <span className="text-text-primary">{product.name}</span>
            <span className="text-text-muted">{productMoney.format(product.salePrice)}</span>
          </button>
        ))}
      </div>
      {cart.map(item => (
        <div key={item.product.id} className="flex items-center gap-2 text-sm">
          <span className="flex-1 text-text-primary">{item.product.name}</span>
          <input type="number" min={1} value={item.quantity} onChange={e => setCart(prev => prev.map(row => row.product.id === item.product.id ? { ...row, quantity: Number(e.target.value) } : row))} className="w-16 rounded border border-border bg-surface px-2 py-1" />
          {canOverridePrice && (
            <input type="number" min={0} value={item.unitPrice} onChange={e => setCart(prev => prev.map(row => row.product.id === item.product.id ? { ...row, unitPrice: Number(e.target.value) } : row))} className="w-20 rounded border border-border bg-surface px-2 py-1" />
          )}
        </div>
      ))}
      <SmartSelect
        label="Pagamento dos produtos"
        value={method}
        onChange={value => setMethod((value ?? 'pix') as RetailPaymentMethod)}
        options={METHODS}
      />
      {method === 'fiado' && (
        <div className="space-y-2">
          <input
            value={clientSearch}
            onChange={e => setClientSearch(e.target.value)}
            placeholder="Buscar cliente"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          />
          <SmartSelect
            label="Cliente (obrigatório no fiado)"
            value={clientId}
            onChange={value => setClientId(value)}
            options={clients.map(c => ({ value: c.id, label: c.name }))}
            searchable="auto"
          />
        </div>
      )}
      <div className="flex justify-between text-sm font-bold text-text-primary">
        <span>Produtos</span>
        <span>{productMoney.format(total)}</span>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};
