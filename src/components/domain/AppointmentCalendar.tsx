import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Appointment, Service, ShopSettings, StaffMember } from '../../types';
import {
  addDays,
  formatDateISO,
  generateTimeSlots,
  getDaySchedule,
  getServiceDuration,
  getServiceName,
  getStaffName
} from '../../utils/schedulingUtils';
import { AppointmentBookingModal } from './AppointmentBookingModal';
import { AvailabilitySlot } from '../../utils/schedulingUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Users,
  User,
  CheckCircle,
  Trash2,
  Phone
} from 'lucide-react';

type AgendaView = 'salon' | 'professional';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  currentUserId?: string;
  currentUserRole?: string;
  occupancy: AvailabilitySlot[];
  onBook: (data: any) => Promise<void>;
  onCancel: (id: string) => void;
  onCheckIn: (appointment: Appointment) => void;
  onDateChange?: (date: string) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  services,
  staff,
  settings,
  currentUserId,
  currentUserRole,
  occupancy,
  onBook,
  onCancel,
  onCheckIn,
  onDateChange
}) => {
  const [selectedDate, setSelectedDate] = useState(() => formatDateISO(new Date()));
  const [view, setView] = useState<AgendaView>(
    currentUserRole === 'employee' ? 'professional' : 'salon'
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    currentUserRole === 'employee' && currentUserId ? currentUserId : staff[0]?.id ?? 'any'
  );
  const [showBooking, setShowBooking] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const onDateChangeRef = useRef(onDateChange);
  onDateChangeRef.current = onDateChange;

  useEffect(() => {
    onDateChangeRef.current?.(selectedDate);
  }, [selectedDate]);

  const dateObj = useMemo(() => new Date(selectedDate + 'T12:00:00'), [selectedDate]);
  const daySchedule = getDaySchedule(dateObj, settings.schedule);
  const isClosed = !daySchedule?.isOpen;

  const timeSlots = useMemo(() => {
    if (!daySchedule?.isOpen) return [];
    return generateTimeSlots(daySchedule.openTime, daySchedule.closeTime);
  }, [daySchedule]);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === selectedDate && a.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  const columns = useMemo(() => {
    if (view === 'professional') {
      const id = selectedStaffId === 'any' ? null : selectedStaffId;
      return [{ id, label: getStaffName(id, staff) }];
    }
    const cols = staff.map((s) => ({ id: s.id, label: s.name }));
    cols.push({ id: null as unknown as string, label: 'Sem prof.' });
    return cols;
  }, [view, selectedStaffId, staff]);

  const getAppointmentsForColumn = (columnId: string | null) => {
    return dayAppointments.filter((a) => {
      const apptStaff = a.staffId === 'any' ? null : a.staffId;
      if (view === 'professional') {
        const filterId = selectedStaffId === 'any' ? null : selectedStaffId;
        return apptStaff === filterId || (filterId === null && !apptStaff);
      }
      if (columnId === null) return !apptStaff || apptStaff === 'any';
      return apptStaff === columnId;
    });
  };

  const navigateDate = (delta: number) => {
    setSelectedDate(formatDateISO(addDays(dateObj, delta)));
  };

  const dateLabel = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <CalendarDays className="text-accent" size={20} />
          Agenda
        </h3>
        <button
          onClick={() => setShowBooking(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-accent-fg text-xs font-bold rounded-xl transition-colors"
        >
          <Plus size={16} /> Novo
        </button>
      </div>

      <div className="flex bg-surface p-1 rounded-xl border border-border">
        <button
          onClick={() => setView('salon')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            view === 'salon' ? 'bg-surface-2 text-text-primary' : 'text-text-muted'
          }`}
        >
          <Users size={14} /> Salão
        </button>
        <button
          onClick={() => setView('professional')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            view === 'professional' ? 'bg-surface-2 text-text-primary' : 'text-text-muted'
          }`}
        >
          <User size={14} /> Profissional
        </button>
      </div>

      {view === 'professional' && (
        <select
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm"
        >
          {currentUserRole !== 'employee' && <option value="any">Qualquer profissional</option>}
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-3">
        <button onClick={() => navigateDate(-1)} className="p-2 text-text-secondary hover:text-text-primary rounded-lg">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <button
            onClick={() => setSelectedDate(formatDateISO(new Date()))}
            className="text-xs text-accent font-bold hover:underline mb-0.5"
          >
            Hoje
          </button>
          <p className="text-sm font-bold text-text-primary capitalize">{dateLabel}</p>
        </div>
        <button onClick={() => navigateDate(1)} className="p-2 text-text-secondary hover:text-text-primary rounded-lg">
          <ChevronRight size={20} />
        </button>
      </div>

      {isClosed ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
          <p className="text-text-muted">Salão fechado neste dia.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div
            className="grid border-b border-border"
            style={{ gridTemplateColumns: `3.5rem repeat(${columns.length}, 1fr)` }}
          >
            <div className="p-2 text-[10px] text-text-muted font-bold border-r border-border" />
            {columns.map((col) => (
              <div
                key={String(col.id)}
                className="p-2 text-[10px] text-text-secondary font-bold text-center border-r border-border last:border-r-0 truncate"
              >
                {col.label}
              </div>
            ))}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="grid border-b border-border/50 min-h-[2.75rem]"
                style={{ gridTemplateColumns: `3.5rem repeat(${columns.length}, 1fr)` }}
              >
                <div className="p-1.5 text-[10px] text-text-muted font-mono border-r border-border flex items-start pt-2">
                  {slot}
                </div>
                {columns.map((col) => {
                  const colAppts = getAppointmentsForColumn(col.id).filter((a) => a.time === slot);
                  return (
                    <div
                      key={String(col.id) + slot}
                      className="p-0.5 border-r border-border/50 last:border-r-0 relative min-h-[2.75rem]"
                    >
                      {colAppts.map((appt) => {
                        const duration = appt.serviceDurationMinutes ?? getServiceDuration(appt.serviceId, services);
                        const rows = Math.max(1, Math.ceil(duration / 30));
                        return (
                          <button
                            key={appt.id}
                            onClick={() => setSelectedAppt(appt)}
                            className="absolute inset-x-0.5 top-0.5 bg-accent/20 border border-accent/40 rounded-lg p-1.5 text-left hover:bg-accent/30 transition-colors z-10 overflow-hidden"
                            style={{ minHeight: `${rows * 2.5}rem` }}
                          >
                            <p className="text-[10px] font-bold text-text-primary truncate">{appt.customerName}</p>
                            <p className="text-[9px] text-accent truncate">
                              {appt.serviceName ?? getServiceName(appt.serviceId, services)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {dayAppointments.length === 0 && !isClosed && (
        <p className="text-center text-text-muted text-sm py-2">Nenhum agendamento para este dia.</p>
      )}

      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-sm p-5 space-y-4 animate-fade-in">
            <div>
              <h4 className="text-lg font-bold text-text-primary">{selectedAppt.customerName}</h4>
              <p className="text-sm text-accent">{getServiceName(selectedAppt.serviceId, services)}</p>
              <p className="text-xs text-text-muted mt-1">
                {selectedAppt.time} • {getStaffName(selectedAppt.staffId, staff)}
              </p>
              <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                <Phone size={10} /> {selectedAppt.whatsapp}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Mover para a fila de espera?')) {
                    onCheckIn(selectedAppt);
                    setSelectedAppt(null);
                  }
                }}
                className="flex-1 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
              >
                <CheckCircle size={14} /> Check-in
              </button>
              <button
                onClick={() => {
                  if (confirm('Cancelar agendamento?')) {
                    onCancel(selectedAppt.id);
                    setSelectedAppt(null);
                  }
                }}
                className="px-4 py-2.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 rounded-xl text-xs font-bold"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <button
              onClick={() => setSelectedAppt(null)}
              className="w-full py-2 text-text-secondary text-sm hover:text-text-primary"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showBooking && (
        <AppointmentBookingModal
          services={services}
          staff={staff}
          settings={settings}
          occupancy={occupancy}
          defaultDate={selectedDate}
          defaultStaffId={view === 'professional' ? selectedStaffId : undefined}
          onBook={onBook}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
};
