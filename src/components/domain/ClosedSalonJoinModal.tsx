import React from 'react';
import FocusLock from 'react-focus-lock';
import { AlertCircle, Clock, Settings } from 'lucide-react';
import { DaySchedule } from '../../types';

interface ClosedSalonJoinModalProps {
  open: boolean;
  schedule: DaySchedule[];
  submitting?: boolean;
  onAddAnyway: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export const ClosedSalonJoinModal: React.FC<ClosedSalonJoinModalProps> = ({
  open,
  schedule,
  submitting = false,
  onAddAnyway,
  onOpenSettings,
  onClose,
}) => {
  if (!open) return null;
  const todayIndex = new Date().getDay();
  const today = schedule[todayIndex];

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 p-4 sm:items-center">
      <FocusLock returnFocus>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="closed-salon-title"
          className="w-full max-w-md rounded-2xl border border-warning/40 bg-surface p-5 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-warning/15 p-2 text-warning">
              <AlertCircle size={22} />
            </div>
            <div>
              <h2 id="closed-salon-title" className="text-lg font-bold text-text-primary">
                O salão está fechado
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                Você tem certeza de que deseja adicionar este cliente enquanto o salão está fechado?
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-bg p-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
              <Clock size={14} /> Horários de funcionamento
            </p>
            <div className="mt-2 grid grid-cols-1 gap-1 text-sm">
              {schedule.map((day, index) => (
                <div
                  key={`${day.dayName}-${index}`}
                  className={`flex justify-between rounded px-2 py-1 ${index === todayIndex ? 'bg-warning/10 text-warning' : 'text-text-secondary'}`}
                >
                  <span>{day.dayName}{index === todayIndex ? ' (hoje)' : ''}</span>
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
        </div>
      </FocusLock>
    </div>
  );
};
