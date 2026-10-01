import React, { useEffect, useState } from 'react';
import {
  productsApi,
  type ProductReservation,
  type ProductReservationStatus,
} from '../../../infra/productsApi';
import { getErrorMessage } from '../../../utils/errorMessage';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { PaginationBar } from '../../ui/PaginationBar';
import { StatusBadge } from '../../ui/StatusBadge';
import { productMoney } from './productMoney';

interface Props {
  loadError: string | null;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
  onReload: () => void;
}

const PAGE_SIZE = 20;

const STATUS_FILTER_LABEL: Record<string, string> = {
  RESERVED: 'Aguardando retirada',
  PICKED_UP: 'Retiradas',
  CANCELED: 'Canceladas',
};

const STATUS_LABEL: Record<string, string> = {
  RESERVED: 'Aguardando retirada',
  PICKED_UP: 'Retirada',
  CANCELED: 'Cancelada',
};

const STATUS_TONE: Record<ProductReservationStatus, 'warning' | 'success' | 'neutral'> = {
  RESERVED: 'warning',
  PICKED_UP: 'success',
  CANCELED: 'neutral',
};

interface PendingAction {
  reservation: ProductReservation;
  status: 'PICKED_UP' | 'CANCELED';
}

const FILTERS: (ProductReservationStatus | '')[] = ['', 'RESERVED', 'PICKED_UP', 'CANCELED'];

/** Retirada não baixa estoque: o dono precisa registrar a venda na aba Vendas. */
function confirmMessageFor(pending: PendingAction | null): string {
  if (!pending) return '';
  const { quantity, productName, customerName } = pending.reservation;
  const summary = `${quantity}× ${productName} de ${customerName}.`;
  if (pending.status === 'CANCELED') return summary;
  return `${summary} Registre a venda na aba Vendas para baixar o estoque.`;
}

function ReservationRow({
  reservation,
  onPick,
  onCancel,
}: {
  reservation: ProductReservation;
  onPick: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-text-primary">
            {reservation.quantity}× {reservation.productName}
          </p>
          <p className="truncate text-xs text-text-secondary">
            {reservation.customerName} · {reservation.whatsapp}
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted">
            {productMoney.format(reservation.unitPrice * reservation.quantity)} · reservado em{' '}
            {new Date(reservation.createdAt).toLocaleString('pt-BR')}
          </p>
          <p className="text-[11px] text-text-muted">
            Retirada até {new Date(reservation.expiresAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <StatusBadge
          status={reservation.status}
          labels={STATUS_LABEL}
          tone={STATUS_TONE[reservation.status]}
        />
      </div>

      {reservation.status === 'RESERVED' && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onPick}
            className="rounded-lg border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-bold text-success"
          >
            Marcar como retirada
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

export const ProductReservationsPanel: React.FC<Props> = ({ loadError, onNotify, onReload }) => {
  const [rows, setRows] = useState<ProductReservation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ProductReservationStatus | ''>('');
  const [busy, setBusy] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pending, setPending] = useState<PendingAction | null>(null);

  useEffect(() => {
    let alive = true;
    productsApi
      .listReservations({ status: status || undefined, page, limit: PAGE_SIZE })
      .then(result => {
        if (!alive) return;
        setRows(result.data);
        setTotal(result.meta.total);
        setBusy(false);
      })
      .catch(err => {
        if (!alive) return;
        onNotify?.(getErrorMessage(err, 'Não foi possível carregar reservas.'), 'error');
        setRows([]);
        setTotal(0);
        setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [status, page, refreshKey, onNotify]);

  if (loadError) return <p className="text-sm text-danger">{loadError}</p>;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const changeFilter = (value: ProductReservationStatus | '') => {
    setBusy(true);
    setStatus(value);
    setPage(1);
  };

  const changePage = (next: number) => {
    setBusy(true);
    setPage(next);
  };

  const confirm = async () => {
    if (!pending) return;
    try {
      await productsApi.updateReservationStatus(pending.reservation.id, pending.status);
      onNotify?.(
        pending.status === 'PICKED_UP'
          ? 'Reserva marcada como retirada.'
          : 'Reserva cancelada.',
        'success'
      );
      setPending(null);
      setBusy(true);
      setRefreshKey(k => k + 1);
      onReload();
    } catch (err) {
      setPending(null);
      onNotify?.(getErrorMessage(err, 'Não foi possível atualizar a reserva.'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(value => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => changeFilter(value)}
            className={`rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${
              status === value
                ? 'border-accent/30 bg-selection text-accent'
                : 'border-border bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {value ? STATUS_FILTER_LABEL[value] : 'Todas'}
          </button>
        ))}
        <span className="ml-auto text-xs font-bold text-text-secondary">{total} reserva(s)</span>
      </div>

      {busy && rows.length === 0 ? (
        <p className="text-sm text-text-muted">Carregando reservas…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border/60 px-4 py-10 text-center text-sm text-text-muted">
          {status
            ? 'Nenhuma reserva com este status.'
            : 'Nenhuma reserva de produto ainda. Elas aparecem aqui quando um cliente reservar na página pública.'}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(reservation => (
            <ReservationRow
              key={reservation.id}
              reservation={reservation}
              onPick={() => setPending({ reservation, status: 'PICKED_UP' })}
              onCancel={() => setPending({ reservation, status: 'CANCELED' })}
            />
          ))}
        </div>
      )}

      <PaginationBar page={page} totalPages={totalPages} onPageChange={changePage} />

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.status === 'CANCELED' ? 'Cancelar reserva?' : 'Confirmar retirada?'}
        message={confirmMessageFor(pending)}
        confirmLabel={pending?.status === 'CANCELED' ? 'Cancelar reserva' : 'Confirmar retirada'}
        variant={pending?.status === 'CANCELED' ? 'danger' : 'default'}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
};
