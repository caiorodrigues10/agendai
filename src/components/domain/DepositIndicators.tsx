import React, { useEffect, useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { depositsApi, AppointmentDeposit } from '../../infra/depositsApi';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-green-500/10 text-green-400 border-green-500/30',
  EXPIRED: 'bg-red-500/10 text-red-400 border-red-500/30',
  WAIVED: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
  REFUNDED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  EXPIRED: 'Expirado',
  WAIVED: 'Dispensado',
  REJECTED: 'Rejeitado',
  REFUNDED: 'Reembolsado',
};

interface DepositIndicatorsProps {
  appointmentId: string;
  compact?: boolean;
  onStatusChange?: () => void;
}

export const DepositIndicators: React.FC<DepositIndicatorsProps> = ({
  appointmentId,
  compact = false,
  onStatusChange,
}) => {
  const [deposit, setDeposit] = useState<AppointmentDeposit | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    depositsApi.getAppointmentDeposit(appointmentId)
      .then(data => { if (!cancelled) setDeposit(data); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [appointmentId]);

  const handleConfirm = async () => {
    if (!deposit) return;
    setActionLoading(true);
    try {
      await depositsApi.confirm(deposit.appointmentId, { paymentMethod: 'PIX' });
      const updated = await depositsApi.getAppointmentDeposit(appointmentId);
      setDeposit(updated);
      onStatusChange?.();
    } catch { /* silent */ }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!deposit) return;
    setActionLoading(true);
    try {
      await depositsApi.reject(deposit.appointmentId);
      const updated = await depositsApi.getAppointmentDeposit(appointmentId);
      setDeposit(updated);
      onStatusChange?.();
    } catch { /* silent */ }
    finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
        <Loader2 className="animate-spin" size={12} /> carregando sinal...
      </span>
    );
  }

  if (!deposit) return null;

  const style = STATUS_STYLES[deposit.status] ?? STATUS_STYLES.PENDING;
  const label = STATUS_LABELS[deposit.status] ?? deposit.status;

  if (compact) {
    return (
      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
        {label}: {formatCurrencyBRL(deposit.expectedAmount)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>
        Sinal {label}
      </span>
      <span className="text-xs text-text-muted">
        {formatCurrencyBRL(deposit.expectedAmount)}
      </span>
      {deposit.status === 'PENDING' && (
        <>
          <span className="text-[10px] text-text-muted">
            até {formatDateBR(deposit.expiresAt)}
          </span>
          <button
            onClick={handleConfirm}
            disabled={actionLoading}
            className="inline-flex items-center gap-0.5 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success hover:bg-success/20 disabled:opacity-60"
          >
            <Check size={10} /> Confirmar
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading}
            className="inline-flex items-center gap-0.5 rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger hover:bg-danger/20 disabled:opacity-60"
          >
            <X size={10} /> Rejeitar
          </button>
        </>
      )}
    </div>
  );
};
