import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { ClientPackage, ShopSettings, StaffMember } from '../../types';
import { schedulingApi } from '../../infra/schedulingApi';
import { packagesApi } from '../../infra/packagesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import {
  AvailabilitySlot,
  generateTimeSlots,
  getDaySchedule,
  isShopDayClosed,
  isSlotAvailable,
  addDays,
} from '../../utils/schedulingUtils';
import { ThemedCalendar, toLocalISO } from '../ui/ThemedCalendar';

interface BookPackageSessionsModalProps {
  pkg: ClientPackage;
  staff: StaffMember[];
  settings: ShopSettings;
  onClose: () => void;
  onBooked: () => Promise<void> | void;
}

interface PickedSlot {
  date: string;
  time: string;
  staffId: string;
}

export const BookPackageSessionsModal: React.FC<BookPackageSessionsModalProps> = ({
  pkg,
  staff,
  settings,
  onClose,
  onBooked,
}) => {
  const [date, setDate] = useState(toLocalISO(new Date()));
  const [staffId, setStaffId] = useState('any');
  const [occupancy, setOccupancy] = useState<AvailabilitySlot[]>([]);
  const [picked, setPicked] = useState<PickedSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = toLocalISO(new Date());
  const maxDate = toLocalISO(addDays(new Date(), 30));

  useEffect(() => {
    let cancelled = false;
    schedulingApi
      .getAvailability(pkg.barbershopId, date, staffId !== 'any' ? staffId : undefined)
      .then(slots => {
        if (!cancelled) setOccupancy(slots);
      })
      .catch(() => {
        if (!cancelled) setOccupancy([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pkg.barbershopId, date, staffId]);

  const daySchedule = useMemo(
    () => getDaySchedule(new Date(date + 'T12:00:00'), settings.schedule),
    [date, settings.schedule]
  );
  const isDateClosed = isShopDayClosed(new Date(date + 'T12:00:00'), settings);
  const timeSlots = useMemo(() => {
    if (isDateClosed) return [];
    return generateTimeSlots(daySchedule.openTime, daySchedule.closeTime).filter(slot =>
      isSlotAvailable(slot, staffId, occupancy, staff.length)
    );
  }, [isDateClosed, daySchedule, staffId, occupancy, staff.length]);

  const remaining = pkg.remainingSessions - picked.length;

  const toggleSlot = (time: string) => {
    const key = `${date}|${time}|${staffId}`;
    const exists = picked.find(s => `${s.date}|${s.time}|${s.staffId}` === key);
    if (exists) {
      setPicked(prev => prev.filter(s => `${s.date}|${s.time}|${s.staffId}` !== key));
      return;
    }
    if (picked.length >= pkg.remainingSessions) return;
    setPicked(prev => [...prev, { date, time, staffId }]);
  };

  const handleSubmit = async () => {
    if (picked.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await packagesApi.book(
        pkg.id,
        picked.map(s => ({
          date: s.date,
          time: s.time,
          staffId: s.staffId === 'any' ? null : s.staffId,
        }))
      );
      await onBooked();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[min(88dvh,calc(100dvh-2.5rem))] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Agendar sessões</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {pkg.packageName} · restam {remaining} de {pkg.remainingSessions}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-secondary"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto ag-scroll px-5 py-5 space-y-5">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl px-3 py-2 flex gap-2">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStaffId('any')}
              className={`px-3 py-2 rounded-xl border text-sm font-semibold ${
                staffId === 'any'
                  ? 'bg-accent/15 border-accent'
                  : 'bg-bg border-border text-text-secondary'
              }`}
            >
              Qualquer
            </button>
            {staff.map(member => (
              <button
                key={member.id}
                type="button"
                onClick={() => setStaffId(member.id)}
                className={`px-3 py-2 rounded-xl border text-sm font-semibold ${
                  staffId === member.id
                    ? 'bg-accent/15 border-accent'
                    : 'bg-bg border-border text-text-secondary'
                }`}
              >
                {member.name}
              </button>
            ))}
          </div>

          <ThemedCalendar
            value={date}
            min={today}
            max={maxDate}
            isDayDisabled={day => isShopDayClosed(day, settings)}
            onChange={setDate}
          />

          <div>
            <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Clock size={12} /> Horários de{' '}
              {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
            </label>
            {isDateClosed ? (
              <p className="text-sm text-danger">Fechado neste dia.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(slot => {
                  const selected = picked.some(
                    s => s.date === date && s.time === slot && s.staffId === staffId
                  );
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`py-2.5 rounded-lg text-xs font-bold border min-h-[40px] ${
                        selected
                          ? 'bg-accent text-accent-fg border-accent'
                          : 'bg-bg text-text-secondary border-border'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {picked.length > 0 && (
            <ul className="text-xs text-text-secondary space-y-1">
              {picked.map(s => (
                <li key={`${s.date}-${s.time}-${s.staffId}`}>
                  {new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR')} às {s.time}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-border px-5 py-4">
          <button
            type="button"
            disabled={submitting || picked.length === 0}
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl font-bold text-accent-fg bg-accent hover:bg-accent-hover disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {submitting ? 'Agendando…' : `Confirmar ${picked.length} horário(s)`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
