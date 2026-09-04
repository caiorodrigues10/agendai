import React, { useCallback, useEffect, useRef, useState } from 'react';
import { productsApi, type RetailSale, type RetailSalePayload } from '../../../infra/productsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { RetailCheckoutBlock } from '../RetailCheckoutBlock';
import { getErrorMessage } from '../../../utils/errorMessage';
import { RefundSaleModal } from './RefundSaleModal';
import { PAYMENT_LABEL, productMoney, SALE_STATUS_LABEL } from './productMoney';

interface Props {
  canManage: boolean;
  canRefund: boolean;
  loadError: string | null;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onReload: () => void;
}

export const ProductSalesPanel: React.FC<Props> = ({ canManage, canRefund, loadError, onNotify, onReload }) => {
  const { user } = useAuth();
  const [sales, setSales] = useState<RetailSale[]>([]);
  const [walkin, setWalkin] = useState<(RetailSalePayload & { total: number }) | null>(null);
  const [selectedSale, setSelectedSale] = useState<RetailSale | null>(null);
  const [refundSale, setRefundSale] = useState<RetailSale | null>(null);
  const idempotencyRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await productsApi.listSales({ page: 1, limit: 30 });
      setSales(result.data);
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível carregar vendas.'), 'error');
    }
  }, [onNotify]);

  useEffect(() => { void load(); }, [load]);

  if (loadError) return <p className="text-sm text-danger">{loadError}</p>;

  const openSale = async (sale: RetailSale) => {
    try {
      const detail = await productsApi.getSale(sale.id);
      setSelectedSale(detail);
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível carregar a venda.'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <p className="font-bold text-text-primary">Venda avulsa</p>
        <RetailCheckoutBlock
          canOverridePrice={canManage}
          requireClientForFiado
          onChange={payload => {
            if (!payload) {
              idempotencyRef.current = null;
              setWalkin(null);
              return;
            }
            if (!idempotencyRef.current) {
              idempotencyRef.current = `walkin:${user?.id ?? 'anon'}:${Date.now()}`;
            }
            setWalkin({ ...payload, idempotencyKey: idempotencyRef.current });
          }}
        />
        <button
          type="button"
          disabled={!walkin}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-fg disabled:opacity-50"
          onClick={async () => {
            if (!walkin) return;
            try {
              await productsApi.createSale({
                paymentMethod: walkin.paymentMethod,
                items: walkin.items,
                discount: walkin.discount,
                clientId: walkin.clientId,
                idempotencyKey: walkin.idempotencyKey,
              });
              onNotify?.('Venda concluída.', 'success');
              setWalkin(null);
              idempotencyRef.current = null;
              await load();
              onReload();
            } catch (err) {
              onNotify?.(getErrorMessage(err, 'Não foi possível concluir a venda.'), 'error');
            }
          }}
        >
          Concluir venda {walkin ? `· ${productMoney.format(walkin.total)}` : ''}
        </button>
      </div>

      <div className="space-y-2">
        {sales.map(sale => (
          <div key={sale.id} className="rounded-xl border border-border bg-surface px-3 py-3 text-sm">
            <button type="button" onClick={() => void openSale(sale)} className="w-full text-left">
              <div className="flex justify-between">
                <span className="font-semibold text-text-primary">{productMoney.format(sale.total)} · {PAYMENT_LABEL[sale.paymentMethod] ?? sale.paymentMethod}</span>
                <span className="text-text-muted">{SALE_STATUS_LABEL[sale.status] ?? sale.status}</span>
              </div>
              <p className="text-xs text-text-secondary">{new Date(sale.soldAt).toLocaleString('pt-BR')}</p>
              <p className="text-xs text-text-muted">{sale.lines.map(line => `${line.quantity}× ${line.productName}`).join(', ')}</p>
            </button>
            {canRefund && sale.status === 'COMPLETED' && (
              <button type="button" className="mt-2 text-xs font-bold text-danger" onClick={() => setRefundSale(sale)}>
                Estornar
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedSale && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-4">
            <div className="mb-3 flex justify-between">
              <h3 className="font-bold text-text-primary">Detalhe da venda</h3>
              <button type="button" onClick={() => setSelectedSale(null)} className="text-sm text-text-muted">Fechar</button>
            </div>
            <p className="text-sm text-text-secondary">{new Date(selectedSale.soldAt).toLocaleString('pt-BR')}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {selectedSale.lines.map(line => (
                <li key={line.id} className="flex justify-between text-text-primary">
                  <span>{line.quantity}× {line.productName}</span>
                  <span>{productMoney.format(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <RefundSaleModal
        open={Boolean(refundSale)}
        sale={refundSale}
        onClose={() => setRefundSale(null)}
        onConfirm={async payload => {
          if (!refundSale) return;
          await productsApi.refundSale(refundSale.id, payload);
          onNotify?.('Estorno registrado.', 'success');
          await load();
          onReload();
        }}
      />
    </div>
  );
};
