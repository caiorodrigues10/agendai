import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Loader2,
  Search,
  Tag,
  X,
} from 'lucide-react';
import { giftCardsApi, GiftCard, GiftCardUsage } from '../../infra/giftCardsApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  PARTIALLY_USED: 'Parcialmente usado',
  EXHAUSTED: 'Esgotado',
  EXPIRED: 'Expirado',
  CANCELED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PARTIALLY_USED: 'bg-yellow-100 text-yellow-700',
  EXHAUSTED: 'bg-gray-100 text-gray-600',
  EXPIRED: 'bg-red-100 text-red-700',
  CANCELED: 'bg-red-100 text-red-600',
};

interface PurchaseForm {
  initialBalance: string;
  buyerName: string;
  buyerPhone: string;
  recipientName: string;
  recipientPhone: string;
  expiresAt: string;
}

const INITIAL_FORM: PurchaseForm = {
  initialBalance: '',
  buyerName: '',
  buyerPhone: '',
  recipientName: '',
  recipientPhone: '',
  expiresAt: '',
};

export const GiftCardsPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();

  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'list' | 'purchase' | 'lookup'>('list');

  // Purchase form
  const [form, setForm] = useState<PurchaseForm>(INITIAL_FORM);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<GiftCard | null>(null);

  // Lookup
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<GiftCard | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Detail
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [usages, setUsages] = useState<GiftCardUsage[]>([]);
  const [usagesLoading, setUsagesLoading] = useState(false);

  // Redeem
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemNotes, setRedeemNotes] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Cancel
  const [cancelling, setCancelling] = useState(false);

  const loadCards = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await giftCardsApi.list(barbershopId);
      setCards(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handlePurchase = async () => {
    if (!barbershopId) return;
    const balance = parseFloat(form.initialBalance);
    if (isNaN(balance) || balance <= 0) {
      setPurchaseError('Valor deve ser maior que zero');
      return;
    }
    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);
    try {
      const card = await giftCardsApi.purchase(barbershopId, {
        initialBalance: balance,
        buyerName: form.buyerName || undefined,
        buyerPhone: form.buyerPhone || undefined,
        recipientName: form.recipientName || undefined,
        recipientPhone: form.recipientPhone || undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      });
      setPurchaseSuccess(card);
      setForm(INITIAL_FORM);
      loadCards();
    } catch (err) {
      setPurchaseError(getErrorMessage(err));
    } finally {
      setPurchasing(false);
    }
  };

  const handleLookup = async () => {
    if (!barbershopId || !lookupCode.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    try {
      const card = await giftCardsApi.lookupByCode(barbershopId, lookupCode.trim());
      setLookupResult(card);
    } catch (err) {
      setLookupError(getErrorMessage(err));
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSelectCard = async (card: GiftCard) => {
    setSelectedCard(card);
    setRedeemAmount('');
    setRedeemNotes('');
    setUsagesLoading(true);
    try {
      const data = await giftCardsApi.getUsages(barbershopId!, card.id);
      setUsages(data);
    } catch {
      setUsages([]);
    } finally {
      setUsagesLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!barbershopId || !selectedCard) return;
    const amount = parseFloat(redeemAmount);
    if (isNaN(amount) || amount <= 0) return;
    setRedeeming(true);
    try {
      const updated = await giftCardsApi.redeem(barbershopId, selectedCard.id, {
        amount,
        notes: redeemNotes || undefined,
      });
      setSelectedCard(updated);
      setRedeemAmount('');
      setRedeemNotes('');
      const data = await giftCardsApi.getUsages(barbershopId, selectedCard.id);
      setUsages(data);
      loadCards();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRedeeming(false);
    }
  };

  const handleCancel = async () => {
    if (!barbershopId || !selectedCard) return;
    setCancelling(true);
    try {
      const updated = await giftCardsApi.cancel(barbershopId, selectedCard.id);
      setSelectedCard(updated);
      loadCards();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="rounded-2xl border border-border bg-surface p-2 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.7)]">
        <div className="grid gap-2 sm:grid-cols-3">
        <button
          onClick={() => setTab('list')}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${tab === 'list' ? 'bg-accent text-accent-fg shadow-md shadow-accent/15' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
        >
          <Tag className="h-4 w-4" />
          Lista
        </button>
        <button
          onClick={() => setTab('purchase')}
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-bold transition ${tab === 'purchase' ? 'bg-accent text-accent-fg shadow-md shadow-accent/15' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
        >
          Criar Gift Card
        </button>
        <button
          onClick={() => setTab('lookup')}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${tab === 'lookup' ? 'bg-accent text-accent-fg shadow-md shadow-accent/15' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
        >
          <Search className="h-4 w-4" />
          Consultar
        </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* LIST TAB */}
      {tab === 'list' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
          ) : cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
              <Tag className="mx-auto mb-3 h-8 w-8 text-accent" />
              <p className="text-sm font-bold text-text-primary">Nenhum gift card encontrado</p>
              <p className="mt-1 text-sm text-text-secondary">
                Crie um gift card ou consulte um código existente para acompanhar o saldo.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => { setTab('list'); handleSelectCard(card); }}
                  className="w-full text-left bg-white border rounded-lg px-4 py-3 hover:border-indigo-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-sm font-bold">{card.code}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[card.status] || 'bg-gray-100'}`}>
                        {STATUS_LABELS[card.status] || card.status}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{fmt(Number(card.currentBalance))}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {card.recipientName && `Para: ${card.recipientName}`}
                    {card.buyerName && ` · Comprador: ${card.buyerName}`}
                    {` · Comprado: ${formatDate(card.purchasedAt)}`}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Detail */}
          {selectedCard && (
            <div className="mt-4 bg-white border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{selectedCard.code}</h3>
                <button onClick={() => setSelectedCard(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Saldo: <strong>{fmt(Number(selectedCard.currentBalance))}</strong></div>
                <div>Inicial: {fmt(Number(selectedCard.initialBalance))}</div>
                <div>Status: <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedCard.status]}`}>{STATUS_LABELS[selectedCard.status]}</span></div>
                <div>Expira: {formatDate(selectedCard.expiresAt)}</div>
                {selectedCard.buyerName && <div>Comprador: {selectedCard.buyerName}</div>}
                {selectedCard.recipientName && <div>Destinatário: {selectedCard.recipientName}</div>}
              </div>

              {/* Redeem */}
              {selectedCard.status !== 'EXHAUSTED' && selectedCard.status !== 'CANCELED' && selectedCard.status !== 'EXPIRED' && (
                <div className="border-t pt-3 space-y-2">
                  <h4 className="font-medium text-sm">Utilizar saldo</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Valor"
                      value={redeemAmount}
                      onChange={e => setRedeemAmount(e.target.value)}
                      className="border rounded px-2 py-1 text-sm w-32"
                      min="0.01"
                      step="0.01"
                    />
                    <input
                      type="text"
                      placeholder="Observação"
                      value={redeemNotes}
                      onChange={e => setRedeemNotes(e.target.value)}
                      className="border rounded px-2 py-1 text-sm flex-1"
                    />
                    <button
                      onClick={handleRedeem}
                      disabled={redeeming || !redeemAmount}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Utilizar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel */}
              {selectedCard.status !== 'CANCELED' && selectedCard.status !== 'EXHAUSTED' && (
                <div className="border-t pt-3">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="text-red-600 text-sm hover:underline disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelando...' : 'Cancelar gift card'}
                  </button>
                </div>
              )}

              {/* Usages */}
              <div className="border-t pt-3">
                <h4 className="font-medium text-sm mb-2">Histórico de uso</h4>
                {usagesLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : usages.length === 0 ? (
                  <p className="text-gray-400 text-xs">Nenhum uso registrado.</p>
                ) : (
                  <div className="space-y-1">
                    {usages.map(u => (
                      <div key={u.id} className="text-xs text-gray-600 flex justify-between">
                        <span>{formatDate(u.createdAt)}{u.notes && ` - ${u.notes}`}</span>
                        <span className="font-medium">{fmt(Number(u.amount))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PURCHASE TAB */}
      {tab === 'purchase' && (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <h3 className="font-bold">Criar Gift Card</h3>

          {purchaseSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              Gift card criado! Código: <strong className="font-mono">{purchaseSuccess.code}</strong>
              <button onClick={() => setPurchaseSuccess(null)} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          {purchaseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {purchaseError}
            </div>
          )}

          <Field label="Valor (R$) *">
            <input
              type="number"
              className={FIELD_CONTROL}
              value={form.initialBalance}
              onChange={e => setForm(f => ({ ...f, initialBalance: e.target.value }))}
              placeholder="0.00"
              min="0.01"
              step="0.01"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome do comprador">
              <input
                type="text"
                className={FIELD_CONTROL}
                value={form.buyerName}
                onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))}
              />
            </Field>
            <Field label="Telefone do comprador">
              <input
                type="text"
                className={FIELD_CONTROL}
                value={form.buyerPhone}
                onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome do destinatário">
              <input
                type="text"
                className={FIELD_CONTROL}
                value={form.recipientName}
                onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
              />
            </Field>
            <Field label="Telefone do destinatário">
              <input
                type="text"
                className={FIELD_CONTROL}
                value={form.recipientPhone}
                onChange={e => setForm(f => ({ ...f, recipientPhone: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Data de expiração (opcional)">
            <input
              type="date"
              className={FIELD_CONTROL}
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
            />
          </Field>

          <div className={FORM_FOOTER}>
            <button
              onClick={handlePurchase}
              disabled={purchasing || !form.initialBalance}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {purchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
              Criar Gift Card
            </button>
          </div>
        </div>
      )}

      {/* LOOKUP TAB */}
      {tab === 'lookup' && (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <h3 className="font-bold">Consultar por código</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Código do gift card"
              value={lookupCode}
              onChange={e => setLookupCode(e.target.value.toUpperCase())}
              className="border rounded px-3 py-2 text-sm font-mono flex-1"
              maxLength={30}
            />
            <button
              onClick={handleLookup}
              disabled={lookupLoading || !lookupCode.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Consultar
            </button>
          </div>

          {lookupError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {lookupError}
            </div>
          )}

          {lookupResult && (
            <div className="bg-gray-50 border rounded-lg p-3 space-y-1 text-sm">
              <div className="font-mono font-bold">{lookupResult.code}</div>
              <div>Saldo: <strong>{fmt(Number(lookupResult.currentBalance))}</strong> / {fmt(Number(lookupResult.initialBalance))}</div>
              <div>Status: <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[lookupResult.status]}`}>{STATUS_LABELS[lookupResult.status]}</span></div>
              <div>Comprado em: {formatDate(lookupResult.purchasedAt)}</div>
              {lookupResult.expiresAt && <div>Expira em: {formatDate(lookupResult.expiresAt)}</div>}
              {lookupResult.recipientName && <div>Destinatário: {lookupResult.recipientName}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
