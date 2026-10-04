import React from 'react';
import {
  LuCircleAlert as AlertCircle,
  LuClock as Clock,
  LuSettings as Settings,
} from 'react-icons/lu';
import { DaySchedule } from '../../types';
import { ModalShell } from '../../components/patterns/ModalShell';

interface ClosedSalonJoinModalProps {
  open: boolean;
  schedule: DaySchedule[];
  submitting?: boolean;
  /** Índice do dia destacado (0=domingo). Padrão: dia atual — fixe em stories/testes. */
  todayIndex?: number;
  onAddAnyway: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export const ClosedSalonJoinModal: React.FC<ClosedSalonJoinModalProps> = ({
  open,
  schedule,
  submitting = false,
  todayIndex,
  onAddAnyway,
  onOpenSettings,
  onClose,
}) => {
  const activeIndex = todayIndex ?? new Date().getDay();
  const today = schedule[activeIndex];

  return (
    <ModalShell
      open={open}
      title="O salão está fechado"
      titleId="closed-salon-title"
      icon={<AlertCircle size={22} />}
      iconClassName="bg-warning/15 text-warning"
      borderClassName="border-warning/40"
      loading={submitting}
      onClose={onClose}
      body={
        <>
          <div className="rounded-xl border border-border bg-bg p-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
              <Clock size={14} /> Horários de funcionamento
            </p>
            <div className="mt-2 grid grid-cols-1 gap-1 text-sm">
              {schedule.map((day, index) => (
                <div
                  key={`${day.dayName}-${index}`}
                  className={`flex justify-between rounded px-2 py-1 ${index === activeIndex ? 'bg-warning/10 text-warning' : 'text-text-secondary'}`}
                >
                  <span>
                    {day.dayName}
                    {index === activeIndex ? ' (hoje)' : ''}
                  </span>
                  <span>{day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Fechado'}</span>
                </div>
              ))}
            </div>
            {today && !today.isOpen && (
              <p className="mt-2 text-xs text-warning">Hoje não há expediente configurado.</p>
            )}
          </div>

          <p className="mt-4 text-sm font-semibold text-text-primary">O que você deseja fazer?</p>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onAddAnyway}
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              Adicionar cliente e manter fechado
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={onOpenSettings}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-text-primary transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              <Settings size={16} /> Abrir/ajustar salão nas configurações
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text-primary disabled:opacity-50"
            >
              Voltar
            </button>
          </div>
        </>
      }
    >
      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
        Você tem certeza de que deseja adicionar este cliente enquanto o salão está fechado?
      </p>
    </ModalShell>
  );
};
