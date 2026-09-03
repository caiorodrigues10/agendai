import React, { useState } from 'react';
import { DoorClosed, DoorOpen, RotateCcw, Ban, ListChecks, Clock } from 'lucide-react';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import type { ManualShopStatus, OpeningMode } from '../../types';

function statusCopy(open: boolean, reason?: string, queueClosed?: boolean) {
  if (queueClosed && open) return { title: 'Aberto · fila encerrada', detail: 'Ninguém mais entra na fila hoje. Quem já está continua sendo atendido.' };
  if (open) return { title: 'Aberto agora', detail: reason === 'MANUAL_OPEN' ? 'Aberto na mão até o fim do dia.' : 'Seguindo o horário da agenda.' };
  if (reason === 'MANUAL_MODE_NOT_OPENED') return { title: 'Fechado', detail: 'Modo somente manual: o salão só abre quando você apertar “Abrir salão”.' };
  if (reason === 'MANUAL_CLOSED') return { title: 'Fechado agora', detail: 'Permanece fechado até você reabrir.' };
  if (reason === 'EXCEPTION') return { title: 'Fechado hoje', detail: 'Data de fechamento no calendário.' };
  return { title: 'Fechado agora', detail: 'Fora do horário de funcionamento.' };
}

interface ShopFloorControlsProps {
  variant?: 'full' | 'compact';
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

export const ShopFloorControls: React.FC<ShopFloorControlsProps> = ({
  variant = 'full',
  onNotify,
}) => {
  const { barbershopId } = useBarbershopFilters();
  const {
    settings,
    isShopOpen,
    isQueueClosed,
    setManualStatus,
    setQueueClosed,
    setOpeningMode,
  } = useBarbershop();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'open' | 'close' | 'auto' | 'queue' | null>(null);

  if (!barbershopId || !settings) return null;

  const open = isShopOpen();
  const queueClosed = isQueueClosed();
  const copy = statusCopy(open, settings.openState?.reason, queueClosed);
  const openingMode: OpeningMode = settings.openingMode ?? 'SCHEDULE';
  const manualStatus: ManualShopStatus = settings.manualStatus ?? 'AUTO';

  const run = async (key: string, action: () => Promise<void>, ok: string) => {
    setBusy(key);
    setConfirm(null);
    try {
      await action();
      onNotify?.(ok, 'success');
    } catch (err) {
      onNotify?.(getErrorMessage(err, 'Não foi possível atualizar o status do salão.'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const confirmLabel =
    confirm === 'open'
      ? 'Abrir o salão agora? Clientes poderão entrar na fila.'
      : confirm === 'close'
        ? 'Fechar o salão agora? A fila pública e o status de hoje ficam bloqueados.'
        : confirm === 'auto'
          ? 'Voltar ao automático? O horário da agenda volta a valer.'
          : confirm === 'queue'
            ? queueClosed
              ? 'Reabrir a fila para novos clientes?'
              : 'Encerrar a fila por hoje? Quem já está continua; agendamentos seguem valendo.'
            : null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Status do salão</p>
          <h3 className={`text-lg font-bold ${open ? 'text-success' : 'text-danger'}`}>{copy.title}</h3>
          <p className="text-xs text-text-secondary mt-1">{copy.detail}</p>
        </div>
        <span
          className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${
            open ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'
          }`}
        >
          {open ? 'Aberto' : 'Fechado'}
        </span>
      </div>

      {confirm && (
        <div className="mb-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-text-primary">
          <p>{confirmLabel}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => {
                if (confirm === 'open') void run('open', () => setManualStatus('OPEN'), 'Salão aberto.');
                if (confirm === 'close') void run('close', () => setManualStatus('CLOSED'), 'Salão fechado.');
                if (confirm === 'auto') void run('auto', () => setManualStatus('AUTO'), 'Voltando ao horário automático.');
                if (confirm === 'queue') {
                  void run(
                    'queue',
                    () => setQueueClosed(!queueClosed),
                    queueClosed ? 'Fila reaberta.' : 'Fila encerrada por hoje.'
                  );
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-accent text-accent-fg text-xs font-bold"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={() => setConfirm(null)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {open ? (
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => setConfirm('close')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-danger/40 text-danger text-sm font-bold hover:bg-danger/10"
          >
            <DoorClosed size={16} /> Fechar salão agora
          </button>
        ) : (
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => setConfirm('open')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-fg text-sm font-bold"
          >
            <DoorOpen size={16} /> Abrir salão agora
          </button>
        )}
        {manualStatus !== 'AUTO' && (
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => setConfirm('auto')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-text-secondary text-sm font-bold hover:bg-surface-2"
          >
            <RotateCcw size={16} /> Voltar ao automático
          </button>
        )}
        <button
          type="button"
          disabled={Boolean(busy) || !open}
          onClick={() => setConfirm('queue')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-text-secondary text-sm font-bold hover:bg-surface-2 disabled:opacity-50"
        >
          {queueClosed ? <ListChecks size={16} /> : <Ban size={16} />}
          {queueClosed ? 'Reabrir fila' : 'Fechar fila'}
        </button>
      </div>

      {variant === 'full' && (
        <div className="mt-5 pt-4 border-t border-border">
          <h4 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
            <Clock size={14} className="text-accent" /> Como o salão abre
          </h4>
          <p className="text-xs text-text-muted mb-3">
            No modo automático, a agenda semanal abre sozinha. No modo manual, só abre quando você apertar o botão.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  value: 'SCHEDULE' as const,
                  title: 'Automático pelo horário',
                  description: 'Abre e fecha conforme a agenda semanal.',
                },
                {
                  value: 'MANUAL' as const,
                  title: 'Somente quando eu abrir',
                  description: 'Nunca abre sozinho. Evita fila antes de você chegar.',
                },
              ] as const
            ).map(opt => {
              const active = openingMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={Boolean(busy) || active}
                  onClick={() =>
                    void run('mode', () => setOpeningMode(opt.value), 'Modo de abertura atualizado.')
                  }
                  className={`text-left rounded-xl border-2 p-3 transition-all ${
                    active ? 'border-accent bg-accent/10' : 'border-border bg-bg hover:border-accent/40'
                  }`}
                >
                  <span className="block text-sm font-bold text-text-primary">{opt.title}</span>
                  <span className="block text-[11px] text-text-muted mt-1">{opt.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
